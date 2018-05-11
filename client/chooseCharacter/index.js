$(function(){
    var name = sessionStorage.getItem("name");
    if(name != null){
        window.location.href = "../client";
    }
    connect("localhost:3000");
});
