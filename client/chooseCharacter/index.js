$(function(){
    let storage = (getConfig("remember") ? localStorage : sessionStorage);
    var name = storage.getItem("name");
    if(name != null){
        window.location.href = "../client";
    }
    fetch('/api/v1/getCharacters')
        .then((res) => {
            return res.json()
        })
        .then((res) => {
            console.log(res);
            gui.updateCharacterList(res);
        })
});
