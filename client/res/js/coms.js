/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
if (window.location.protocol === "https:")
    navigator.serviceWorker.register('/sw.js');
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
function notify(title, options) {
    if(getConfig('notifications') && (!getConfig('notifications-unfocused') || (getConfig('notifications-unfocused') && !document.hasFocus()))){
        Notification.requestPermission(function(result) {
            if (result === 'granted') {
                if (window.location.protocol === "https:"){
                    navigator.serviceWorker.ready.then(function(registration) {
                    registration.showNotification(title, options);
                    });
                } else {
                    //Notification fallback in case of non-https connection
                    var notification = new Notification(title, options);
                }
            }
        });
    }
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
function connect(id){
    var socket = io();
    var peer;
    socket.on('connect', function(){
        if(id != undefined){
            socket.emit("join_pc", id);
        } else {
            socket.emit("getCharacters");
        }
        sock = socket;
        gui.setConnectedStatus(true);
        gui.initStatistics(socket);
    });
    socket.response("getOffer", (req, res) => {
        peer = new Peer({ initiator: true, trickle: false })
        peer.on('signal', function(data){
            res(data);
        });
    });
    socket.response("getAnswer", (req, res) => {
        peer = new Peer({ initiator: false, trickle: false })
        peer.signal(req);

    });
    socket.reponse("finalize", (req, res) => {
        if(peer != null){
            peer.signal(req);

            var counter = 0;
            var i = setInterval(function(){
     
                peer.on("connect", function(){
                    //connection established
                    res(true);
                    clearInterval(i);
                });
    
                peer.on("error", function() {
                    //something went fucking horribly and terrifically wrong, probably I think
                    res(false);
                    clearInterval(i);
                });

            counter++;
            if(counter === 100) {
              clearInterval(i);
            }
            }, 50);
            //timeout error
            res(false);
        } else {
            console.log("couldn't create peer, no anser or offer attempted")
        }
    });
    socket.on('message', function(data){
        //console.log("message from: "+data.sender.name+": "+data.text);
        //$("div#tabContent div.tab[name=Comms] div#messageList").append("<div class='message'>"+data.name+" says: "+data.text+"</div>");
        if(id == data.sender.id){
            gui.showSent(data,socket);
        } else {
            gui.showMessage(data);
            notify('DnD Message', {
                icon: './../res/img/logo.png',
                body: `${data.sender.name} says: \n${data.text}`,
                vibrate: [300, 100, 400]
            });
        }
        
    });
    socket.on('playerListUpdate', function(data){
        //console.log(data);
        for(var index in data){
            if(data[index].id == id){
                //data.splice(id,1);
                delete data[index];
            }
        }
        //console.log(data);
        gui.updateContacts(data);
    });
    socket.on("recall",function(data){
        gui.removeMessage(data.messageId);
    });
    socket.on("recalled",function(data){
        gui.removeMessageRecall(data);
    });
    socket.on('disconnect', function(){
        sock = null;
        gui.setConnectedStatus(false);
    });
    socket.on("messages", function(data){
        if(data.length> 0){
            gui.clearMessages();
            for (var mes in data) {
                if (data.hasOwnProperty(mes)) {
                    if(id == data[mes].sender.id){
                        gui.showSent(data[mes],socket);
                    } else {
                        if(data[mes].status != undefined && data[mes].status[id] != undefined && data[mes].status[id] == "recalled"){
                            gui.showRemoved();
                        } else {
                            gui.showMessage(data[mes]);
                        }
                    }
                }
            }
        }
    });
    function sendMessage(){
        var cMessage = new Message();
        //name,nl2br($("div#tabContent div.tab[name=Comms] textarea#messageInput").val())
        cMessage.sender = id;
        cMessage.text = $("div#tabContent div.tab[name=Comms] textarea#messageInput").val();
        cMessage.text = cMessage.text.replace(/(\n)+/gi, '\n');
        $("div#tabContent div.tab[name=Comms] div#contactList a.button.active").each(function(){
            cMessage.recipients.push($(this).attr("name"));
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
