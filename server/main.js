/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var classes = require("./classes.js");
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
    constructor(name, socket){
        this.name = name;
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
var config = require("./config.js");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://172.24.0.100:27017/dndtest";
var db = null;
MongoClient.connect(config.mongoUrl, function(err, dbl){
    if (err)
        throw err;
    db = dbl;
});
var players = {};
var getRedactedPlayers = function(){
    var redPlayers = {};
    for (var id in players) {
        if (players.hasOwnProperty(id)) {
            redPlayers[id] = players[id].getRedacted();
        }
    }
    //console.log(redPlayers);
    return redPlayers;
}

var io = require('socket.io')();
io.on('connection', function(socket){
    var me = null;
    socket.on("join_pc",function(characterId){
        //me = new player(name, socket);
        me = new classes.character();
        db.collection("characters").find({id: characterId}).toArray(function(err, result){
            //console.log(result);
            me.load(result[0]);
            me.socket = socket;
            players[me.id] = me;
            //console.log(players);
            io.emit("playerListUpdate", getRedactedPlayers());
            db.collection("messages").find({$or: [{"recipients.id": me.id}, {"sender.id": me.id}]}).toArray(function(err, result){
                if(err)
                    throw err;
                //console.log(result);
                socket.emit("messages", result);
            });
        });
    });
    socket.on("message",function(data){
        db.collection("characters").find({}).toArray(function(err, result){
            if (err)
                throw err;
            var sId = data.sender;
            data.sender = new classes.character();
            var c = result.find(function(element){
                return element.id == sId;
            });
            data.sender.load(c);
            console.log(data);
            for (var index in data.recipients) {
                var s_Id = data.recipients[index];
                data.recipients[index] = new classes.character();
                data.recipients[index].load(result.find(function(element){return element.id == s_Id}));
            }
            console.log(data);
            players[data.sender.id].socket.emit("message", data);
            for (var index in data.recipients){
                players[data.recipients[index].id].socket.emit("message", data);
            }
            db.collection("messages").insertOne(data);
        });
    });
    socket.on("recall",function(data){
        players[data.characterId].socket.emit("recall",data);
        var statusObj = {};
        statusObj["status."+data.characterId] = "recalled";
        db.collection("messages").updateOne({id: data.messageId}, {$set: statusObj});
    });
    socket.on("disconnect",function(){
        if(me != undefined)
            delete players[me.id];
        io.emit("playerListUpdate", getRedactedPlayers());
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
io.listen(config.nodePort);
