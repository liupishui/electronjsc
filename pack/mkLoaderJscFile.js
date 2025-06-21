let path = require('path'),fs=require('fs');
let mkLoaderJscFile = function(destJscPath,orgPath,outputPath){
    try{
      if(path.relative(outputPath,destJscPath).indexOf('app')===0){
        let runbyteFilePath = path.resolve(__dirname,'../output/runbyte/');
        let runbyteFileRelativePath = path.relative(path.dirname(destJscPath),runbyteFilePath).replace(/\\/g,'/')+'/loader.js';
        console.log(runbyteFilePath,path.relative(outputPath,destJscPath));
        if(runbyteFileRelativePath.indexOf('.')!==0){
          runbyteFileRelativePath='./'+runbyteFileRelativePath;
        }
        let loaderScriptCode = `
          //文件原始路径，当前运行文件的路径 window.location.href,__dirname, runbyte相对当前执行页面的路径，求runbyte的loader.js实际相对路径，jsc文件实际物理路径
          //nodeRequire("@electron/remote").getAppPath()
          // __filename运行此js文件的路径
          nodeRequire(__dirname_app + '/runbyte/loader.js').loadBytecode(__dirname_app + '${path.relative(outputPath,destJscPath).replace(/\\/g,'/')}').runInThisContext({
            displayErrors: true,
            lineOffset: 0,
            columnOffset: 0,
          });
        `;
        fs.writeFileSync(destJscPath.replace(/\.jsc/,'.js'),loaderScriptCode);
      }else if(path.relative(outputPath,destJscPath)===path.basename(orgPath)+'c'){
        //**.js相对于inputPath文件目录
        let runbyteFilePath = path.resolve(__dirname,'../output/runbyte/');
        let runbyteFileRelativePath = path.relative(path.dirname(destJscPath),runbyteFilePath).replace(/\\/g,'/');
        if(runbyteFileRelativePath.indexOf('.')!==0){
          runbyteFileRelativePath='./'+runbyteFileRelativePath;
        }
        let runbyteScriptCode = `require('${runbyteFileRelativePath}');
      require('./${path.basename(destJscPath)}');
      `
        fs.writeFileSync(destJscPath.replace(/\.jsc/,'.js'),runbyteScriptCode);    

      } else {
        // let exportsModules = require(orgPath);
        // if(typeof(exportsModules)==='undefined'||exportsModules==null||typeof(exportsModules)==='function'||Object.keys(exportsModules).length!==0){
        //模块导出
        let runbyteFilePath = path.resolve(__dirname,'../output/runbyte/');
        let runbyteFileRelativePath = path.relative(path.dirname(destJscPath),runbyteFilePath).replace(/\\/g,'/');
        if(runbyteFileRelativePath.indexOf('.')!==0){
          runbyteFileRelativePath='./'+runbyteFileRelativePath;
        }
        let runbyteScriptCode = `
        require('${runbyteFileRelativePath}');
      module.exports = require('./${path.basename(destJscPath)}');
      `
        fs.writeFileSync(destJscPath.replace(/\.jsc/,'.js'),runbyteScriptCode);
    
      // }else{
      //   //只是执行代码
      //   let runbyteFilePath = path.resolve(__dirname,'./runbyte');
      //   let runbyteScriptCode = `require('${path.relative(path.dirname(destJscPath),runbyteFilePath).replace(/\\/g,'/')}');
      // require('./${path.basename(destJscPath)}');
      // `
      //   fs.writeFileSync(destJscPath.replace(/\.jsc/,'.js'),runbyteScriptCode);    
      // }
    }
    }catch(e){
      console.log(e)
    }
  }
module.exports = mkLoaderJscFile;  