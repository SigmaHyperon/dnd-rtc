/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class message {
    constructor(name, text){
        this.name = name;
        this.recipients = [];
        this.text = text;
    }
}
class recall {
    constructor(name, id){
        this.target = name;
        this.id = id;
    }
}
class player {
    constructor(name, isDm, socket){
        this.name = name;
        this.isDm = isDm;
        this.socket = socket;
        this.status = {};
        this.time = {
            sent: null,
            received: {}
        };
        //console.log("===========================");
        //console.log("new player: "+name+" "+isDm);
        //console.log("total dms: "+ ((isDm) ? 1 : ((dm)? 1 : 0)));
        //console.log(Object.keys(players));
        //console.log("total players: "+(Object.keys(players).length+1))
    }
}
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://172.24.0.100:27017/dndtest";
var db = null;
MongoClient.connect(url, function(err, dbl){
    if (err)
        throw err;
    db = dbl;
});
var players = {};


var io = require('socket.io')();
io.on('connection', function(socket){
    var me = null;
    socket.on("join_pc",function(name){
        me = new player(name, false, socket);
        players[name] = me;
        io.emit("playerListUpdate", Object.keys(players));
        db.collection("messages").find({$or: [{recipients: me.name}, {name: me.name}]}).toArray(function(err, result){
            if(err)
                throw err;
            //console.log(result);
            socket.emit("messages", result);
        });
    });
    socket.on("message",function(data){
        players[data.name].socket.emit("message", data);
        for (var id in data.recipients){
            players[data.recipients[id]].socket.emit("message", data);
        }
        db.collection("messages").insertOne(data);
    });
    socket.on("recall",function(data){
        players[data.name].socket.emit("recall",data);
        var statusObj = {};
        statusObj["status."+data.name] = "recalled";
        db.collection("messages").updateOne({id: data.id}, {$set: statusObj});
    });
    socket.on("disconnect",function(){
        if(me != undefined)
            delete players[me.name];
        io.emit("playerListUpdate", Object.keys(players));
        /*if(Object.keys(players).length == 0){
            db.collection("messages").deleteMany({});
        }*/
    });
    socket.on("getCharacters",function(){
        db.collection("characters").find({}).toArray(function(err, result){
            //console.log(result);
            socket.emit("characterList", result);
        });
    });
    socket.on("createCharacter", function(data){
        db.collection("characters").insertOne(data);
    });
});
io.listen(3000);
