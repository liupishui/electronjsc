const { exec } = require('child_process');
const path = require('path');
let redisServer = {};
let fs = require('fs');
class redis {
    constructor(port=6379) {
        //redis库不支持ipv6 把DNS解析改为ipv4;
        const dns = require('dns');
        // Set default result order for DNS resolution
        dns.setDefaultResultOrder('ipv4first');
        this.port = isNaN(parseInt(port)) ? 6379 : parseInt(port);
        this.redisInfo = {};
    }
    getRedisBinDir(){
        let getExtraResourcesPath = require('../getExtraResourcesPath');
        let destPath = getExtraResourcesPath()+'/redis/';
        destPath = destPath.replace('app.asar','unpacked');
        console.log(destPath);
        return path.resolve(destPath);
    }
    parseRedisServerInfo(infoString){
        const infoLines = infoString.split('\r\n');
        const serverInfo = {};
    
        infoLines.forEach(line => {
            const [key, value] = line.split(':');
            if (key && value) {
                serverInfo[key.trim()] = value.trim();
            }
        });
        return serverInfo;
    }
    async getRedisServerInfo(){
        let that = this;
        let binPath = this.getRedisBinDir();
        let getRedisServerInfoPromise = function(){
            return new Promise(function(resolve,reject){
                exec(`redis-cli.exe -h 127.0.0.1 -p ${that.port} INFO SERVER`,{windowsHide:true,cwd:binPath},(error,stdout,stderr)=>{
                    if(error||stderr){
                        if(that.port === 6379){
                            reject(error||stderr)
                        }else{
                            exec(`redis-cli.exe -h 127.0.0.1 -p 6379 INFO SERVER`,{windowsHide:true,cwd:binPath},(error,stdout,stderr)=>{
                                if(error||stderr){
                                   reject(error||stderr);
                                }else{
                                    resolve(that.parseRedisServerInfo(stdout));
                                }
                            });
                        }
                    }else{
                        resolve(that.parseRedisServerInfo(stdout));
                    }
                });
        
            });
        }
        try{
            let redisInfo = await getRedisServerInfoPromise();
            return redisInfo;
        }catch(e){
            return Promise.reject(e);
        }
    }
    async start(){
        let binPath = this.getRedisBinDir();
        let that = this;
        let startPromise = function(){
            return new Promise((resolve,reject)=>{
                let configTxt = fs.readFileSync(`${binPath}/redis.conf`,'utf8');
                let newConfig = configTxt.replace(/\nport\s+\d+\s+\n/g,'\nport '+ that.port +'\r\n\r\n');
                fs.writeFileSync(`${binPath}/redis.conf`,newConfig);
                let redisServer = exec(`redis-server.exe redis.conf`,{windowsHide:true,cwd:binPath});
                redisServer.stdout.on('data', (data) => {
                    console.log(`Redis Server: ${data}`);
                    //fs.appendFileSync(__dirname+'/rst.txt',data.toString());
                    resolve(true);
                });    
                //     // 监听 Redis 服务器的输出
                // redisServer.stdout.on('data', (data) => {
                //     console.log(`Redis 服务器输出：${data}`);
                // });
    
                // 监听 Redis 服务器的错误信息
                redisServer.stderr.on('data', (data) => {
                    resolve(true);
                    //reject(`Redis 服务器错误：${data}`);
                });
    
                // 监听 Redis 服务器进程的关闭事件
                redisServer.on('close', (code) => {
                    console.log('已经关闭====');
                    resolve(true);
                    //reject(`Redis 服务器进程已关闭，退出码：${code}`);
                });
            });
        };
        await startPromise();
        try{
             that.redisInfo = await that.getRedisServerInfo();
             console.log('===========',that.redisInfo);
             if(that.redisInfo.tcp_port){
                that.port = that.redisInfo.tcp_port;
             }
             return true;
        }catch(e){
             return false;
        }
    }
    async stop(){
        let binPath = this.getRedisBinDir();
        let that = this;
        let stopPromise = function(){
            return new Promise((resolve,reject)=>{
                exec(`redis-cli.exe -h 127.0.0.1 -p ${that.port} shutdown`,{windowsHide:true,cwd:binPath},(error,stdout,stderr)=>{
                    if(error||stderr){
                        reject(error||stderr);
                    }else{
                        resolve(true)
                    }
                })
            });
        }
        await stopPromise();
        try{
            process.kill(this.redisInfo.process_id);
        }catch(e){

        }

        // console.log('======',this.getRedisServerInfo());
    }
}
module.exports = redis;