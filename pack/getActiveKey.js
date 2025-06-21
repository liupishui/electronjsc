//获取激活码
//mac地址
let mac = `d8:43:ae:13:46:0f`;
//period time有效期，默认365，单位天
let periodTime = 365;

let fs = require('node:fs');
let crypto = require('crypto');
let tody = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate();

let privateKey = fs.readFileSync('./private.pem','utf-8');

let keyOrg = mac + ' ' + periodTime + ' ' + tody;
let encryptedData = crypto.privateEncrypt({
    key: privateKey,
    passphrase: ""
}, Buffer.from(keyOrg))
let encryptedDataBase64 = encryptedData.toString('base64');
fs.writeFileSync('./activekey.txt',encryptedDataBase64)
console.log(encryptedDataBase64);