//注册验证
let checkActive = function(){
    var checkingActive = function (key) {
    let publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBNwKCAS4AoE2D57ioS6LfFp48alcOdcNoYA/NjWg9S7KJT3AjfOQ6xvEHnAml
Vfwi3npH0qE+ALVzmOtukbhgk6pzRvaj8JI1dq7YInnMD6OH745efurSE2+n0acn
MeDAwC7qUKHHvBiJj3yneZ2i/psPs9SLIQWccKIWkySYNJy3Po6r673xTmlhjtD9
GlvgpUWL3WSxHIu5n/E+G94TnbSQIQk13RrJ6bzV7wOpvjKAeBgM1PN+hRjYo06A
Q+OlCjK/hXRNYx/zGzH1ZNVNguhmUUwi+PG1ofGYgXu03yusGJCJSzkNLDWVwxnf
0Ff3yOwkJc/Y/oBsKQ4+m9Q+q3o+bSD43RHmOhzv7w1qwbNSouQXLVrT2xR1VtnV
jl+ViERmHJF7FTKtDPVkB6Q0iNaXpQIDAQAB
-----END RSA PUBLIC KEY-----
    `
        try{
            //解密
            let getmac = require('getmac').default;
            let macAddress = getmac().toLocaleLowerCase();
            let crypto = require('crypto');
            let decryptedData = crypto.publicDecrypt(publicKey,Buffer.from(key,'base64')).toString();
            if(decryptedData.split(' ').length!==3){
                return false;
            }
            // mac + 有效期 + 激活日期
            let MacAddressOrg = decryptedData.split(' ')[0].toLowerCase().replaceAll('-',':');
            let expiryDate = parseInt(decryptedData.split(' ')[1]);//单位是天
            let activeDate = new Date(decryptedData.split(' ')[2]);
            if (MacAddressOrg!=macAddress) {
                //mac地址不对，执行错误回调
                return false;
            }
            if(Date.now() - activeDate.getTime() < expiryDate*24*60*60*1000){
                //在激活在有效期内，执行正确回调
                return true;
            }
        }catch(e){
            return false;
        }
    }
    let fs = require('node:fs');
    let os = require('os');
    let key = fs.readFileSync(`${os.homedir()}/fet.key`,'utf-8');
    if(checkingActive(key)===false){
        window.location.href="./active.html"
    }
}
checkActive();