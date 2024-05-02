// const { Worker, isMainThread, parentPort } = require('node:worker_threads');
import { Worker, isMainThread, parentPort }  from "worker_threads";

var onmessage = async function start(evt) {
    log("WasmWorker Got Event...");
    const { module1, memory } = evt.data;
    const instance = new WebAssembly.Instance(module1, { "env": { "mem": memory } });
    // if (cb) {
    //     let fn = new Function('instance', 'mem', cb);
    //     fn(instance, memory);
    // }
    var cl = instance.exports;
    log("Starting clock...");
    cl.clock_main();
    log("Clock done.");
}

// Send log to main thread
function log(...args) {
	parentPort.postMessage({"message":{"data":{"type": 'log', "str": args}}});
}

// parentPort.on('data', function (data) {
//     onmessage(data);
//     // parentPort.postMessage(message);
// });

parentPort.on('message', (message) => {
    onmessage(message);
    // parentPort.postMessage(message);
});