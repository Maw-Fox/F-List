/**
 * Adds a notification in the browser tab title that you have unread private messages.
 * If you wish to use this feature prior to it being pushed onto the 2.0 client live
 * just copy this code and paste it into your browser's console within the F-Chat tab.
 * Just keep in mind there could be minor bugs. Let me know if you find any.
 *
 * If you encounter any issues using this feature, you can remove it manually or
 * refresh your page to get rid of it. To manually remove this feature, open your browser's
 * console and delete the namespace associated with it by typing 'delete Kali' and pressing enter.
 *
 * Enjoy, and as always, have fun!
 *
 * @author Kali/Maw
 */

FList.Window = {
    Notice: {
        tabTally: {}
    }
};

/**
 * Title draw function.
 */
FList.Window.Notice.draw = function() {

    document.title = "(" + FList.Window.Notice.tabTally.sum +
        ") F-Chat (" + FList.Chat_identity + ")";

};

/**
 * Title tally function.
 * @param {string} tab Current tab ID
 */
FList.Window.Notice.newMsg = function(tab) {

    if (tab in FList.Window.Notice.tabTally) {
        FList.Window.Notice.tabTally[tab] += 1;
    } else {
        FList.Window.Notice.tabTally[tab] = 1;
    }

    if (FList.Window.Notice.tabTally.sum) {
        FList.Window.Notice.tabTally.sum += 1;
    } else {
        FList.Window.Notice.tabTally.sum = 1;
    }

    FList.Window.Notice.draw();
};

/**
 * On focus, subtract total unread messages from newly viewed tab from the title, then draw.
 * @param {string} tab Current tab ID
 */
FList.Window.Notice.readMsg = function(tab) {
    FList.Window.Notice.tabTally.sum -= FList.Window.Notice.tabTally[tab];

    delete FList.Window.Notice.tabTally[tab];

    if (FList.Window.Notice.tabTally.sum) {
        FList.Window.Notice.draw();
    } else {
        delete FList.Window.Notice.tabTally.sum;
        document.title = "F-Chat (" + FList.Chat_identity + ")";
    }

};

/**
 * Sets a global 'focus' variable, which returns true/false to check if the user is currently focused on this window.
 * Checks if on focus will allow the person to read backlogged notifications.
 */
window.onfocus = function() {
    var tabFocus = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id.toLowerCase();

    focus = true;

    if (tabFocus in FList.Window.Notice.tabTally) {
        FList.Window.Notice.readMsg(tabFocus);
    }
};

/**
 * Sets a global 'focus' variable
 */
window.onblur = function() {
    focus = false;
};

/**
 * Hooks
 */
