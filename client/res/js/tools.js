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
    return nl2br(htmlSpecialChars(text));
}

