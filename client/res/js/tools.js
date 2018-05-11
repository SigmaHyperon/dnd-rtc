function isDebugMode(){
    var debugSwitch = "?debug"
    return window.location.href.indexOf(debugSwitch) == (window.location.href.length - debugSwitch.length);
}
