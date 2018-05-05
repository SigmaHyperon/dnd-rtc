$(function(){
    var imageSelector = $("select[name=icon]");
    var nameInput = $("input[name=name]");
    var pwdInput = $("input[name=password]");
    for (var i = 1; i < 21; i++) {
        imageSelector.append('<option class="selectIcon" value="'+i+'" data-img-src="/dnd/res/img/classIconsSelected/Icon.'+ ((i < 10) ? "0" + i : i) +'.png"></option>')
    }
    imageSelector.imagepicker();
    $("div.button#reset").on("click",function(){
        nameInput.val("");
        pwdInput.val("");
    });
    $("div.button#submit").on("click", function(){
        var name = nameInput.val();
        var pwd = pwdInput.val();
    });
});
