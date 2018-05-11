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
        //console.log("===========================");
        //console.log("new player: "+name+" "+isDm);
        //console.log("total dms: "+ ((isDm) ? 1 : ((dm)? 1 : 0)));
        //console.log("total players: "+(Object.keys(players).length+1))
    }
}
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://172.24.0.100:27017/dndtest";
var players = {};


var io = require('socket.io')();
io.on('connection', function(socket){
    var me = null;
    //console.log(socket.to("test"));
    socket.on("join_dm",function(){
        me = new player("DM", true, socket);
        players["DM"] = me;
        io.emit("playerListUpdate", Object.keys(players));
    });
    socket.on("join_pc",function(name){
        me = new player(name, false, socket);
        players[name] = me;
        //console.log(Object.keys(players));
        io.emit("playerListUpdate", Object.keys(players));
    });
    socket.on("message",function(data){
        //console.log("message from: "+data.name+": "+data.text);
        //console.log(data.recipients);
        //console.log(players);
        players[data.name].socket.emit("message", data);
        for (var id in data.recipients){
            players[data.recipients[id]].socket.emit("message", data);
        }
    });
    socket.on("recall",function(data){
        //console.log("recall request from "+me.name+" to "+data.name+" for message #"+data.id);
        players[data.name].socket.emit("recall",data);
    });
    socket.on("disconnect",function(){
        //console.log("===========================");
        //console.log("player "+me.name+" disconnected");
        if(me != undefined)
            delete players[me.name];
        //console.log(Object.keys(players).length+" players left");
        io.emit("playerListUpdate", Object.keys(players));
    });
    socket.on("getCharacters",function(){
        MongoClient.connect(url, function(err, db){
            if (err)
                throw err;
            db.collection("characters").find({}).toArray(function(err, result){
                console.log(result);
                socket.emit("characterList", result);
            });
        });
    });
    socket.on("createCharacter", function(data){
        MongoClient.connect(url, function(err, db){
            if (err)
                throw err;
            db.collection("characters").insertOne(data);
        });
    });
});
io.listen(3000);
