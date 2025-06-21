// //加密混淆app文件夹内所有js 使用类库 javascript-obfuscator
let fs = require('fs');
let path = require('path');
let getFileInfo = function (dirname) {
  //参考文档 https://static2.cnodejs.org/topic/5dc62c8cece3813ad9ba7479
  // https://github.com/stevenvachon/winattr/blob/645e1900ca7e5adb64e3177f1fd68c431ec8db00/lib/shell/index.js
  // let fs = require('fs');
  // let path = require('path');
  // let iconvLite = require('iconv-lite');
  let hostscriptJSContent = `// Thanks to Gabriel Llamas for his solution:
        // http://stackoverflow.com/questions/13440589/retrieve-file-attributes-from-windows-cmd
        
        var error = "";
        var err1 = "";
        var fs = new ActiveXObject("Scripting.FileSystemObject");
        var name = WScript.Arguments.item(0);
        var file="";
        var file1="";
        var file2="";
        var json="";
        
        try
        {
          file = fs.GetFile(name);
        }
        catch (e)
        {
          error = e.message;
        }
        try
        {
          file = fs.GetFolder(name);
        }
        catch (e)
        {
          error1 = e.message;
        }
        
        if (file!== "" || file1!=="")
        {
          file2 = file||file1;
          json  = '{';
          json += '"readonly":' + !!(file2.attributes & 1)    +',';
          json += '"hidden":'   + !!(file2.attributes & 2)    +',';
          json += '"system":'   + !!(file2.attributes & 4)    +',';
          json += '"directory":'+ !!(file2.attributes & 16)   +',';
          json += '"archive":'  + !!(file2.attributes & 32)   +',';
          json += '"symlink":'  + !!(file2.attributes & 1024)     ;  // Reparse point (symbolic link)
          json += '}';
        }
        else
        {
          json = '{"error":"'+error+'|'+error1+'"}';
        }
        
        WScript.echo(json);`;
  let child_process = require("child_process");
  let params =
  {
    archive: "a",
    hidden: "h",
    readonly: "r",
    system: "s"
  };
  let get_args = path =>
    [
      `${__dirname}/hostscript20231031.js`,
      path,
      "//nologo",
      "//E:jscript"
    ];
  let get_parseResult = result => {
    var json;
    var error = null;
    //console.log(result);
    // console.log(iconvLite.decode(result.stderr,'cp936'));
    // console.log(iconvLite.decode(result.stdout,'cp936'));
    let hasTeshuzifu = function (testString) {
      let teshuzifuArr = Array.from(testString).filter(water => {
        return water.charCodeAt(0) > 255;
      })
      // console.log(teshuzifuArr)
      return teshuzifuArr.length > 0
    };

    if (result.stderr.toString() !== '') {
      error = new Error(`文件夹${dirname}内/文件${dirname}同目录下的hostscript20231031.js脚本执行错误,详情用iconv-lite解析`);
    }
    // console.log(result);
    // console.log(iconvLite.decode(result.stdout,'GB2312'));
    result.stdout = result.stdout.toString().trim();

    if (result.stdout.length <= 0) {
      error = new Error("unknown error");
    }
    else {
      if (hasTeshuzifu(result.stdout)) {
        error = new Error("unknown error");
      } else {
        json = JSON.parse(result.stdout);

        if (json.error !== undefined) {
          error = new Error(json.error);
          json = undefined;
        }

      }
    }

    return { error: error, attrs: json };
  };
  let shellSync = (command, args) => {
    var result = child_process.spawnSync(command, args);
    // Consistent with shell()
    if (result.stderr === null) result.stderr = "";
    if (result.stdout === null) result.stdout = "";
    return result;
  };
  let getSync = path => {
    var result = shellSync("cscript", get_args(path));
    result = get_parseResult(result);

    if (result.error !== null) {
      return false;
    }

    return result.attrs;
  };
  // if(fs.existsSync(dirname)){
  //   //如果文件/文件夹存在
  //   let fsStat = fs.statSync(dirname);
  //   if(!fsStat.isDirectory()){
  //     //如果不是目录,则获取同级目录文件夹
  //     dirname = path.dirname(dirname);
  //   }         
  //   //如果hostscript20231031.js不存在，则创建
  //   console.log(1111,path.join(dirname,'hostscript20231031.js'));
  //   if(!fs.existsSync(path.join(dirname,'hostscript20231031.js'))){
  //     console.log(333);
  //     fs.writeFileSync(path.join(dirname,'hostscript20231031.js'),hostscriptJSContent);
  //   }
  // }else{
  //   console.log(222);
  //   return false;
  // }
  if (!fs.existsSync(`${__dirname}/hostscript20231031.js`)) {
    fs.writeFileSync(`${__dirname}/hostscript20231031.js`, hostscriptJSContent);
  }
  let fileInfo = getSync(dirname);
  return fileInfo;
}
// console.log(getFileInfo(__dirname+'/test.html'));
// let fs = require('fs');
// let path = require('path');
let filesArr = [];
let getFiles = (dir) => {
  if (fs.existsSync(dir)) {
    let dirType = fs.statSync(dir);
    if (dirType.isDirectory()) {
      let filesCurrentPath = fs.readdirSync(dir, { withFileTypes: true });
      filesCurrentPath.forEach(file => {
        if (file.isDirectory()) {
          // console.log((/(^|\/)\.[^\/\.]/g).test(path.join(dir,file.name)));
          // console.dir(path.join(dir,file.name));console.dir(fs.statSync(path.join(dir,file.name)));
          let fileInfo = getFileInfo(path.join(dir, file.name));
          if (fileInfo && fileInfo.hidden === false) {
            getFiles(path.join(dir, file.name));
          } else {
            // console.log(file,fileInfo);
          }
        } else {
          if (file.isFile()) {
            filesArr.push(path.join(dir, file.name));
          }
        };
      })
    };
  }
}
//混淆开始
//  let fs = require('fs');
//  let path = require('path');
let unencryptArrReg = [
  // "app/js/",
  "app/css/",
  "app/img/"
];
let canEncrypt = function (filePath, unencryptArrReg) {
  filePath = path.relative(path.dirname(__dirname)+'/output',filePath).replace(/\\/g,'/');
  console.log(filePath);
  return unencryptArrReg.filter(element => { return filePath.indexOf(element) === 0 }).length === 0;
}
//他麻痹，总有些类库连TMD的注释都不能删除, 紧缩代码也会报错
let UglifyJS = require("uglify-js");
let uglifyFile = function(filepath){
      let code = fs.readFileSync(filepath, 'utf-8');
      let result = '';
      try{
        let options = {
                mangle:true,//变量名混淆
                compress:true,//代码压缩
                output:{
                    comments:false,//删除注释，false不带注释，true带注释
                    beautify:false,//紧缩代码,true紧缩代码，false不紧缩代码
                }
            };
        result = UglifyJS.minify(code,options);
      }catch(e){

      }
      if(result!==''){
        if(typeof(result.code)==='string'){
          fs.writeFileSync(filepath,result.code);
        }else{
          fs.writeFileSync(filepath,code);
        }
      }else{
        fs.writeFileSync(filepath,code);
      }
}

