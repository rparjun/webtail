$(document).ready(function(){
  $("#files").toggle()
  json = function(json_str){
    try{return JSON.parse(json_str);}
    catch(e){return {}}
  }

  var fileSettings = {}

  $("#show-files").click(function(){
    $("#files").toggle()
  })
  $("#files>ul").on("click","input",function(e){
    element = $(this);
    fileid = element.data("fileid");
    if(element.is(":checked") == true){
      $("."+fileid).removeClass("hidden");
      fileSettings[fileid]["hidden"] = false;
    }
    else{
      $("."+fileid).addClass("hidden");
      fileSettings[fileid]["hidden"] = true;
    }
  })
  var socket = io();
  socket.on('connect',function(){
    socket.emit('wt_init','Hello from client')
    socket.on("wt_error",function(error){console.log("Server error: "+error)})
    socket.on("wt_new",function(data){
      data = json(data)
      console.log(data)
      li = "<li> <label><input class='file-select' data-fileid='"+data.hash+"' checked type='checkbox'>"+data.filename+"</label></li>"
      fileSettings[data.hash] = {hidden:false}
      $("#files>ul").append(li)
    })
    socket.on("wt_data",function(data){
      data = json(data)
      hash = data.hash
      message = data.data.trim()
      if(message == ""){return}
      className = ""
      if(fileSettings[data.hash]["hidden"] == true){className="hidden"}
      $("#logs").append("<p class=' "+className+" "+data.hash+"'>"+message+"</p>")
      $("body").animate({ scrollTop: $("body")[0].scrollHeight}, 100);
    })
  })
});
