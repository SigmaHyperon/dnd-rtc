const ioreq = require("socket.io-request");
function randomArrayElement(a){
	return a[Math.floor(Math.random()*a.length)];
}

let networkManager = {
	nodes: [],
	addNode: function (n) {
		this.nodes.push(n);
	},
	verifyIntegrity(){
		return this.nodes[0].treeSize() == this.nodes.length
	},
	restoreIntegrity(){
		if(this.verifyIntegrity())
			return;
		let fragments = [];
        let index = 0;
        let done = [];
		this.nodes.forEach(element => {
            if(done.indexOf(element.id) == -1){
                let fragment = element.listConnectedNodes();
                fragments.push(fragment);
                done.push(...fragment);
            }
		});
		for(let i = 0; i < fragments.length-1; i++){
			let pair = [randomArrayElement(fragments[i]), randomArrayElement(fragments[i+1])];
			pair[0].connectTo(pair[1]);
		}
	},
	getById(id){
		for (let index = 0; index < this.nodes.length; index++) {
			const element = this.nodes[index];
			if(element.id == id)
				return element;
		}
	}
}
module.exports = (socket) => {
    let req = ioreq(socket);
    let uid = null;
    req.response("net-login",(req, res) => {
        let representation = new classes.node();
        uid = representation.id;
        representation.socket = socket;
        networkManager.addNode(representation);
        res();
    });
};
