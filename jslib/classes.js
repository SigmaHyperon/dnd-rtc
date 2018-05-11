class Character {
    constructor() {
        this.name = "";
        this.password = "";
        this.icon = "";
    },
    getRedacted(){
        var red = new Character();
        red.name = this.name;
        red.icon = this.icon;
    },
}