FList.FChat_printMessage = function(message, type, origin, tab, addclasses){
    var scrollDown=false,
        wasMentioned = false,
        tabFocus = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id.toLowerCase();
    if($("#ChatArea .inner").prop("scrollTop")>=($("#ChatArea .inner").prop("scrollHeight")- $('#ChatArea .inner').height() )-50) scrollDown=true;
    var printclass=type;
    if(tab!=='all' && tab != 'reallyall' && type != "ChatTypeWarn"){
        if(FList.Chat_tabs.list[tab].type=="channel" && origin!==FList.Chat_identity){
            if(FList.Chat_detectHighlight(message) && type != "ChatTypeLeave" && type != "ChatTypeJoin") {
                wasMentioned = true;
                if(!FList.Chat_isTabOpen){
                    FList.Chat_notification.create(message, origin + " mentioned you.", origin,tab);
                }
                printclass="ChatTypeAttention";
                FList.Chat_tabs.flashTab(tab);
            } else if ($.inArray(FList.Chat_tabs.list[tab].id, FList.Chat_bingTabs) > -1 &&
                    type != "ChatTypeJoin" && type != "ChatTypeLeave") {
                FList.Chat_playSound("attention");
            }
        }
    }
    var rankclass="";
    if (typeof(addclasses) == "string" && addclasses.length > 0) printclass += " " + addclasses;
    if(jQuery.inArray(origin,FList.Chat_users.ops)!=-1) {
        var avatarclass = "AvatarLink OpLink";
        rankclass="<span class='RankChatop'></span>";
    }
    else if(tab!=='all' && tab != 'reallyall' && FList.Chat_ischanowner(origin,FList.Chat_tabs.list[tab].id)==1) {
        var avatarclass = "AvatarLink ChanOwnerLink";
        rankclass="<span class='RankOwner'></span>";
    }
    else if(tab!=='all' && tab != 'reallyall' && FList.Chat_ischanop(origin,FList.Chat_tabs.list[tab].id)==1) {
        var avatarclass = "AvatarLink ChanOpLink";
        rankclass="<span class='RankChanop'></span>";
    }
    else if(jQuery.inArray(origin,FList.Chat_users.tracklist)!=-1) var avatarclass = "AvatarLink FriendLink";
    else var avatarclass = "AvatarLink";

    if(origin in FList.Chat_users.userdata && (avatarclass != "AvatarLink FriendLink")) avatarclass += " Gender" + FList.Chat_users.userdata[origin].gender;

    if(type=="ChatTypeAction") {
        var norigin = origin;
        if (message.substr(0,2) == "'s") {
            message = message.substr(2);
            message="*<a class='" + avatarclass + "'>" + rankclass + norigin + "</a>'s " + message;
        }
        else message="*<a class='" + avatarclass + "'>" + rankclass + norigin + "</a> " + message;
    }
    var ct = new Date();
    var time=ct.getHours() + ":" + (ct.getMinutes() < 10 ? "0" + ct.getMinutes() : ct.getMinutes()) + " " + (ct.getHours() > 11 ? "PM" : "AM");
    if(origin=="" || (type!=="ChatTypeChat" && type != "ChatTypeWarn" && type!="ChatTypeAd")){
        var html='<span class="ChatMessage ' + printclass + '"><span class="ChatTimestamp">[' + time + ']</span>' + message +'</span>';
    } else {
        if (parseInt(tab) > 0) {
            var mytab = FList.Chat_tabs.list[tab];
            if (mytab.type == "channel" && type=="ChatTypeAd")
                message = FList.Chat_truncateMessage(message, FList.Chat_truncateMaxChars);
        }
        var html="<span class='ChatMessage " + printclass + "'><span class='ChatTimestamp'>[" + time + "]</span><a class='" + avatarclass + "'>" + rankclass + origin + "</a>: " + message + "</span>";
    }
    var html = $(html);
    // contextify any avatar links inside
    //FList.Chat_contextMenu.bindTo(html.children(".AvatarLink"));
    if(tab=="all"){//all is not all, just active tab and console.
        var mytab = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
        mytab.logs.unshift(html);
        if (FList.Chat_truncateLogs == true) {
            mytab.logs = mytab.logs.slice(0, FList.Chat_messageCap);
        }
        if(FList.Chat_tabs.currentIndex != 0){
            FList.Chat_tabs.list[0].logs.unshift(html);
        }
        html.appendTo("#ChatArea .inner");
     } else if(tab=="reallyall"){//ALL TABS, REALLY
        for (var tabindex in FList.Chat_tabs.list) {
            var mytab = FList.Chat_tabs.list[tabindex];
            mytab.logs.unshift(html);
            if (FList.Chat_truncateLogs == true) {
                mytab.logs = mytab.logs.slice(0, FList.Chat_messageCap);
            }
        }
        html.appendTo("#ChatArea .inner");
    } else {
        var mytab = FList.Chat_tabs.list[tab];
        mytab.logs.unshift(html);
        if (FList.Chat_truncateLogs == true ||
            (mytab.type == "channel" && FList.Chat_channels.getInstance(mytab.id).mode=="ads")){
                mytab.logs = mytab.logs.slice(0, FList.Chat_messageCap);
        }
        if(tab==FList.Chat_tabs.currentIndex){
            html.appendTo("#ChatArea .inner");
        }
    }
    if($(".ChatMessage").length>FList.Chat_messageCap){
        $(".ChatMessage:first").remove();
    }
    if (type == "ChatTypeAd") {
        FList.Chat_ads.receiveAd(html);
    }
    if(FList.Chat_filtermode=="hideads" && type=="ChatTypeAd")
        $(".ChatTypeAd:last").hide();
    if(FList.Chat_filtermode=="hidechats" && (type=="ChatTypeChat" || type=="ChatTypeAction"))
        $(".ChatTypeChat, .ChatTypeAction").hide();
    if(scrollDown)
        $("#ChatArea .inner").scrollTop($("#ChatArea .inner").prop("scrollHeight") - $('#ChatArea .inner').height());
    FList.Chat.Logs.Store(tab);

    if ((type === "ChatTypeChat" || type === "ChatTypeAction") &&
       (FList.Chat_tabs.list[tab].type === "person" || wasMentioned) &&
       (!focus || tabFocus !== FList.Chat_tabs.list[tab].id.toLowerCase())) {
        FList.Window.Notice.newMsg(FList.Chat_tabs.list[tab].id.toLowerCase());
    }

};

