import fs from 'fs';
import { Worker } from "worker_threads";

// const mathwasm = fs.readFileSync('./clock.wasm');

// console.log("Got here 1");
// const math = await WebAssembly.instantiate(new Uint8Array(mathwasm), {}).
//     then (res => res.instance.exports);
// console.log("Got here 2");
// console.log(math.square(10))


// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fetch from "node-fetch";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

async function start(config) {
	const BM = 128*1024*1024; // Eviction buffer
	const WP = 64*1024; // A WebAssembly page has a constant size of 64KB
	const SZ = BM/WP; // 128 hardcoded value in wasm

	// Shared memory
	const memory = new WebAssembly.Memory({initial: SZ, maximum: SZ, shared: true});

	// const resp = fs.readFileSync(__dirname + '/clock.wasm');
	// const module = await WebAssembly.instantiate(new Uint8Array(resp)).
	// 	then (res => res.instance.exports);

	// Clock thread
	// const resp = await fetch('clock.wasm');
	// const bin = await resp.arrayBuffer();
	// const module = new WebAssembly.Module(bin);
	const module1 = new WebAssembly.Module(fs.readFileSync('./clock.wasm'));
	
	// console.log("Got here 1");
	const clock = new Worker('./wasmWorker.js');
	clock.postMessage({"data":{"module1": module1, "memory": memory}});

	// console.log("Got here 2");
	// Finder thread
	// const resp2 = await fetch('poc.wasm');
	// const bin2 = await resp2.arrayBuffer();
	// const module2 = new WebAssembly.Module(bin2);
	const module2 = new WebAssembly.Module(fs.readFileSync('./poc.wasm'));
	const finder = new Worker('./finder.js');
	
	// console.log("Got here 3");
	finder.on("message", (evt) => {
		let msg = evt.message.data;
		switch (msg.type) {
			case 'log':
				log (...msg.str);
				// msg.str.map(e => DebugPrint(e)); // used for verification
				break;
			case 'eof':
				clock.terminate();
				finder.terminate();
			default:
		}
	});
	finder.postMessage({"data":{"module1": module2, "memory": memory, "conf": config}});
	
	// console.log("Got here 4");
	return false;
}

function log(...s){
	// output.innerText += s + '\n';
    console.log(...s);
}
// function clearLog(){
// 	output.innerText = '';
// }
function getConf() {
    let b=10000
    let assoc=12 // 4-16
    let offset=1 // 0-64
    let stride=4096 // 64*n
    let conflict=false // false
    // clearLog();
	// let f = document.getElementById('config');
	// let b = parseInt(f.b.value), offset = parseInt(f.offset.value), assoc = parseInt(f.assoc.value), stride = parseInt(f.stride.value), conflict = (f.conflict.value === "yes");
	return {
		B :			isNaN(b) ? 6000 : b,
		ASSOC :		isNaN(assoc) ? 16 : assoc,
		OFFSET :	isNaN(offset) ? 63 : offset,
		STRIDE :	isNaN(stride) ? 4096 : stride,
		CONFLICT :	conflict,
	};
}

console.log(getConf());
start(getConf());