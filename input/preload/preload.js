let path = require('path'),fs=require('fs');
let electronRemote = require('@electron/remote');
let __dirname_app = path.dirname(__dirname).replace(/\\/g,'/')+'/';
// let relativePath = path.relative(electronRemote.app.getAppPath(), __dirname).replace(/\\/g,'/');
// if(relativePath.indexOf('output')===0){
//     //已经打包
//     __dirname_app = '/'+ path.dirname(relativePath)+'/';
// }
//.indexOf('app') === 0 ? '' : 'output/'
require('electron').webFrame.executeJavaScript('window.__dirname_app = "' + __dirname_app + '"');
//解决页面内alert/confirm后 input无法获得焦点
window.alert = function (message) {
    var options = {
        title:"修改标题",
        type: 'warning',
        buttons: ["确定"],
        defaultId: 0,
        cancelId: 0,
        detail: '' + message,
        message: ''
    }
    electronRemote.dialog.showMessageBoxSync(null, options)
}
window.confirm = function (message, buttons) {
    var buttonDefault = ['取消'];
    let buttonsRst = ['取消', '确定'];
    if (buttons) {
        buttonsRst = [...buttonDefault, ...buttons];
    }
    const buttonIdx = electronRemote.dialog.showMessageBoxSync(null, {
        type: 'question',
        title:"修改标题",
        buttons: buttonsRst,
        defaultId: 1,
        cancelId: 0,
        detail: '' + message,
        message: ''
    });
    return buttonIdx;
};