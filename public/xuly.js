
var socket = io("https://chat-do-an-mang.herokuapp.com");

var str0 = document.cookie;
        var nameofcookies = document.cookie.substring(0,str0.indexOf("=") );
        
        var str = document.cookie.substring(str0.indexOf("=") + 1);
        var arr = str.split("%20");
        var userNameofMe = arr[0];
        var nameofMe = "";
        for(var i =1;i<arr.length; i++){
            nameofMe +=arr[i] +" "; 
        }
socket.emit("myname", userNameofMe);


socket.on("server-send-danhsach-users", function(data){
    $("#boxContent").html("");
    data.us.forEach(function(i){
        var j = 0, check =0;
        for(j=0; j<data.arr.length ; j++)
            if(i.userName ==data.arr[j] )
            check++;
       
        var str='' ;
        str+= '<div><a href="/messenger/';
        str+= i.userName + '">';
        if(check){
            if(i.userName != userNameofMe)
        $("#boxContent").append(str+'<div class = "user"  style="float: left" data-info ='+ i.userName+'>'+i.name+'</div></a><div><div style="float:right;height:10px; width:10px;margin-top:20px; background:red;border-radius:20px"></div></div></div>');
        }
        else
        {
        if(i.userName != userNameofMe)
        $("#boxContent").append(str+'<div class = "user" data-info ='+ i.userName+'>'+i.name+'</div></a>');
    }
    });
});
socket.on("Server-say-ok", function(data){
    $("#listMessenger").html("");
   
        if(data.sender === userNameofMe){
            $("#listMessenger").append("<div class='me'><p style='color:white; margin-bottom:0.5rem;'>"+data.content+"</p></div>");}
            else{
                $("#listMessenger").append("<div class='you'><p style='color:white;margin-bottom:0.5rem; '>"+data.content+"</p></div>");
            } 
    
});
socket.on("server-chat", function(data){
    var arr = data.split(":");
    if(arr[0]=== userNameofMe){
    $("#listMessenger").append("<div class='me'><p style='color:white; margin-bottom:0.5rem;'>"+arr[1]+"</p></div>");}
    else{
        $("#listMessenger").append("<div class='you'><p style='color:white;margin-bottom:0.5rem; '>"+arr[1]+"</p></div>");
    }

});
socket.on("server-bao-co-nguoi-goi",data =>{
    console.log(data);
    data = "call," +data;
    window.open("https://tranminhvuong.github.io/",data, true );
});

$(document).ready(function()
    {
        socket.emit("mychat", userNameofMe + ","+$("#useName").attr('data-name'));
        $("#btnLogOut").click(function(){
            socket.emit("client-send-logout"); 
        });
      
        $("#_id").append("<u>" + nameofMe+"</u>")
        $("#btnSend").click(function(){
            var  a = $("#txtMessage").val().trim();
            if(a){
            socket.emit("user-send-message", $("#useName").attr('data-name')+":"+userNameofMe+": "+ a);
            document.getElementById("txtMessage").value = '';
            }
        });
        $("#txtMessage").keypress(()=>{
            if (event.keyCode == 13) {
                var  a = $("#txtMessage").val().trim();
                if(a){
                    document.getElementById("txtMessage").value = '';
                    socket.emit("user-send-message", $("#useName").attr('data-name')+":"+userNameofMe+": "+ a);
                
                }
            }
        });
        // $("#txtMessage").focusin(function(){
        //     socket.emit("user-dang-go", );
        //  });
        //  $("#txtMessage").focusout(function(){
        //     socket.emit("user-khong-go", );
        //  });
        $("#caller").click(()=>{
            var calllee = $("#useName").attr('data-name');
            var ssss = userNameofMe+ ','+ nameofMe +',' +calllee + ','+ $("#useName").text();
            socket.emit("co-nguoi-call", ssss);
            window.open('https://tranminhvuong.github.io/',ssss, true);
            
        });
        $(document).on('mouseover', '.user', function(e) {
            $(this).css('background-color','aqua');
        });
        $(document).on('click', '.user', function(e) {
            var a = $(this).html();
            socket.emit("socket-send-taoroom", userNameofMe+","+ $(this).attr('data-info'));
        });
        
        $(document).on('mouseout', '.user', function(e) {
            $(this).css('background-color','#e9ebee');
        });
    });