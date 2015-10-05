$(document).ready(function(){
  var gridster;
  $(function(){
    gridster = $(".gridster ul").gridster({
      widget_base_dimensions: [100, 55],
      widget_margins: [5, 5],
      helper: 'clone',
      resize: {
        enabled: true
      }
    }).data('gridster');
  });
  json = function(json_str){
    try{return JSON.parse(json_str);}
    catch(e){return {}}
  }


  var socket = io();
  socket.on('connect',function(){
    socket.emit('wt_init','Hello from client')
    socket.on("wt_error",function(error){console.log("Server error: "+error)})
    data = {
      "filename" : "/home/arjun/Desktop/blip/blip/log/development.log"
    }
    //socket.emit("wt_new",JSON.stringify(data));
    socket.on("wt_new",function(data){
      data = json(data)
      gridster.add_widget("<li id='"+data.hash+"' data-row='1' data-col='1' data-sizex='6' data-sizey='6><div class='file-content'><div class='meta'></div></div></li>",6,6);
  
    })
    socket.on("wt_data",function(data){console.log(data)})
  })
});
