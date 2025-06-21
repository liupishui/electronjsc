let appUpdater = nodeRequire('electron-updater');

Y.electron.ipcRenderer.on('update-downloaded',()=>{
    if(window.confirm('新版本已下载完成，立即重启软件应用更新?')!=0){
        Y.electron.ipcRenderer.send('autoupdatenow',1);
    }
});