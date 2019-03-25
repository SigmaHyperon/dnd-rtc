function c_s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
function c_guid() {
  return c_s4() + c_s4() + '-' + c_s4() + '-' + c_s4() + '-' +
    c_s4() + '-' + c_s4() + c_s4() + c_s4();
}

class Character {
    constructor(guid) {
        this.id = (guid == undefined) ? c_guid() : guid;
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
        this.id = c_guid();
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
        this.id = c_guid();
        this.connectedTo = [];
    }
    connectionCount(){
        return this.connectedTo.length;
    }
    treeSize(from){
        let count = 0;
        for (let index = 0; index < this.connectedTo.length; index++) {
            const element = this.connectedTo[index];
            if(from != element.id){
                count += element.treeSize(this.id);
            }
        }
        return ++count;
    }
    listConnectedNodes(from){
        let s = [this.id];
        this.connectedTo.forEach(element => {
            if(element.id != from) s.push(...element.listConnectedNodes(this.id));
        });
        return s;
    }
}
class Connection {
    constructor(){

    }
}

if(typeof module != "undefined"){
    var exports = module.exports = {};
    exports.character = Character;
    exports.message = Message;
    exports.recall = Recall;
    exports.node = Node;
}
