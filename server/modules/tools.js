function log(text) {
    var d = new Date();
    console.log(`${d.toLocaleTimeString()}# ${text}`);
}
function c_s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
function guid() {
    return c_s4() + c_s4() + '-' + c_s4() + '-' + c_s4() + '-' +
        c_s4() + '-' + c_s4() + c_s4() + c_s4();
}

module.exports = { log, guid };