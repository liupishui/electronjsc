const net = require('net');
function getRandomPort(){
    return new Promise((resolve,reject)=>{
        const server = net.createServer();
        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
    
    });
}
module.exports = getRandomPort;