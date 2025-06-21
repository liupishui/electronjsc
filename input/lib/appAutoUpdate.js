//https://www.electron.build/auto-update
//https://www.cnblogs.com/qirui/p/8328069.html
// Do not call setFeedURL. electron-builder automatically creates app-update.yml file for you on build in the resources (this file is internal, you don’t need to be aware of it).
let { AppImageUpdater, MacUpdater, NsisUpdater } = require("electron-updater");
let electron = require('electron');
function appAutoUpate(){
    //arguments[0]: ipcMain
    //arguments[1]: mainWindow

    const options = {
        requestHeaders: {
            // Any request headers to include here
            Authorization: 'Basic AUTH_CREDS_VALUE'
        },
        provider: 'generic',
        url: 'http://192.168.1.106:1001/download/'
    }

    if (process.platform === "win32") {
        autoUpdater = new NsisUpdater(options)
    }
    else if (process.platform === "darwin") {
        autoUpdater = new MacUpdater(options)
    }
    else {
        autoUpdater = new AppImageUpdater(options)
    }
    autoUpdater.checkForUpdatesAndNotify();
    //event
    autoUpdater.on('error',()=>{
       // electron.dialog.showMessageBox({message:'error'});
    })
    autoUpdater.on('checking-for-update',()=>{
        // electron.dialog.showMessageBox({message:'error1'});
    })
    autoUpdater.on('update-available',()=>{
        // electron.dialog.showMessageBox({message:'error2'});
    })
    autoUpdater.on('update-not-available',()=>{
        // electron.dialog.showMessageBox({message:'error3'});
    })
    autoUpdater.on('download-progress',(downloadProgress)=>{
        arguments[1].webContents.send('download-progress',downloadProgress);
        //electron.dialog.showMessageBox({message:'error4'});
    })
    autoUpdater.on('update-downloaded',(updateDownloaded)=>{
        arguments[1].webContents.send('update-downloaded',updateDownloaded);
    })
    arguments[0].on('autoupdatenow',(event,args)=>{
        if(args){
            //autoUpdater.quitAndInstall();//更新并重启
            autoUpdater.quitAndInstall(true,true);//静默更新，并重启
        }
    })
}
module.exports = appAutoUpate