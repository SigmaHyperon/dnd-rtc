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
    constructor() {
        this.characterId = "";
        this.messageId = "";
    }
}

if(typeof module != "undefined"){
    var exports = module.exports = {};
    exports.character = Character;
    exports.message = Message;
    exports.recall = Recall;
}
