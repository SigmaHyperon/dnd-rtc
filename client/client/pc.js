/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function init(){
    $("span.text#version").html(version);
    var name;
    let storage = (getConfig("remember") ? localStorage : sessionStorage);
    if(!isDebugMode()){
        if(storage.getItem("name") == null || storage.getItem("name") == "null"){
            storage.removeItem("name");
            window.location.href = "../chooseCharacter";
        } else {
            name = storage.getItem("name");
        }
    } else {
        if(storage.getItem("name") == null){
            name = "test"+s4();
            storage.setItem("name", name);
        } else {
            name = storage.getItem("name");
        }
    }

    connect(name);
    gui.init();
    $("div#tabHandles a.button#logout").on("click", function(){
        storage.removeItem("name");
        window.location.href = "../chooseCharacter";
    })
    $("div#tabHandles a.button[name=Comms]").click();
}
$(function(){
    init();
});
