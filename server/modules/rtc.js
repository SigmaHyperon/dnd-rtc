const ioreq = require("socket.io-request");

let networkManager = {
	nodes: [],
	addNode: function (n) {
		this.nodes.push(n);
	},
	verifyIntegrity(){
		if(this.nodes[0].treeSize() == this.nodes.length){
			return true;
		} else {

		}
	},
	restoreIntegrity(){
		let fragments = [];
		let index = 0;
		//nodes to fragment ids
		this.nodes.forEach(element => {
			fragments.push(...element.listConnectedNodes().map(v=>{return {id: v.id, fragment: index++}}));
		});
		//split each fragment into a speparate array
		fragments = fragments.reduce((acc, cur) => {
			if(typeof acc[cur.fragment] == 'undefined') acc[cur.fragment] = [];
			acc[cur.fragment].push(cur.id);
		}, []);
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
