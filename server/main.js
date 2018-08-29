/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var classes = require("./classes.js");

function log(text){
    var d = new Date();
    console.log(d.toLocaleTimeString()+"# "+text)
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
            log("player "+me.name+" has connected");
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
            //console.log(data);
            for (var index in data.recipients) {
                var s_Id = data.recipients[index];
                data.recipients[index] = new classes.character();
                data.recipients[index].load(result.find(function(element){return element.id == s_Id}));
            }
            //console.log(data);
            players[data.sender.id].socket.emit("message", data);
            for (var index in data.recipients){
                if(players[data.recipients[index].id] != undefined)
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
        {
            log("player "+me.name+" has disconnected");
            delete players[me.id];
        }

        io.emit("playerListUpdate", getRedactedPlayers());
    });
    socket.on("getCharacters",function(){
        db.collection("characters").find({}).toArray(function(err, result){
            //console.log(result);
            socket.emit("characterList", result);
        });
    });
    socket.on("createCharacter", function(data){
        var id = db.collection("characters").insertOne(data);
        db.collection("characters").update({_id: id.insertedId}, {stats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20:0}});
    });
    socket.on("stat", function(data){
        console.log("stat collected: "+data);
        var subquery = {};
        subquery["stats."+data] = 1;
        console.log(subquery);
        db.collection("characters").update({id: me.id}, {$inc: subquery});
        //Error: on entering 4 mongo crashes
    });
});
io.listen(config.nodePort);
