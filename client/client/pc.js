/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function init(){
    $("span.text#version").html(version);
    var name;
    var url;
    if(!isDebugMode()){
        if(sessionStorage.getItem("name") == null){
            name = prompt("Enter character name:");
            sessionStorage.setItem("name", name);
        } else {
            name = sessionStorage.getItem("name");
        }
        url = config.nodeUrl;
    } else {
        if(sessionStorage.getItem("name") == null){
            name = "test"+s4();
            sessionStorage.setItem("name", name);
        } else {
            name = sessionStorage.getItem("name");
        }
        if(sessionStorage.getItem("url") == null){
            var p = prompt("Enter url:");
            url = (p == "")? config.nodeUrl : "http://"+p+":3000";
            sessionStorage.setItem("url", url);
        } else {
            url = sessionStorage.getItem("url");
        }
    }

    connect(url, name, false);
    gui.init();
    $("div#tabHandles a.button#logout").on("click", function(){
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("url");
        window.location.href = "../chooseCharacter";
    })
    $("div#tabHandles a.button[name=Comms]").click();
}
$(function(){
    init();
});
