var express = require("express");
var cookieParser = require("cookie-parser");
var mongoose = require('mongoose');
var app = express();
var bodyParser = require("body-parser");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.get("/view", function(req, res){
    res.render("home");
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));
// mongoose.connect("mongodb://localhost:4000");
// var userSchema = new mongoose.Schema({
//     userName: String,
//     pass: String,
//     name: String
// });
// var msmSchema = new mongoose.Schema({
//     content: String,
//     sender:String,
//     reer:String
// })
var low = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
var adapter = new FileSync("db.json");
var arrayOnline = [];
var arrayOnline2 = [];
var arrayCall = [];
db =low(adapter);
db.defaults({users: []}).write();
db.defaults({msm: []}).write();
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 4000);



io.on("connection", function(socket){
    var tmp;
	console.log(socket.id);
   socket.on("myname", function(data){
       socket.id_user  = data||"";
       tmp =socket.id_user;
       if(socket.id_user) {
           arrayOnline.push(socket.id_user);
           arrayOnline2.push({ten: tmp, id : socket.id});
       }
       io.sockets.emit("server-send-danhsach-users",{us : db.get("users").value() , arr: arrayOnline});
    });  
    socket.on("myname1", data =>{
        var ab = data.split(",");
        if(ab.length ==5){
            arrayCall.push({idcall: ab[0], uss : ab[1], id : socket.id});
        }
        if(ab.length ==6){
            arrayCall.push({idcall: ab[0], uss : ab[4], id : socket.id});
        }
    });
   socket.on("disconnect", function(){
       arrayOnline.forEach(i => {
           if(i === tmp){
            arrayOnline.splice(tmp,1); 
           }
       });
       arrayOnline2.forEach(i => {
        if(i.ten === tmp){
         arrayOnline2.splice(i,1); 
        }
    });
       socket.broadcast.emit("server-send-danhsach-users",{us : db.get("users").value() , arr: arrayOnline});
       
   });
   socket.on("logout", function(){
    arrayOnline.splice(tmp,1);
    socket.broadcast.emit("server-send-danhsach-users",{us : db.get("users").value() , arr: arrayOnline});
   });
  
    socket.on("nguoi-nhan-gui-id", data =>{
        var x = data.split(",");
        var tmpgoi;
        var tmpnhan;
        arrayCall.forEach(i=>{
            if(i.uss == x[1])
            tmpnhan = i.idcall;
        });
        arrayCall.forEach(i=>{
            if(i.uss == x[0])
            tmpgoi = i.id;
        });
        io.to(tmpgoi).emit('server-send-id-callee', tmpnhan);
    });
    
    socket.on("mychat", function(data){
        console.log(data);
        var arrrom = data.split(",");
        socket.join(arrrom[0]+","+arrrom[1]);
        socket.join(arrrom[1]+","+arrrom[0]);
        socket.Phong = data;
        socket.phong = arrrom[1]+","+arrrom[0];
        var mesages = db.get('msm').filter({sender : arrrom[0], received :arrrom[1]}||{sender : arrrom[1], received :arrrom[0]}).value();
        console.log(mesages);
        socket.emit("Server-say-ok", mesages);
        
       
    });
    socket.on("user-send-message",function(data){
        var ar = data.split(":");
        console.log(ar[1]);
        socket.join(ar[0]+","+ar[1]);
        socket.join(ar[1]+","+ar[0]);
        socket.phong = ar[0]+","+ar[1];
        io.sockets.in(socket.phong).emit("server-chat", ar[1]+":"+ ar[2]);
    });
    socket.on("co-nguoi-call", data =>{
        var array = data.split(",");
        var tmp;
        arrayOnline2.forEach(i=>{
            if(i.ten == array[2])
                tmp = i.id;
        });
        io.to(tmp).emit("server-bao-co-nguoi-goi", data);
    });
});

app.get("/" ,function(req,res){
    
   
    if(!req.cookies.name){
    res.redirect("/index");
    return;
    }
    var coo= req.cookies.name;
    var coo2 = [];
    coo2 = coo.split(' ');
    var i =0;
    for(i=2; i< coo2.length; i++)
        coo2[1] += " "+coo2[i];
    var usera =db.get('users').find({userName:coo2[0], name:coo2[1]     }).value();
    if(!usera){
        res.redirect("/index");
        return;
    }
    res.redirect("/messenger");
});
app.get("/index", function(req, res){
    res.render("index");
});
app.get("/create", function(req, res){
    res.render("create");
});
app.post("/index", function(req, res){
    //sẽ xử lý login chổ này
   
        var userName = req.body.userName.trim();
        var pass=req.body.pass.trim();
        var errors = [];
        if(userName ==="" || pass==="") errors.push("Tên đăng nhập hoặc mật khẩu không được để trống!");
        else{
        if(!(db.get("users").find({userName :userName}).value())) 
            errors.push("Tên đăng nhập không đúng!");
        if(!(db.get("users").find({pass :pass}).value() ))
           errors.push("Mật khẩu không chính xác!");
        }  
        if(errors.length){
            res.render('index', {
                errors : errors
            });
            return;
        };
        var coo =  userName +" "+ (db.get("users").find({userName :userName}).value().name);
        res.cookie('name',coo, {expire: 360000 + Date.now()}); 
        
    res.redirect("/messenger");
});
app.post("/create", function(req, res){
    var errors = [];
    var userName = req.body.userName.trim();
    if(!req.body.userName.trim())
        errors.push("Vui lòng nhập tên đăng nhập");
    if(db.get("users").find({userName :userName}).value())
        errors.push("Tài khoản đã tồn tại");
        else{
    if(!req.body.name.trim())
        errors.push("Vui lòng nhập tên hiển thị");
    if(!req.body.pass.trim())
        errors.push("Vui lòng nhập mật khẩu");
        }
    if(errors.length){
        if(errors.length){
            res.render('create', {
                errors : errors,
                
            });
            return;
        };
    }
    db.get("users").push({userName : req.body.userName.trim(),name : req.body.name.trim(),pass : req.body.pass.trim()}).write();
    var coo =  userName +" "+ (db.get("users").find({userName :userName}).value().name);
    res.cookie('name',coo, {expire: 360000 + Date.now()}); 
    res.redirect("/messenger");
            

   
});

app.get("/messenger/:userName", function(req, res){
    var userName = req.params.userName;
    var user = db.get("users").find({userName :userName}).value();
    if(user)
    res.render("messenger/view",{
        user : user
    });
    else 
    res.render("messenger");
});
app.get("/messenger/", function(req, res){
    res.render("messenger");
});
app.get("/messenger", function(req, res){
    res.render("messenger");
});
console.log(db.get("users").value());