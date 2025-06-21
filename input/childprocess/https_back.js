const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const dns = require('dns');
// Set default result order for DNS resolution
dns.setDefaultResultOrder('ipv4first');
let getRedisClient = async function (redisServerInfo) {
    let redis = require('redis');
    let client = await redis.createClient({ url:`redis://127.0.0.1:${redisServerInfo.tcp_port}`}).on('error', error => { console.log('Redis Client Error', error) }).connect();
    return client;
}
if (cluster.isMaster) {
    (async () => {
        console.log(`主进程 ${process.pid} 正在运行`);
        const EventEmitter = require('events');
        // 创建一个新的 EventEmitter 实例
        const redisEmitter = new EventEmitter();
        redisEmitter.on('processReady',async function(redisServerInfo){
            let redisClient = await getRedisClient(redisServerInfo);
            redisClient.set('person',JSON.stringify({name:'小李'}));
            for(let id in cluster.workers){
                cluster.workers[id].send(redisServerInfo);
            }   
        })

        process.on('message',(redisServerInfo)=>{
            redisEmitter.emit('processReady',redisServerInfo);
        })
        // 创建工作进程
        for (let i = 0; i < numCPUs; i++) {
            let worker = cluster.fork()
            // workers.push(worker);
            // worker.on('online',function(){
            //     console.log('');
            // });
            // worker.on('message', (message) => {
            //     console.log(message);
            //     workers.forEach(function (worker) {
            //         worker.send({ message: 'message from master' });
            //     });
            // })
        }
        // workers.forEach(function (worker) {
        //     worker.send({ message: 'message from master' });
        // });
        // for (const id in cluster.workers) {
        //     cluster.workers[id].on('message', ()=>{
        //         console.log(1111);
        //     });
        // }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`工作进程 ${worker.process.pid} 已退出`);
        });

        //redis
        // await client.set('user',{name:'yaoming'})

    })()
} else {
    (async function () {
        
        // 在工作进程中创建HTTP服务器，并添加请求处理的回调函数
        let redisClient = false;
        const EventEmitter = require('events');
        // 创建一个新的 EventEmitter 实例
        const redisEmitter = new EventEmitter();
        redisEmitter.on('workerReady',async function(redisServerInfo){
            redisClient = await getRedisClient(redisServerInfo);
        })
        process.on('message',(redisServerInfo)=>{
            redisEmitter.emit('workerReady',redisServerInfo);
        })
        let sleep = function (time = 10000) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(true)
                }, time);
            });
        };
        // (async()=>{
        //     let redis = require('redis');
        //     let client = await redis.createClient().on('error',error=>{console.log('Redis Client Error',error)}).connect();
        //     let data = await client.get('user')
        //     console.log(data)
        // })()
        http.createServer(async (req, res) => {
            //console.log('====',process.pid);
            // process.send({message:'buzhidao'});
            res.writeHead(200);
            if(redisClient){
                let data = await redisClient.get('person')
                res.write(data?data:'没有person');
            }
            res.end('你正在访问进程 ' + process.pid + '\n');
        }).listen(8000, () => {
            console.log(`工作进程 ${process.pid} 中的HTTP服务器已启动`);
        });
        // // 轮询负载均衡
        // let workerIndex = 0;

        // cluster.on('online', (worker) => {
        //     console.log(worker);
        //     workerIndex = (workerIndex + 1) % numCPUs;
        //     console.log(`请求被分配到工作进程 ${worker.process.pid}`);
        // });

    })();
}

// 添加错误处理
process.on('uncaughtException', (err) => {
    console.error(`工作进程 ${process.pid} 发生未捕获的异常:`, err);
    process.exit(1);
});
