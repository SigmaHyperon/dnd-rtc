function setupRest(db){
	const express = require('express');
	const bodyParser = require('body-parser');
	let app = express();
	app.use(bodyParser.json());
	app.get('/getCharacters', (req, res)=>{
		db.collection('characters').find({}).toArray(function(err, result){
			res.json(result);
		});
	});
	app.post('/createCharacter', (req, res)=>{
		var id = db.collection('characters').insertOne(req.body);
		db.collection('characters').update({_id: id.insertedId}, {stats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20:0}});
		res.sendStatus(200);
	});
	return app;
}

module.exports = setupRest;