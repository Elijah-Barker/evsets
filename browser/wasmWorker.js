// const { Worker, isMainThread, parentPort } = require('node:worker_threads');
import { Worker, isMainThread, parentPort }  from "worker_threads";

var onmessage = function (data) {
    const { module1, memory, cb } = data;
    const instance = new WebAssembly.Instance(module1, { "env": { "mem": memory } });
    if (cb) {
        let fn = new Function('instance', 'mem', cb);
        fn(instance, memory);
    }
}

parentPort.on('data', function (data) {
    onmessage(data);
    // parentPort.postMessage(message);
});