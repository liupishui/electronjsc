// 这个文件可以直接用 electron 命令运行。
let module_async = {
  'fs': {
    loaded: false,
    module: 'fs'
  },
  'path': {
    loaded: false,
    module: 'path'
  },
  'electron': {
    loaded: false,
    module: 'electron'
  },
  'os': {
    loaded: false,
    module: 'os'
  },
  'process': {
    loaded: false,
    module: 'process'
  },
  '@electron/remote/main': {
    loaded: false,
    module: '@electron/remote/main'
  }
}
let $ = function (moduleName) {
  return module_async[moduleName].loaded || (module_async[moduleName].loaded = require(module_async[moduleName].module));
};

let appTimeStart = new Date().getTime();
let traysArr = [];
const fs = require('fs');
const path = require('path');
const { BrowserWindow, app, ipcMain } = require('electron');
let arch = process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') ? 'x64' : 'ia32';
if(arch=='ia32'){
    app.disableHardwareAcceleration();//解决32位系统黑屏问题
}
app.allowRendererProcessReuse = false;

let redisServerInstance = {};
async function main() {
  // 启动一个浏览器窗口
  await launchRenderer();
  //启动redis服务器
  redisServer = require('./lib/redisServer');
  let port = require('./lib/getRandomPort');
  redisServerInstance = new redisServer(await port());
  await redisServerInstance.start();
  console.log(redisServerInstance);
  // await redisServer.stop();
  //启动一个子进程
  let fork = require('child_process').fork;
  let child = fork(`${__dirname}/childprocess/https.js`);
  console.log(redisServerInstance.redisInfo);
  child.send(redisServerInstance.redisInfo);
  child.on('message', (data) => {
    console.log(data);
  })
}
let electronRemote = require('@electron/remote/main');
electronRemote.initialize();

let windowsAll = [];
function createWindow(URL, config) {
  config || (config = {});
  let defaultConfig = {
    title: 'axureshow',
    width: 818,
    height: 585,
    easyClose: true,// 默认点击窗口右上角的按钮可以关闭
    setAlwaysOnTop: false,//默认不置顶
    openDevTools: false,//是否启用调试工具
    backgroundColor: '#fff',
    isNeverShow: false,//永远不显示窗口
    frame: false
  }
  var config = { ...defaultConfig, ...config }
  // let BrowserWindow = $('electron').BrowserWindow;
  let newWin = new BrowserWindow({
    title: config.title,
    webPreferences: {
      nativeWindowOpen: false,
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      'Content-Security-Policy': '*',
      nodeIntegrationInWorker: true,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      allowRunningInsecureContent: true,
      preload: config.preload?config.preload:__dirname+'/preload/preload.js',
    },
    frame: config.frame,
    width: config.width,
    resizable: true,
    height: config.height,
    center: true,
    movable: true,
    show: config.show,//默认不显示
    backgroundColor: config.backgroundColor,
    icon: __dirname + '/app/img/icon.png'
  })
  $('@electron/remote/main').enable(newWin.webContents);
  newWin.setMenu(null);

  newWin.webContents.on('did-create-window', function () {
    console.log('did-create-window', new Date().getTime() - appTimeStart);

    newWin.show();
  });
  newWin.webContents.on('did-start-loading', function () {
    console.log('did-start-loading', new Date().getTime() - appTimeStart);

    //newWin.show();
  });
  newWin.webContents.once('did-finish-load', function () {
    console.log('did-finish-load', new Date().getTime() - appTimeStart);

    // newWin.show();
  });
  newWin.webContents.once('dom-ready', function () {
    console.log('dom-ready', new Date().getTime() - appTimeStart);
    // newWin.show();
  });
  if (!config.isNeverShow) {
    newWin.once('ready-to-show', () => {
      console.log('ready-to-show', new Date().getTime() - appTimeStart);
      //newWin.show()
      //console.log(new Date().getTime() - appTimeStart);
    })
  }
  let tray = new $('electron').Tray($('path').join(__dirname, '/app/img/icon.ico'));
      traysArr.push(tray);
  if (config.easyClose) {
    newWin.on('closed', () => {
      newWin.destroy();
      tray.destroy();
    })
  } else {
    newWin.on('close', function (event) {//阻止默认关闭事件，最小化到托盘
      newWin.hide();
      newWin.setSkipTaskbar(true);
      event.preventDefault();
    });
  }
  if (config.setAlwaysOnTop) {
    newWin.setAlwaysOnTop(true);
  };
  newWin.on('show', function () {
    console.log(2222);
    //tray.setHighlightMode('always');
  });
  newWin.on('hide', function () {
    //tray.setHighlightMode('never');
  });
  const contextMenu = $('electron').Menu.buildFromTemplate([
    {
      label: '退出', click: () => {
        newWin.destroy()
        tray.destroy();
      }
    },//我们需要在这里有一个真正的退出（这里直接强制退出）
  ])
  tray.setToolTip('broswer')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => { //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    newWin.isVisible() ? newWin.hide() : newWin.show()
    newWin.isVisible() ? newWin.setSkipTaskbar(false) : newWin.setSkipTaskbar(true);
  })
  if (URL.indexOf('http') === 0) {
    newWin.loadURL(URL);
  } else {
    newWin.loadFile(URL);
  }
  if (config.openDevTools) {
    newWin.webContents.openDevTools();
  }
  windowsAll.push({ id: newWin.id, win: newWin, tray: tray });

  return newWin;
}
//如果软件已经启动，则直接显示已经启动的软件
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.exit && app.exit();
    app.quit && app.quit();
    // if(Y.electronRemote.dialog.showMessageBoxSync({type:'warning',buttons:['确定'],title:'提示',message:'软件已经在运行，请从屏幕右下角托盘启动!'})==0){
    //     // Y.electronRemote.app && Y.electronRemote.app.exit();
    //     // Y.electronRemote.app.quit && Y.electronRemote.app.quit();
    // };
} else {
    app.on('second-instance', (event, argv, workingDirectory) => {
        if(typeof(windowsAll[0])!=='undefined'){
            if(windowsAll[0].isVisible()){
                windowsAll[0].show();
                windowsAll[0].focus();
            };
            if(windowsAll[0].isMinimized()){
                windowsAll[0].restore();
                windowsAll[0].focus();
            };
        }
    })

}
//如果软件已经启动，则直接显示已经启动的软件

//设置开机启动开始 不需要开机启动注释掉
// const exeName = path.basename(process.execPath)
// if (app.isPackaged) {
//     //设置开机启动
//     app.setLoginItemSettings({
//         openAtLogin: true
//     });
// }
// // app.setLoginItemSettings({
// //   openAtLogin: true,
// //   openAsHidden:false,
// //   path: process.execPath,
// //   args: [
// //     '--processStart', `"${exeName}"`,
// //   ]
// // })
//设置开机启动结束 不需要开机启动注释掉

async function launchRenderer() {
  await app.whenReady();
  let mainWindow = createWindow(__dirname + '/app/index.html', { openDevTools: true, show: true, frame: true });
  
    //APP自动升级
    let appAutoUpate = require(__dirname + '/lib/appAutoUpdate.js');
    new appAutoUpate(ipcMain,mainWindow);
}
main();

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windowsAll.length === 0) {
      main();
      //createWindow(`${__dirname}/index.html`);
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('before-quit',async ()=>{
    //关闭redis服务
    if(redisServerInstance.stop){
      await redisServerInstance.stop()
    }
    traysArr.forEach((tray)=>{
        if(typeof(tray)!=='undefined'&&tray!=null){
            tray.destroy();
            tray = null;
        }
    })
})
