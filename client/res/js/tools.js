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