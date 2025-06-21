let DB = (function(){
    let fs = nodeRequire('fs');
    let better_sqlite3 = nodeRequire('better-sqlite3');
    let getExtraResourcesPath = nodeRequire(__dirname_app+'/lib/getExtraResourcesPath');
    if (!fs.existsSync(`${getExtraResourcesPath()}/db/`)) {
      fs.mkdirSync(`${getExtraResourcesPath()}/db/`);
    }
    let dbPath = `${getExtraResourcesPath()}/db/scripts.db`;
    let db = better_sqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    var sql = `
              CREATE TABLE if not exists "storage" (
                  "id" INTEGER NOT NULL,
                  "keyName" TEXT,
                  "value" TEXT,
                  PRIMARY KEY ("id")
                  );
                  `;
    db.exec(sql)
    return db;
  })();
  DB.getItem = function(key){
    //let stmt = DB.prepare(`insert into script (keyName,value) values (?,?)`);
    if(typeof(key)==='undefined'){
      return null;
    }
    let stmt = DB.prepare(`select * from storage where keyName = ?`);
    const rst = stmt.all(key);
    if(rst.length==1){
      return rst[0].value;
    }else{
      return null;
    }
  }
  DB.setItem = function(key,value){
    //如果有则更新，没有则插入
    let data = DB.getItem(key);
    if(data!=null){
      //更新
      let stmt = DB.prepare('update storage set value=@value where keyName=@key');
      stmt.run({key:key,value:value});
    }else{
      //插入
      let stmt = DB.prepare('insert into storage (keyName,value) values (@key,@value)');
      stmt.run({key:key,value:value});
    }
    return true;
  }
  DB.removeItem = function(key){
    let stmt = DB.prepare('delete from storage where keyName=@key');
    stmt.run({key:key})
    return true;
  }
  