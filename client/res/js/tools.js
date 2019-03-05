function isDebugMode(){
    var debugSwitch = "?debug"
    return window.location.href.indexOf(debugSwitch) == (window.location.href.length - debugSwitch.length);
}

function htmlSpecialChars(text){
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function nl2br(text){
    return text.replace(/\n/g, '<br>');
}

function formatOutput(text){
    return wrapURLs(nl2br(htmlSpecialChars(text)));
}

function getConfig(key){
    let config = localStorage.getItem("config");
    if(config == null)
        return null;
    config = JSON.parse(config);
    return config[key];
}
var wrapURLs = function (text) {
    var url_pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig;
    
    return text.replace(url_pattern, function (url) {
      var protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
      var href = protocol_pattern.test(url) ? url : 'http://' + url;
      return '<a href="' + href + '" target="_blank">' + url + '</a>';
    });
};
function paddZero(text, length){
    return `${'0'.repeat(length - `${text}`.length)}${text}`;
}

function formatDateISO8601(d){
    let date = new Date(d);
    let dateString = `${date.getFullYear()}-${paddZero(date.getMonth()+1, 2)}-${paddZero(date.getDate(), 2)}`;
    let timeString = `${paddZero(date.getHours(), 2)}:${paddZero(date.getMinutes(), 2)}:${paddZero(date.getSeconds(), 2)}`;
    let fullDateString = `${dateString} ${timeString}`;
    return fullDateString;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function extParseInt(s){
    if(s == undefined || s == '')
        return 0;
    return parseInt(s);
}

function parseDice(s){
    s = s.replace(/\s/g, '');
    let match = s.match(/((\d*)d)?(\d{1,3})(\+(\d*))?/);
    let c = extParseInt(match[2]);
    c = c == 0 ? 1 : c;
    let res = {plus: extParseInt(match[5]), rolls: []};
    for (let index = 0; index < c; index++) {
        res.rolls.push(getRandomInt(match[3])+1);
    }
    res.total = res.rolls.reduce((a,b) => a + b, 0) + extParseInt(res.plus);
    return res;
}