FList.Chat_tabs.switchTab = function(index){
    // Somewhere in the code, index is being passed as a string, not an int
    index = parseInt(index);

    // force a typing check to send the pausing message.
    FList.Chat_help.closeTooltip();
    FList.Chat_typing.check(true);

    //Store open textbox, switch to new.
    if(document.getElementById("MessageBox")!=null){
        this.list[this.currentIndex].textfield=document.getElementById("MessageBox").value;
        $("#MessageBox").focus();
        document.getElementById("MessageBox").value=this.list[index].textfield;
    }
    this.list[index].closed=false;
    this.currentIndex=index;
    this.currentType=this.list[index].type;
    if(this.currentType=="channel"){
        // ad buttons
        if(FList.Chat_channels.getInstance(this.list[index].id).mode=="chat"){
            $(".postadbutton").hide();
            $("#noadnotice").show();
        } else {
            $(".postadbutton").show();
            $("#noadnotice").hide();
        }
        // bing button
        if ($.inArray(this.list[index].id, FList.Chat_bingTabs) > -1) {
            $("#bingtoggle").val("Bing!");
            $("#bingtoggle").show();
        } else {
            $("#bingtoggle").val("No Bing");
            $("#bingtoggle").show();
        }
    } else {
        $(".postadbutton").hide();
        $("#noadnotice").hide();
        $("#bingtoggle").hide();
    }
    $(".ActiveChatTab .hcindicator").html("");
    $(".ActiveChatTab").removeClass("ActiveChatTab");
    $("#ChatTab" + index).removeClass("ChatTalk").addClass("ActiveChatTab").removeClass("ChatActivity").fadeIn("fast");
    $(".ActiveChatTab .hcindicator").html("*");
    FList.Chat.Logs.Draw(index);
    var logs = this.list[index].logs;
    var chatarea = $("#ChatArea .inner");
    var recentlogs = logs.slice(0, FList.Chat_messageCap).reverse();
    // empty the "sloppy" way to preserve event handlers and so on (context menus!!)
    chatarea.children("span").detach();
    $.each(recentlogs, function (i, log) {
        chatarea.append(log);
    });
    chatarea.scrollTop(chatarea.prop("scrollHeight") - chatarea.height());
    if (this.list[index].activity == true) {
        $("#TabBox .ActiveChatTab").stop().clearQueue().attr('style', '');
    }
    if(FList.Chat_filtermode=="hideads")
        $(".ChatTypeAd").hide();
    if(FList.Chat_filtermode=="hidechats")
        $(".ChatTypeChat, .ChatTypeAction").hide();

    this.list[index].activity=false;
    FList.Chat_users.update();
    FList.Chat_DisplayInfoBar(this.list[index].id);
    FList.Chat_typing.indicate();

    if (this.list[index].id.toLowerCase() in
            FList.Window.Notice.tabTally) {
        FList.Window.Notice.readMsg(this.list[index].id.toLowerCase());
    }

};

FList.Chat_tabs.closeTab = function(index) {
     $("#ChatTab" + index).qtip("destroy");
    // closing a tab means we aren't typing anymore.
    if (this.list[index].type == "person") {
        FList.Chat_send("TPN " + JSON.stringify({character: this.list[index].id, status: "clear"}));
    }
    this.list[index].closed=true;
    this.update();
    if(this.currentIndex==index) this.switchTab(this.findOpen("up"));

    if (this.list[index].id.toLowerCase() in
            FList.Window.Notice.tabTally) {
        FList.Window.Notice.readMsg(this.list[index].id.toLowerCase());
    }

};