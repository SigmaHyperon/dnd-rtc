/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
let tools = require('./modules/tools');
const express = require('express');
var config = require('config');
const isMockMongo = (config.has('mongodb.mock') && config.get('mongodb.mock') === true);
var MongoClient = isMockMongo ? require('mongo-mock').MongoClient : require('mongodb').MongoClient;

function createApp(conf, services){
    const app = express();
    if(conf.bindApp === true){
        app.use('/', express.static('./../client'));
        //simulate empty worker file for notification service worker -.-
        app.use('/sw.js', (req, res) => {res.type('js'); res.send('');});
        app.use('/api/v1', services.rest);
    }
    if(conf.bindLetsEncrypt === true){
        app.use('/.well-known', express.static(config.get('letsEncrypt.verificationPath')));
    }
    return app;
}
function getServiceConfig(prefix){
    let bindApp = (config.has(`${prefix}.bindApp`) && config.get(`${prefix}.bindApp`) === true);
    let bindLetsEncrypt = (config.has('letsEncrypt') && config.has('letsEncrypt.enabled') && config.has(`${prefix}.bindLetsEncrypt`) && config.get(`${prefix}.bindLetsEncrypt`) === true && config.get('letsEncrypt.enabled') === true);
    let services = {bindApp, bindLetsEncrypt};
    let serviceList = Object.entries(services).filter(v=>v[1]).map(v=>v[0]).map(v=>v.replace('bind', ''));
    return {services, serviceList};
}

function initServer(db){
    if(isMockMongo){
        const {character} = require('./modules/classes');
        let c1 = new character();
        c1.name = "test";
        c1.icon = 1;
        let c2 = new character();
        c2.name = "test2";
        c2.icon = 2;
        db.collection('characters').insertOne(c1);
        db.collection('characters').insertOne(c2);
    }
    let io = require('./modules/chat')(db);
    let rest = require('./modules/rest')(db);

    if(config.has('http') && config.has('http.enabled') && config.get('http.enabled') === true){
        const http = require('http');
        let s = getServiceConfig('http');
        const app = createApp(s.services, {rest});
        //if app is only bound to https add redirect to http
        if(config.has('http.bindApp') && config.get('http.bindApp') === false && config.has('https') && config.has('https.enabled') && config.has('https.bindApp') && config.get('https.enabled') === true && config.get('https.bindApp') === true){
            app.use('/', (req, res) => {res.redirect('https://' + req.headers.host + req.url)});
        }
        
        let port = config.get('http.port');
        let server = http.createServer(app).listen(port);
        if(s.services.bindApp === true)
            io.listen(server);
    
        tools.log(`http listening on port ${port}, bound services: ${s.serviceList}`);
    }
    
    if(config.has('https') && config.has('https.enabled') && config.get('https.enabled') === true){
        const https = require('https');
        const fs = require('fs');
    
        let keyPath = (config.has('https.keyPath')) ? config.get('https.keyPath') : '/etc/letsencrypt/live/privkey.pem';
        let certPath = (config.has('https.certPath')) ? config.get('https.certPath') : '/etc/letsencrypt/live/fullchain.pem';
    
        let privateKey = fs.readFileSync(keyPath);
        let certificate = fs.readFileSync(certPath);
    
        tools.log(`loaded pKey from ${keyPath}`);
        tools.log(`loaded cert from ${certPath}`);
    
        let credentials = {key: privateKey, cert: certificate};
    
        let s = getServiceConfig('https');
        const app = createApp(s.services, {rest});
        
        let port = config.get('https.port');
        let server = https.createServer(credentials, app).listen(port);
        if(s.services.bindApp === true)
            io.listen(server);
    
        tools.log(`https listening on port ${port}, bound services: ${s.serviceList}`);
    }
}

MongoClient.connect(config.get('mongodb.url'), {}, function(err, db){
    if (err)
        throw err;
    initServer(db);
});
