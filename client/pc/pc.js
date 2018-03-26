/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function init(){
    var name;
    var url;
    if(!isDebugMode()){
        name = prompt("Enter character name:");
        url = 'http://sigmahyperon.nsupdate.info:3000';
    } else {
        name = "test"+s4();
        if(sessionStorage.getItem("url") == null){
            url = "http://"+prompt("Enter url:")+":3000";
            sessionStorage.setItem("url", url);
        } else {
            url = sessionStorage.getItem("url");
        }
    }

    connect(url, name, false);
    gui.init();
    $("div#tabHandles a.button[name=Comms]").click();
}
$(function(){
    init();
});
