//执行权限
(function(){
    //没有激活或者没有权限
    let hasRight = true;
    let crypto = nodeRequire('crypto');
    let publicKey = nodeRequire('fs').readFileSync(__dirname_app+'/app/jsc/key.pem','utf-8');
    let activeKey = DB.getItem('activeKey');
    let getMac = nodeRequire('getmac').default;
    let mac = getMac().toLowerCase();
    if(activeKey==null){
        hasRight = false;
    }else{
        //用公钥解密加密后的代码获取mac地址，判断mac地址是否正确
        let macActive = crypto.publicDecrypt(publicKey,Buffer.from(activeKey,'base64')).toString();
        if(mac!==macActive){
            hasRight = false;
        }
    }
    if (!hasRight) {
        window.location.href = __dirname_app + '/app/active.html';
    }
})()