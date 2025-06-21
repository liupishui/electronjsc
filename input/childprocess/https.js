const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const dns = require('dns');
const { Console } = require('console');
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
            const res1 = await redisClient.geoAdd('bikes:rentable', { 
            longitude: 121.442685,
            latitude: 31.247788,
            member: '上海'
            });
            console.log(res1)  // 1

            const res2 = await redisClient.geoAdd('bikes:rentable', {
            longitude: 116.403694,
            latitude: 39.920248,
            member: '北京'
            });
            console.log(res2)  // 1

            const res3 = await redisClient.geoAdd('bikes:rentable', {
            longitude: -122.2469854,
            latitude: 37.8104049,
            member: 'station:3'
            })
            console.log(res3)  // 1

            //搜索范围内地点 https://blog.csdn.net/weixin_44606481/article/details/134373951  https://redis.io/commands/geodist/
            const res4 = await redisClient.geoSearch(
            'bikes:rentable', {
                longitude: -122.27652,
                latitude: 37.805186,
            },
            { radius: 5,
                unit: 'km'
            }
            );
            let distance = await redisClient.GEODIST('bikes:rentable','上海','北京','km');
            console.log(distance);
            console.log(res4)  // ['station:1', 'station:2', 'station:3']
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
            cluster.fork()
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`工作进程 ${worker.process.pid} 已退出`);
        });

    })()
} else {
    (async function () {
        console.log(`子进程 ${process.pid} 正在运行`);
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
        http.createServer(async (req, res) => {
            res.writeHead(200);
            if(redisClient){
                let data = await redisClient.get('person')
                res.write(data?data:'没有person');
            }
            res.end('你正在访问进程 ' + process.pid + '\n');
        }).listen(8000, () => {
            console.log(`工作进程 ${process.pid} 中的HTTP服务器已启动`);
        });
    })();
}

// 添加错误处理
process.on('uncaughtException', (err) => {
    console.error(`工作进程 ${process.pid} 发生未捕获的异常:`, err);
    process.exit(1);
});
