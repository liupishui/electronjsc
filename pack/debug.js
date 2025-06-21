const { spawn } = require('child_process');

// 指定 应用程序的路径
let homedir = require('os').homedir();
let path = require('path');
const ProductPath = `${path.dirname(__dirname)}/dist/win-unpacked/electron_v8.exe`;

// 创建一个子进程并运行 应用程序
const ProductProcess = spawn(ProductPath,[`--inspect=9229`,`--remote-debugging-port=9230`]);

// 监听子进程的输出
ProductProcess.stdout.on('data', (data) => {
  console.log(`output: ${data}`);
});

// 监听子进程的错误
ProductProcess.stderr.on('data', (data) => {
  console.error(`error : ${data}`);
});

// 监听子进程的退出事件
ProductProcess.on('close', (code) => {
  console.log(`Electron exited with code $${code}`);
});

// 在需要时可以发送消息到 Product 应用程序
ProductProcess.stdin.write('Hello Electron!\n');
ProductProcess.stdin.end();