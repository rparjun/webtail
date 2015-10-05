var crypto = require('crypto'),
    fs = require('fs'),
    Tail = require("tail").Tail;


module.exports = {
  /* Tail a file, and emit the data to corresponding room  */
  tail: function(filename,hash,socketio){
    tail = new Tail(filename)
    tail.on("line",function(data){ 
      filename = this.filename;
      if(this.hash === undefined){ this.hash = hash}
      resp = {
        data: data,
        hash: this.hash
      }
      socketio.in(this.hash).emit("wt_data",JSON.stringify(resp));
    }); 
    tail.on("error",function(error){ console.log("Tail error:",error) });
  },
  /* Check if a file is valid(exists,not a directory,and has read permission)*/
  isValidFile: function(filename,callback){
    fs.stat(filename,function(err,stat){
      if(err){
        if(err.code === "ENOENT"){
          callback(new Error("File does not exist"));
        }
      }
      else{
        if(!stat.isFile()){
          callback(new Error("Not a valid file"));
        }
        else if(stat.isDirectory()){
          callback(new Error("File is directory"));
        }
        return callback(null);
      }
    })
  
  },
  /* Finf the md5 hash of a string  */
  hash: function(string){
    return crypto.createHash("md5").update(string).digest("hex")
  },
  /* Parse a JSON string and check if ita empty  */
  parseJSON: function(json_str,client_socket){
    try{
      data = JSON.parse(json_str);
      if(data == {})
        throw new Error("Empty JSON");
      return data;
    }
    catch (error){
      client_socket.emit("wt_error","Invalid JSON");
      console.log(error)
      return false
    }
  }

}