//jsmin2压缩
let jsmin2 = require('jsmin2');
let jsmin2File = function(filepath){
  let fileContent = fs.readFileSync(filepath, 'utf-8');
  let dataRst = jsmin2(fileContent);
  try{
    fs.writeFileSync(filepath, dataRst.code);
  }catch(e){
    fs.writeFileSync(filepath, fileContent);
  }
};
//16进制加密代码，偶尔文件加密执行报错
let JavaScriptObfuscator = require('javascript-obfuscator');
let JavaScriptObfuscatorFile = function(filepath){
  let fileContent = fs.readFileSync(filepath, 'utf-8');
  let dataRst = '';
  try {
    let obfuscationResult = JavaScriptObfuscator.obfuscate(fileContent,
      {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
      });
    dataRst = obfuscationResult.getObfuscatedCode();
  } catch (e) {
    console.log(e);
  }
  if (dataRst !== '') {
    console.log('====');
    try {
      fs.writeFileSync(filepath, dataRst);
    } catch (e) {
    }
  }

}
let encrypt = function () {
  getFiles(path.dirname(__dirname)+'/output');
  fs.writeFileSync('./jsFiles.txt', JSON.stringify(filesArr));
  let filesArrRst = JSON.parse(fs.readFileSync('./jsFiles.txt', 'utf-8'));
  for (let i = 0; i < filesArrRst.length; i++) {
    let filepath = filesArrRst[i];
    if (path.extname(filepath) == '.js') {
      if (canEncrypt(filepath, unencryptArrReg)) {
       uglifyFile(filepath);//压缩混淆代码
        //JavaScriptObfuscatorFile(filepath);//16进制压缩代码
        //jsmin2File(filepath);
        //console.log(`${i}/${filesArrRst.length}`);
      }else {
        // console.log(`minify: ${filepath} ${i}/${filesArrRst.length}`);
      }
    }
  }
  try{
    fs.unlinkSync(`${__dirname}/hostscript20231031.js`);
    fs.unlinkSync(`${__dirname}/jsFiles.txt`);
  }catch(e){

  }
  console.log('--- encrypt over ---');
}
module.exports = encrypt;
