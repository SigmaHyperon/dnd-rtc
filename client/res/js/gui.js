/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var d20 = [...Array(20).keys()].map(v=>v+1); //die faces 1-20

function updateSettings() {
    if(getConfig('compact') === true){
        $('body').addClass('compact');
    } else {
        $('body').removeClass('compact');
    }
}

var gui = {
    init : function(){
        this.initTabs();
        this.initContacts();
        this.updateMessageList();
        //this.initStatistics();
        this.initSettings();
        this.initFilter();
        updateSettings();
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
            gui.updateFilter();
        });
    },
    initSettings: function(){
        let config = localStorage.getItem("config");
        if(config === null){
            config = {};
        } else {
            config = JSON.parse(config);
        }
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const element = config[key];
                $(`div.tab[name=Settings] input[name=${key}]`)[0].checked = element;
            }
        }
        $("div.tab[name=Settings] input").on("change", (e) => {
            let config = localStorage.getItem("config");
            if(config === null){
                config = {};
            } else {
                config = JSON.parse(config);
            }
                
            config[$(e.target).attr("name")] = $(e.target).is(':checked');
            localStorage.setItem("config", JSON.stringify(config));
            updateSettings();
        });
    },
    initFilter: function(){
        $("div#contactList input#filter").on('change', (e) => {
            this.updateFilter();
        });
    },
    updateFilter: function(){
        let filterEnabled = $("div#contactList input#filter").is(':checked');
        $("div#tabContent div.tab[name=Comms] div#messageList").children().removeClass('hidden');
        if(filterEnabled){
            let selectedRecipients = $("div#tabContent div.tab[name=Comms] div#contactList a.button.active").toArray().map(v=>$(v).attr("name"));
            if(!(selectedRecipients.length === 0)){
                $("div#tabContent div.tab[name=Comms] div#messageList").children().each((v, e) => {
                    if($(e).hasClass('removed')){
                        $(e).addClass('hidden');
                        return;
                    }
                    let concerning = $(e).attr("concerning").split(' ');
                    if(!concerning.some((v=>(selectedRecipients.indexOf(v) > -1)))){
                        $(e).addClass('hidden');
                    }
                });
            }
        }
        gui.updateMessageList();
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
                    socket.emit("stat", parseInt(val));
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
        /*for (var index in message.recipients) {
            if (message.recipients.hasOwnProperty(index)) {
                recipients.push(message.recipients[index].name);
            }
        }*/
        var text = "<div class='message talk-bubble tri-right round left-top' uid='"+formatOutput(message.id)+"' concerning='" + formatOutput(message.sender.id) + "'>"+
                        "<div class='header'>"+
                            "<div class='metadata'><b>From:</b> "+formatOutput(message.sender.name)+"<br>"+
                            "<b>To:</b> "+ formatOutput(message.recipients.map(v=>v.name).join(", "))+ '</div>' +
                            '<div class="time">'+ formatDateISO8601(message.time.sent) + '</div>'+
                        "</div>"+
                        "<div class='body'>"+
                            formatOutput(message.text)+
                        "</div>"+
                    "</div>";
        $("div#tabContent div.tab[name=Comms] div#messageList").append(text);
        this.updateMessageList();
    },
    removeMessage: function(uid){
        $("div#tabContent div.tab[name=Comms] div#messageList div.message[uid='"+uid+"']").replaceWith("<div class='message removed'>removed</div>");
    },
    removeMessageRecall: function(data){
        let {characterId, messageId} = data;
        $("div#tabContent div.tab[name=Comms] div#messageList div.message.self[uid='"+uid+"']").replaceWith("<div class='message removed'>removed</div>");
    },
    showRemoved: function(){
        $("div#tabContent div.tab[name=Comms] div#messageList").append("<div class='message removed'>removed</div>");
        this.updateMessageList();
    },
    showSent: function(message,socket){
        var recipients = [];
        for (var id in message.recipients){
            let sUser = message.recipients[id];
            let status = (message.status[sUser.id] == 'recalled') ? 'revoked' : 'revoke';
            let buttonDom = `<a class="button inline ${status}" name="${sUser.id}" uid="${message.id}">${status}</a>`
            recipients.push(formatOutput(sUser.name)+buttonDom);
        }
        var text = "<div class='message self talk-bubble tri-right round right-top' concerning='"+message.recipients.map(v=>v.id).join(' ')+"'>"+
                        "<div class='header'>"+
                            "<div class='metadata'><b>Sent to:</b> "+ recipients.join(", ")+ "</div>" +
                            '<div class="time">'+ formatDateISO8601(message.time.sent) + '</div>'+
                        "</div>"+
                        "<div class='body'>"+
                            formatOutput(message.text)+
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
            let storage = (getConfig("remember") ? localStorage : sessionStorage);
            if(storage.getItem("name") == null){
                storage.setItem("name", $(this).data("character").id);
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
