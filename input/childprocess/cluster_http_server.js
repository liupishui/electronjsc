const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
let workers = [];
if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);

    // 创建工作进程
    for (let i = 0; i < numCPUs; i++) {
        let worker = cluster.fork()
        workers.push(worker);
        worker.on('online',function(){
            console.log('2222asd');
        });
        worker.on('message',(message)=>{
            console.log(message);
            workers.forEach(function(worker){
                worker.send({message:'message from master'});
            });
        })
    }
    workers.forEach(function(worker){
        worker.send({message:'message from master'});
    });
    // for (const id in cluster.workers) {
    //     cluster.workers[id].on('message', ()=>{
    //         console.log(1111);
    //     });
    // }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`);
    });
} else {
    process.on('message',function(msg){
        console.log(msg,process.pid);
    })
    // 在工作进程中创建HTTP服务器，并添加请求处理的回调函数
    let test = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(true)
            }, 10 * 1000);
        });
    };
    http.createServer(async (req, res) => {
        console.log(process.pid);
        process.send({message:'buzhidao'});
        res.writeHead(200);
        await test();
        res.end('你正在访问进程 ' + process.pid + '\n');
    }).listen(8000, () => {
        console.log(`工作进程 ${process.pid} 中的HTTP服务器已启动`);
    });
    // 轮询负载均衡
    let workerIndex = 0;
    
    cluster.on('online', (worker) => {
        console.log(worker);
        workerIndex = (workerIndex + 1) % numCPUs;
        console.log(`请求被分配到工作进程 ${worker.process.pid}`);
    });
}

// 添加错误处理
process.on('uncaughtException', (err) => {
    console.error(`工作进程 ${process.pid} 发生未捕获的异常:`, err);
    process.exit(1);
});
