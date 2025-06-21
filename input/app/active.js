//获取MAC地址
let crypto = nodeRequire('crypto');
let publicKey = nodeRequire('fs').readFileSync(__dirname_app+'/app/jsc/key.pem','utf-8');
let getMac = nodeRequire('getmac').default;
let mac = getMac().toLowerCase();
//显示mac地址
$(".mac").text(mac);
$(".btn_normal").click(function(){
    let activeKey = $('.input_text1').val().trim();
    if(activeKey == ''){
        alert('请输入激活码');
        return;
    }
    //检查激活码是否正确
        //判断mac地址是否正确
    let macActive = crypto.publicDecrypt(publicKey,Buffer.from(activeKey,'base64')).toString();
    console.log(macActive);
    if(mac.toLowerCase() !== macActive){
        alert('激活码不正确');
    }else{
        alert('激活成功');
        DB.setItem('activeKey',activeKey);
        window.location.href = 'index.html'
    }    
})
