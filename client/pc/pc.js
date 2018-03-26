/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function init(name){
    connect(name,false);
    gui.init();
    $("div#tabHandles a.button[name=Comms]").click();
}
$(function(){
    var name = prompt("Enter character name:");
    //var name = "test";
    init(name);
});