var config = require("./config.json"), 
    utils = require("./utils.js"),
    express  = require("express"),
    app = express(),
    server =  require('http').Server(app),
    sio = require("socket.io")(server);

var router = require('./api.js')(express.Router(),config,sio);
app.use('/api',router);
app.use("/",express.static("public"));

tail_files = {};
default_files = []
if(config.files){
  config.files.forEach(function(file){
    utils.isValidFile(file,function(err){
      if(err){
        console.log("Default File:",file,err.message);
      }
      else{
        hash = utils.hash(file);
        default_files.push({'filename':file,'hash':hash});
        utils.tail(file,hash,sio);
      }
    })
  });
}

sio.on("connection",function(client){
  console.log("socketio: new user connected: "+client.id); 
  client.on("disconnect",function(){
    console.log("socketio: user disconnected: "+client.id);
  })
  client.on("message",function(data){})
  /* Init from client, send all default file details*/
  client.on("wt_init",function(data){
    default_files.forEach(function(file){
      client.join(file.hash);
      client.emit("wt_new",JSON.stringify(file));
    });
  })

  /* Register a new file */
  client.on("wt_new",function(data){
    data = utils.parseJSON(data,client);
    if(data !== false){
      hash = utils.hash(data.filename);
      if(!tail_files[hash]){
        utils.isValidFile(data.filename,function(err){
          if(err){
            client.emit("wt_error",err.message);
            return
          }
          else{
            resp = {
              filename: data.filename,
              hash : hash
            };
            client.join(hash)
            client.emit("wt_new",JSON.stringify(resp));
            tail_files[hash] = 1;
            utils.tail(data.filename,hash,sio);
          }
        })
      }
      else{
        resp = {
          filename: data.filename,
          hash : hash
        };
        client.join(hash);
        client.emit("wt_new",JSON.stringify(resp));
      }
    }
    else{
      client.emit("wt_error","Invalid request");
    }
  });
});



server.listen(config.port||7733,function(err){
  if(err){
    console.log("Cannot listen on port: "+config.port||7733);
    process.exit(-1)
  }
  console.log("Server listening on port:"+config.port||7733)
})
