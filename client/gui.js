/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gui = {
    init : function(){
        this.initTabs();
        this.initContacts();
        this.updateMessageList();
        $(window).on("resize",gui.updateMessageList);
    },
    initTabs: function(){
        $("div#tabHandles a").on("click",function(){
            $("div#tabHandles a").removeClass("active");
            $(this).addClass("active");
            $("div#tabContent").children().hide();
            $("div#tabContent div.tab[name='"+$(this).attr("name")+"']").show();
        });
    },
    initContacts: function(){
        $("div#tabContent div.tab[name=Comms] div#contactList a.button").on("click", function(){
            $(this).toggleClass("active");
        });
    },
    updateContacts: function(contacts){
        $("div#tabContent div.tab[name=Comms] div#contactList a.button").remove();
        $(contacts).each(function(){
            $("div#tabContent div.tab[name=Comms] div#contactList").append("<a class='button'>"+this+"</a>");
        });
        this.initContacts();
    },
    showMessage: function(message){
        var text = "<div class='message' uid='"+message.id+"'>"+
                        "<div class='header'>"+
                            "<b>From:</b> "+message.name+"<br>"+
                            "<b>To:</b> "+ message.recipients.join(", ") +
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
    showSent: function(message,socket){
        var recipients = [];
        for (var id in message.recipients){
            recipients.push(message.recipients[id]+" <a class='button inline' name='"+message.recipients[id]+"' uid='"+message.id+"'>revoke</a>");
        }
        var text = "<div class='message'>"+
                        "<div class='header'>"+
                            "<b>Sent to:</b> "+ recipients.join(", ") +
                        "</div>"+
                        "<div class='body'>"+
                            message.text+
                        "</div>"+
                    "</div>";
        var domMessage = $("div#tabContent div.tab[name=Comms] div#messageList").append(text);
        $("a.button",domMessage).on("click",function(){
            var recallMessage = new recall($(this).attr("name"),$(this).attr("uid"));
            socket.emit("recall",recallMessage);
            //console.log($(this).attr("name"));
        });
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
    updateMessageList: function(){
        $("div#tabContent div.tab[name=Comms] div#messageList").css("width",$(window).width()-192+"px");
        $("div#tabContent div.tab[name=Comms] div#messageList").css("height",$(window).height()-99+"px");
        $("div#tabContent div.tab[name=Comms] div#messageList").scrollTop($("div#tabContent div.tab[name=Comms] div#messageList").prop('scrollHeight'));
    },
}