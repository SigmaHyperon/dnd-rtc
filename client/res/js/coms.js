/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var sock = null;
function nl2br(str) {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br>' +'$2');
}
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
class message {
    constructor(name, text){
        this.id = guid();
        this.name = name;
        this.recipients = [];
        this.text = text;
        this.status = {};
        this.time = {
            sent: Date.now(),
            received: {}
        };
    }
}
class recall {
    constructor(name, id){
        this.name = name;
        this.id = id;
    }
}

function emit(key, data){
    if(sock == null){
        return false;
    }
    sock.emit(key,data);
    return true;
}
function connect(url, name, isDm){
    //'http://sigmahyperon.nsupdate.info:3000'
    var socket = io(url);
    socket.on('connect', function(){
        if(name != undefined){
            if(isDm){
                socket.emit("join_dm", name);
            } else {
                socket.emit("join_pc", name);
            }
        } else {
            socket.emit("getCharacters");
        }
        sock = socket;
        gui.setConnectedStatus(true);
    });
    socket.on('message', function(data){
        console.log("message from: "+data.name+": "+data.text);
        //$("div#tabContent div.tab[name=Comms] div#messageList").append("<div class='message'>"+data.name+" says: "+data.text+"</div>");
        if(name == data.name){
            gui.showSent(data,socket);
        } else {
            gui.showMessage(data);
        }
        /*Notifications:
         * var notification = new Notification('Notification title', {
            //icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
            body: data.name+" says: "+data.text,
        });*/
    });
    socket.on('playerListUpdate', function(data){
        for(var id in data){
            if(data[id] == name){
                data.splice(id,1);
            }
        }
        gui.updateContacts(data);
    });
    socket.on("recall",function(data){
        console.log(data);
        gui.removeMessage(data.id);
    });
    socket.on('disconnect', function(){
        sock = null;
        gui.setConnectedStatus(false);
    });
    socket.on("characterList", function(data){
        console.log(data);
        gui.updateCharacterList(data);
    });
    socket.on("messages", function(data){
        console.log(data);
        for (var mes in data) {
            if (data.hasOwnProperty(mes)) {
                if(name == data[mes].name){
                    gui.showSent(data[mes],socket);
                } else {
                    console.log(data[mes]);
                    if(data[mes].status != undefined && data[mes].status[name] != undefined && data[mes].status[name] == "recalled"){
                        gui.showRemoved();
                    } else {
                        gui.showMessage(data[mes]);
                    }
                }
            }
        }
    });
    function sendMessage(){
        var cMessage = new message(name,nl2br($("div#tabContent div.tab[name=Comms] textarea#messageInput").val()));
        $("div#tabContent div.tab[name=Comms] div#contactList a.button.active").each(function(){
            cMessage.recipients.push($(this).text());
        });
        socket.emit("message", cMessage);
        $("div#tabContent div.tab[name=Comms] textarea#messageInput").val('');
    }
    $("div#tabContent div.tab[name=Comms] div#footer textarea#messageInput").on("keydown", function(e){
        if(e.which == 13 && e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    $("div#tabContent div.tab[name=Comms] div#footer a.button").on("click", function(e){
        e.preventDefault();
        sendMessage();
    });
}
