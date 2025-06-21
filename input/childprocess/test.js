process.on('message',function(event,args){
    console.log(event);
    process.send({type:'eventFromchildprocess'});
})