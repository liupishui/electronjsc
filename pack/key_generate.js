    //nodejs公钥私钥生
    let crypto = require('crypto');
    let {privateKey,publicKey} = crypto.generateKeyPairSync('rsa',{modulusLength:2408});
    console.log(privateKey.export({type:'pkcs1',format:'pem'}));
    console.log(publicKey.export({type:'pkcs1',format:'pem'}));
    //nodejs公钥私钥生成//结束