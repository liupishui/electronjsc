node version V20.9.0

#electron_v8

https://www.nodeapp.cn/vm.html#vm_new_vm_script_code_options


## 约定相对与/input/问价夹下的文件

**.js         存放的都是主进程内的文件,只执行，不module.exports,只有一个main.js文件

app/          默认存放的都不是module.exports可导出文件

childprocess/ 存放的都是子进程文件 ```process.on('message',(args)=>{})```

preload/      存放的都是electron创建的窗口内预加载的文件

lib/          存放的都是module.exports文件 ```module.exports = {}```

runbyte/      不要修改此文件夹内的内容

主进程/input/main.js启用@electron/remote 

```javascript
let electronRemote = require('@electron/remote/main');
electronRemote.initialize();
......
electronRemote.enable(win.webContents)
```

## Rust字节编译没有实现，只实现了JavaScript字节码的保存和运行


# 命令

运行

```bash
npm run-script start
```
运行编译后的jsc

```bash
npm run-script startjsc
```

编译命令

```bash
npm run-script compile
```

编译后直接运行

```bash
npm run-script compileRun
```

打包命令

```bash
npm run-script pack64
```

# 注意问题

有未编译成功的js文件（控制台且有```disk_cache.cc(205)] Unable to create cache```错误提示），则重启Node.js应用，因为：有时候 Node.js 运行时间较长或者发生了其他问题，可能会导致缓存无法创建

redis下载地址：[https://github.com/redis-windows/redis-windows/releases/tag/7.2.4](https://github.com/redis-windows/redis-windows/releases/tag/7.2.4)