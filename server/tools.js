function log(text){
    var d = new Date();
    console.log(`${d.toLocaleTimeString()}# ${text}`);
}

module.exports = {log};