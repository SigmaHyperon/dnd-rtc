/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var classes = require('./classes.js');

function log(text){
    var d = new Date();
    console.log(`${d.toLocaleTimeString()}# ${text}`);
}
const express = require('express');
var config = require('config');
var MongoClient = require('mongodb').MongoClient;
var db = null;
MongoClient.connect(config.get('mongodb.url'), function(err, dbl){
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
    return redPlayers;
}

var io = require('socket.io')();
io.on('connection', function(socket){
    var me = null;
    socket.on('join_pc',function(characterId){
        me = new classes.character();
        db.collection('characters').find({id: characterId}).toArray(function(err, result){
            me.load(result[0]);
            log(`player ${me.name} has connected`);
            me.socket = socket;
            players[me.id] = me;
            io.emit('playerListUpdate', getRedactedPlayers());
            db.collection('messages').find({$or: [{'recipients.id': me.id}, {'sender.id': me.id}]}).toArray(function(err, result){
                if(err)
                    throw err;
                socket.emit('messages', result);
            });
        });
    });
    socket.on('message',function(data){
        db.collection('characters').find({}).toArray(function(err, result){
            if (err)
                throw err;
            var sId = data.sender;
            data.sender = new classes.character();
            var c = result.find(function(element){
                return element.id == sId;
            });
            data.sender.load(c);
            for (var index in data.recipients) {
                var s_Id = data.recipients[index];
                data.recipients[index] = new classes.character();
                data.recipients[index].load(result.find(function(element){return element.id == s_Id}));
            }
            players[data.sender.id].socket.emit('message', data);
            for (var index in data.recipients){
                if(players[data.recipients[index].id] != undefined)
                    players[data.recipients[index].id].socket.emit('message', data);
            }
            db.collection('messages').insertOne(data);
        });
    });
    socket.on('recall',function(data){
        if(players[data.characterId])
            players[data.characterId].socket.emit('recall',data);
        socket.emit('recalled', data);
        var statusObj = {};
        statusObj['status.'+data.characterId] = 'recalled';
        db.collection('messages').updateOne({id: data.messageId}, {$set: statusObj});
    });
    socket.on('disconnect',function(){
        if(me != undefined)
        {
            log(`player ${me.name} has disconnected`);
            delete players[me.id];
        }
        io.emit('playerListUpdate', getRedactedPlayers());
    });
    socket.on('getCharacters',function(){
        db.collection('characters').find({}).toArray(function(err, result){
            socket.emit('characterList', result);
        });
    });
    socket.on('createCharacter', function(data){
        var id = db.collection('characters').insertOne(data);
        db.collection('characters').update({_id: id.insertedId}, {stats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20:0}});
    });
    socket.on('stat', function(data){
        console.log(`stat collected: ${data}`);
        var subquery = {};
        subquery[`stats.d${data}`] = 1;
        console.log(subquery);
        db.collection('characters').update({id: me.id}, {$inc: subquery}, function(err, res){
            if(err)
                console.log(err);
        });
        //Error: on entering 4 mongo crashes
    });
});

function createApp(conf){
    const app = express();
    if(conf.bindApp === true){
        app.use('/', express.static('./../client'));
    }
    if(conf.bindLetsEncrypt === true){
        app.use('/.well-known', express.static(config.get('letsEncrypt.verificationPath')));
    }
    return app;
}
function getServiceConfig(prefix){
    let bindApp = (config.has(`${prefix}.bindApp`) && config.get(`${prefix}.bindApp`) === true);
    let bindLetsEncrypt = (config.has('letsEncrypt') && config.has('letsEncrypt.enabled') && config.has(`${prefix}.bindLetsEncrypt`) && config.get(`${prefix}.bindLetsEncrypt`) === true && config.get('letEncrypt.enabled') === true);
    let services = {bindApp, bindLetsEncrypt};
    let serviceList = Object.entries(services).filter(v=>v[1]).map(v=>v[0]);
    return {services, serviceList};
}

if(config.has('http') && config.has('http.enabled') && config.get('http.enabled') === true){
    const http = require('http');
    let s = getServiceConfig('http');
    const app = createApp(s.services);
    if(s.services.bindApp === true)
        io.attach(http);

    let port = config.get('http.port');
    http.createServer(app).listen(port);
    log(`http listening on port ${port}, bound services: ${s.serviceList}`);
}

if(config.has('https') && config.has('https.enabled') && config.get('https.enabled') === true){
    const https = require('https');
    const fs = require('fs');

    let keyPath = (config.has('https.keyPath')) ? config.get('https.keyPath') : '/etc/letsencrypt/live/privkey.pem';
    let certPath = (config.has('https.certPath')) ? config.get('https.certPath') : '/etc/letsencrypt/live/fullchain.pem';

    let privateKey = fs.readFileSync(keyPath);
    let certificate = fs.readFileSync(certPath);

    log(`loaded pKey from ${keyPath}`);
    log(`loaded cert from ${certPath}`);

    let credentials = {key: privateKey, cert: certificate};

    let s = getServiceConfig('https');
    const app = createApp(s.services);
    if(s.services.bindApp === true)
        io.attach(https);

    let port = config.get('https.port');
    https.createServer(credentials, app).listen(port);
    log(`https listening on port ${port}, bound services: ${s.serviceList}`);
}
