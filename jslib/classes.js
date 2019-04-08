function c_s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
function guid() {
  return c_s4() + c_s4() + '-' + c_s4() + '-' + c_s4() + '-' +
    c_s4() + '-' + c_s4() + c_s4() + c_s4();
}

class Character {
    constructor(uid) {
        this.id = (uid == undefined) ? guid() : uid;
        this.name = "";
        this.password = "";
        this.icon = "";
        this.socket = null;
    }
    getRedacted(){
        var red = new Character(this.id);
        red.name = this.name;
        red.icon = this.icon;
        return red;
    }
    load(char){
        this.id = char.id;
        this.name = char.name;
        this.icon = char.icon;
    }
}

class Message {
    constructor() {
        this.id = guid();
        this.sender = null;
        this.recipients = [];
        this.text = "";
        this.status = {};
        this.time = {
            sent: Date.now(),
            received: {}
        };
    }
}

class Recall {
    constructor(charId = "", mesId = "") {
        this.characterId = charId;
        this.messageId = mesId;
    }
}

class Node {
    constructor(){
        this.id = guid();
        this.connectedTo = {};
        this.socket = null;
    }
    connectionCount(){
        return this.connectedTo.length;
    }
    treeSize(from){
        return Object.values(this.connectedTo)
                     .filter(v => from != v.id)
                     .reduce((acc, v) => acc + v.treeSize(this.id), 0);
    }
    listConnectedNodes(from){
        let connected = Object.values(this.connectedTo)
            .filter(v => v.id != from)
            .reduce((acc, v) => [...acc, ...v.listConnectedNodes(this.id)]);
        return [this.id, ...connected];
    }
    addConnectedNode(n, id){
        if(n instanceof Node){
            this.connectedTo[id] = n;
        } else {
            throw "non-node instance";
        }
    }
}

if(typeof module != "undefined"){
    var exports = module.exports = {};
    exports.character = Character;
    exports.message = Message;
    exports.recall = Recall;
    exports.node = Node;
}
