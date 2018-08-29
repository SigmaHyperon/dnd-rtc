/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var d20 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

var gui = {
    init : function(){
        this.initTabs();
        this.initContacts();
        this.updateMessageList();
        this.initStatistics();
        $(window).on("resize",gui.updateMessageList);
    },
    initTabs: function(){
        $("div#tabHandles a.button.tabHandle").on("click",function(){
            $("div#tabHandles a").removeClass("active");
            $(this).addClass("active");
            $("div#tabContent").children().hide();
            $("div#tabContent div.tab[name='"+$(this).attr("name")+"']").show();
        });
    },
    initContacts: function(){
        $("div#tabContent div.tab[name=Comms] div#contactList a.button").off("click").on("click", function(){
            $(this).toggleClass("active");
        });
    },
    updateNumpad: function(){
        $("div#tabContent div.tab[name=Statistics] div#numpad a.button.number").each(function(){
            if(!d20.includes(parseInt($("div#tabContent div.tab[name=Statistics] div#value").text() + $(this).attr("value")))){
                $(this).addClass("disabled");
            } else {
                $(this).removeClass("disabled");
            }
        });
        if(!d20.includes(parseInt($("div#tabContent div.tab[name=Statistics] div#value").text()))){
            $("div#tabContent div.tab[name=Statistics] div#numpad a.button#send").addClass("disabled");
        } else {
            $("div#tabContent div.tab[name=Statistics] div#numpad a.button#send").removeClass("disabled");
        }
        if($("div#tabContent div.tab[name=Statistics] div#value").text().trim() == ""){
            $("div#tabContent div.tab[name=Statistics] div#numpad a.button#reset").addClass("disabled");
        } else {
            $("div#tabContent div.tab[name=Statistics] div#numpad a.button#reset").removeClass("disabled");
        }
    },
    initStatistics: function(socket){
        $("div#tabContent div.tab[name=Statistics] div#numpad a.button.number").on("click", function(){
            if(!$(this).hasClass("disabled")){
                var text = $("div#tabContent div.tab[name=Statistics] div#value").text() + $(this).attr("value");
                $("div#tabContent div.tab[name=Statistics] div#value").text(text);
                gui.updateNumpad();
            }
        });
        $("div#tabContent div.tab[name=Statistics] div#numpad a.button#reset").on("click",function(){
            $("div#tabContent div.tab[name=Statistics] div#value").text("");
            gui.updateNumpad();
        });
        $("div#tabContent div.tab[name=Statistics] div#numpad a.button#send").on("click", function(){
            if(!$(this).hasClass("disabled")){
                var val = $("div#tabContent div.tab[name=Statistics] div#value").text();
                if(socket)
                    socket.emit("stat", val);
                $("div#tabContent div.tab[name=Statistics] div#value").text("");
                gui.updateNumpad();
            }
        });
        gui.updateNumpad();
    },
    updateContacts: function(contacts){
        //console.log(contacts);
        var contactArray = Object.keys(contacts).map(function (key) { return contacts[key]; });
        contactArray = contactArray.sort(function(a, b){
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        });
        var contactList = "div#tabContent div.tab[name=Comms] div#contactList";
        //$("div#tabContent div.tab[name=Comms] div#contactList a.button").remove();
        //$(contacts).each(function(){
        //console.log(contactArray);
        var buttons = [];
        for (var index in contactArray) {
            if (contactArray.hasOwnProperty(index)) {
                if($("a.button[name="+contactArray[index].id+"]", contactList).length == 0){
                    //$("div#tabContent div.tab[name=Comms] div#contactList").append("<a class='button current' name='"+contactArray[index].id+"'>"+contactArray[index].name+"</a>");
                    buttons.push("<a class='button character' name='"+contactArray[index].id+"'><img width='50' src='../res/img/classIconsSelected/Icon."+(contactArray[index].icon < 10 ? "0" + contactArray[index].icon : contactArray[index].icon)+ ".png'/><span>" +contactArray[index].name+"</span></a>");
                } else {
                    //$("a.button[name="+contactArray[index].id+"]", contactList).addClass("current");
                    buttons.push($("a.button[name="+contactArray[index].id+"]", contactList).removeClass("offline").detach());
                }
            }
        }
        var offlineContacts = $("a.button.character", contactList).detach();
        offlineContacts.addClass("offline");
        buttons = [...buttons, ...offlineContacts];
        //});
        //$("a.button", contactList).not(".current").remove();
        //$("a.button", contactList).removeClass("current");
        //$("div#tabContent div.tab[name=Comms] div#contactList").children().remove();
        $("div#tabContent div.tab[name=Comms] div#contactList").append(buttons);
        this.initContacts();
    },
    showMessage: function(message){
        //console.log(message);
        var recipients = [];
        for (var index in message.recipients) {
            if (message.recipients.hasOwnProperty(index)) {
                recipients.push(message.recipients[index].name);
            }
        }
        var text = "<div class='message' uid='"+message.id+"'>"+
                        "<div class='header'>"+
                            "<b>From:</b> "+message.sender.name+"<br>"+
                            "<b>To:</b> "+ recipients.join(", ") +
                        "</div>"+
                        "<div class='body'>"+
                            message.text+
                        "</div>"+
                    "</div>";
        $("div#tabContent div.tab[name=Comms] div#messageList").append(text);
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
    removeMessage: function(uid){
        $("div#tabContent div.tab[name=Comms] div#messageList div.message[uid='"+uid+"']").replaceWith("<div class='message removed'>removed</div>");
    },
    showRemoved: function(){
        $("div#tabContent div.tab[name=Comms] div#messageList").append("<div class='message removed'>removed</div>");
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
    showSent: function(message,socket){
        var recipients = [];
        for (var id in message.recipients){
            recipients.push(message.recipients[id].name+" <a class='button inline' name='"+message.recipients[id].id+"' uid='"+message.id+"'>revoke</a>");
        }
        var text = "<div class='message self'>"+
                        "<div class='header'>"+
                            "<b>Sent to:</b> "+ recipients.join(", ") +
                        "</div>"+
                        "<div class='body'>"+
                            message.text+
                        "</div>"+
                    "</div>";
        var domMessage = $("div#tabContent div.tab[name=Comms] div#messageList").append(text);
        $("a.button",domMessage).on("click",function(){
            var recallMessage = new Recall($(this).attr("name"),$(this).attr("uid"));
            socket.emit("recall",recallMessage);
            //console.log($(this).attr("name"));
        });
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
    updateMessageList: function(){
        //$("div#tabContent div.tab[name=Comms] div#messageList").css("width",$(window).width()-192+"px");
        //$("div#tabContent div.tab[name=Comms] div#messageList").css("height",$(window).height()-99+"px");
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
    updateCharacterList: function(characters){
        for (var index in characters) {
            var char = characters[index];
            $('<div class="character button"><img src="../res/img/classIconsSelected/Icon.'+
            ((char.icon < 10) ? "0" + char.icon : char.icon)+
            '.png" alt="" width="50" height="50"><br>'+char.name+'</div>').prependTo("div.characters").data("character", char);
        }
        $("div.button.character").not("#add").on("click",function(){
            if(sessionStorage.getItem("name") == null){
                sessionStorage.setItem("name", $(this).data("character").id);
                window.location.href = "../client";
            } else {
                window.location.href = "../client";
            }
        });
    },
    setConnectedStatus: function(connected){
        if(connected){
            $("i#connected").css("color", "green").html("wifi");
        } else {
            $("i#connected").css("color", "red").html("signal_wifi_off");
        }
    },
    clearMessages: function(){
        $("div#tabContent div.tab[name=Comms] div#messageList").children().remove();
    },
}
