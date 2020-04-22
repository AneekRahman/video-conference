/*

    COPYRIGHT Aneek Rahman, 2018. ALL RIGHTS RESERVED. THE BELOW WRITTEN CODE IS NOT FOR COPY, REUSE, MODIFICATION,
    OR ANY KIND OF ADAPTATION. ANY KIND OF USE OF THIS CODE FOR PERSONAL, ORGANIZATIONAL, SPECIALLY BUSINESS PURPOSES IS PROHIBITED.
    IF YOU USE, ADAPT, REUSE, MODIFY AND USE, COPY THIS CODE IT WILL BE PLAGARISM AND THE OWNER HAS THE RIGHT TO PUSH
    CHARGES AND TAKE ACTION. PLEASE REPORT ANY KIND OF PLAGARISM OF THIS CODE IF IT COMES TO YOUR KNOWLEDGE. THANK YOU.

*/

var fs = require("fs");

var options = {

    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem"),
    passphrase: '123456789'

}

var express = require('express')
var app = express();
var server = require("https").createServer(options ,app);
var path = require('path');
var io = require("socket.io")(server);



io.on("error", function(e){

    console.log(e);

})

var userList = [];

io.on("connection", function(socket){

    socket.on("getActive", function(){

        io.sockets.emit("showActive", JSON.stringify(cleanArray(userList)));

    })
    
    var userI = null;

    socket.on("callUserList", function(){

        io.sockets.emit("reload", JSON.stringify(cleanArray(userList)));

    })

    socket.on("uid", function(id){

        var match = 0;

        for(var i = 0; i < userList.length; i++){

            if(userList[i] == id){

                match++;

            }

        }

        if(match == 0){

            userList.push(id);

            userI = i;

        }

        console.log(userList)

    })

    socket.on("peerClosed", function(username){

        console.log("Peer closed: " + username)

    })

    socket.on("forceDisconnect", function(){

        socket.disconnect();

    })

    socket.on("disconnect", function(){

        delete userList[userI];

        var clean = cleanArray(userList);

        io.sockets.emit("showActive", JSON.stringify(cleanArray(userList)));

        console.log("User disconnected: " + userI);

        console.log(clean);

        console.log("and Real: " + userList)

    })

    

})

srv = server.listen( 443, "192.168.0.102", function(){console.log("Listening 443")})

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: false
}))

app.use(express.static(path.join(__dirname)))

app.get("/", function(req, res){

    res.sendFile(__dirname + "/index.html");

})

function cleanArray(actual) {

  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;

}
