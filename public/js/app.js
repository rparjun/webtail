$(document).ready(function(){
  $("#files").toggle()
  json = function(json_str){
    try{return JSON.parse(json_str);}
    catch(e){return {}}
  }
  var autoScroll = true,
      fileSettings = {},
      searchQuery = "",
      searchCount = 100;

  var search = function(query){
    searchQuery = query;
    if(query == ""){
      $("#logs .search-hidden").removeClass("search-hidden");
      return false
    }
    elements = $("#logs>p").slice(-searchCount);
    elements.each(function(i,val){
      if(val.innerHTML.search(query) == -1){
        $(val).addClass("search-hidden");
      }
    })
  }

  $("#search-query").keydown(function(e){
    val = $(this).val().trim()
    if ( (e.keyCode && e.keyCode == 13) || val==""){
      search(val)
    }
  }).change(function(){
    console.log("changing")
  })

  $("#auto-scroll").click(function(){
    autoScroll = $(this).is(":checked");
  })

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

  var disConnected = function(obj){
    console.log("DISCONNECTED",obj);
    $("#status").removeClass("success").addClass("error");
    $("#logs").append("<p style='color:#DC0000;'>Webtail disconnected from server.</p>");
    $(".file-li").remove();
  }

  var connected = function(obj){
    $("#status").removeClass("error").addClass("success");
    $("#logs").append("<p style='color:#2DA92D;'>Webtail connected to server.</p>");
  }

  var socket = io();
  socket.on('disconnect',function(error){ disConnected(error)})
  socket.on('connect',function(){
    connected(null)
    socket.emit('wt_init','Hello from client')
    socket.on("wt_error",function(error){
      disconnect(error)
    })
    socket.on("wt_new",function(data){
      data = json(data)
      li = "<li class='file-li'> <label><input class='file-select' data-fileid='"+data.hash+"' checked type='checkbox'>"+data.filename+"</label></li>"
      fileSettings[data.hash] = {hidden:false}
      $("#files>ul").prepend(li)
    })
    socket.on("wt_data",function(data){
      data = json(data)
      hash = data.hash
      message = data.data.trim()
      if(message == ""){return}
      className = ""
      if(fileSettings[data.hash]["hidden"] == true){className="hidden"}
      if (searchQuery != "" && message.search(searchQuery) == -1 ){
        className+=" search-hidden"
      }
      $("#logs").append("<p class=' "+className+" "+data.hash+"'>"+message+"</p>")
      if(autoScroll){
        $("#logs").animate({ scrollTop: $("#logs")[0].scrollHeight}, 100);
      }
    })
  })
});
