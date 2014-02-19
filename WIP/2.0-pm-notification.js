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

FList.tNotice = {
    tabTally: {}
};

var focus; /**@define {Boolean} focus Global window focus variable*/

/**
 * Title draw function.
 */
FList.tNotice.draw = function() {
    document.title = '(' + this.tabTally.sum + ') F-list - Chat';
};

/**
 * Title tally function.
 * @param {string} tab Current tab ID
 */
FList.tNotice.newMsg = function(tab) {

    if (tab in this.tabTally) {
        this.tabTally[tab] += 1;
    } else {
        this.tabTally[tab] = 1;
    }

    if (this.tabTally.sum) {
        this.tabTally.sum += 1;
    } else {
        this.tabTally.sum = 1;
    }

    this.draw();
};

/**
 * On focus, subtract total unread messages from newly viewed tab from the title, then draw.
 * @param {string} tab Current tab ID
 */
FList.tNotice.readMsg = function(tab) {

    this.tabTally.sum -= this.tabTally[tab];

    delete this.tabTally[tab];

    if (this.tabTally.sum) {
        this.draw();
    } else {
        delete this.tabTally.sum;
        document.title = "F-list - Chat";
    }

};

/**
 * Sets a global 'focus' variable, which sets a true/false value to check if the user is currently focused on this window.
 * Checks if on focus will allow the person to read backlogged notifications.
 */
window.onfocus = function() {
    focus = true;

    if (FList.Chat.TabBar.activeTab.id.toLowerCase() in
            FList.tNotice.tabTally) {
        FList.tNotice.readMsg(FList.Chat.TabBar.activeTab.id.toLowerCase());
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
FList.Chat.printMessage = function(_message, _type, _id, _origin, _tab, _messagetype, _log){
    var scrollDown=false,
        highlight=false,
        classList="chat-message chat-type-" + _messagetype,
        tabFocus = FList.Chat.TabBar.activeTab.id.toLowerCase(),
        ct = new Date(),
        time=ct.getHours() + ":" + (ct.getMinutes() < 10 ? "0" + ct.getMinutes() : ct.getMinutes()) + " " + (ct.getHours() > 11 ? "PM" : "AM");
    if(_origin===FList.Chat.identity) classList +=" chat-type-own";
    if($("#chat-content-chatarea > div").prop("scrollTop")>=($("#chat-content-chatarea > div").prop("scrollHeight")- $('#chat-content-chatarea > div').height() )-50) scrollDown=true;
    if(_message.substring(0,6)==="/warn " && _type==="channel"){
    if(jQuery.inArray(_origin,FList.Chat.opList)!==-1 || jQuery.inArray(_origin,FList.Chat.channels.getData(_id).oplist)!== -1){
            _message=_message.substring(6);
            classList+=" chat-type-warn";
        }
    }
    _message=FList.Chat.processMessage(_type, _messagetype, _message);
    if(FList.Chat.Settings.current.highlightMentions && (_messagetype==="chat" || _messagetype!=="ad" || _messagetype!=="rp")){
        $.each(FList.Chat.Settings.current.highlightWords, function(i, word){
            var wordreg = new RegExp("\\b" + word + "('s)?\\b", "i");
            if(wordreg.test(_message) && _origin!==FList.Chat.identity && _type==="channel") highlight=true;
        });
        var identreg = new RegExp("\\b" + FList.Chat.identity + "('s)?\\b", "i");
        if(!highlight && identreg.test(_message) && _origin!==FList.Chat.identity && _type==="channel") highlight=true;
    }
    if(highlight) classList+=" chat-type-mention";
    var html="";
    var avatarclasses=FList.Chat.getPrintClasses(_origin, _type==="channel" ? _id : false);
    if(_messagetype!=="chat" && _messagetype!=="ad" && _messagetype!=="rp") avatarclasses="";
    if(_messagetype==="rp") html="<div class='" + classList + "'><span class='timestamp'>[" + time + "]</span> <i><span class='" + avatarclasses + "'><span class='rank'></span>" + _origin + "</span>" + _message + "</i></div>";
    if(_messagetype==="chat" || _messagetype==="error" || _messagetype==="system" || _messagetype==="ad") html="<div class='" + classList + "'><span class='timestamp'>[" + time + "]</span> <span class='" + avatarclasses + "'><span class='rank'></span>" + _origin + "</span>: " + _message + "</div>";
    var tab=FList.Chat.TabBar.getTabFromId(_type,_id);
    var showmode=_type==="channel" ? FList.Chat.channels.getData(_id).userMode : "both";
    var display=((showmode==="ads" && (_messagetype==="chat" || _messagetype==="rp")) || (showmode==="chat" && _messagetype==="ad")) ? false : true;

    if(FList.Chat.TabBar.activeTab.type===_type && FList.Chat.TabBar.activeTab.id.toLowerCase()===_id.toLowerCase()){
        if(display){
            if(tab.logs.length===0) $("#chat-content-chatarea > div").html("");
            $("#chat-content-chatarea > div").append(html);
            if(scrollDown) FList.Chat.scrollDown();
            FList.Chat.truncateVisible();
        }
    }
    if(FList.Chat.TabBar.activeTab.type!==_type || FList.Chat.TabBar.activeTab.id.toLowerCase()!==_id.toLowerCase() || !FList.Chat.focused){
        if(_type==="channel"){
            if(display){
                tab.pending+=1;
                    if(highlight){
                        tab.mentions+=1;
                        if(FList.Chat.Settings.current.html5Audio) FList.Chat.Sound.playSound("attention");
                        if(FList.Chat.Settings.current.html5Notifications) FList.Chat.Notifications.message("A word/name was highlighted,  by " + _origin + " in " + _id, _message.substring(0,100), staticdomain + "images/avatar/" + _origin.toLowerCase() + ".png", function(){FList.Chat.TabBar.setActive(_type,_id);});
                    }

            }
        }
        if(_type==="user"){//pm ping
            if(_messagetype==="chat" || _messagetype==="rp"){
                tab.mentions+=1;
                if(FList.Chat.Settings.current.html5Audio) FList.Chat.Sound.playSound("attention");
                if(FList.Chat.Settings.current.html5Notifications) FList.Chat.Notifications.message("You received a private message from " + _origin, _message.substring(0,100), staticdomain + "images/avatar/" + _origin.toLowerCase() + ".png", function(){FList.Chat.TabBar.setActive(_type,_id);});
            } else {
                tab.pending+=1;
            }
        }
    }
    if(_log){
        tab.logs.push({"type": _messagetype ,"by": _origin, "html": html});
        if(!FList.Chat.Settings.current.enableLogging){
            if(tab.logs.length>FList.Chat.Settings.current.visibleLines) tab.logs.shift();
        }
    }
    FList.Chat.Logs.Store(tab);

    if (_origin.toLowerCase() !== "system" &&
       (_type === "user" || highlight) &&
       (!focus || tabFocus !== _id.toLowerCase())) {
            FList.tNotice.newMsg(_id.toLowerCase());
    }

};

FList.Chat.TabBar.setActive = function (_type, _id) {

    if(this.activeTab!==false){
        FList.Chat.TypeState.check(true);
        if(this.activeTab.type==="channel" && _type!=="channel") FList.Chat.UserBar.hide();
        if(this.activeTab.type!=="channel" && _type==="channel" && !FList.Chat.Settings.current.disableUserList) FList.Chat.UserBar.show();
    }

    var tab=this.getTabFromId(_type, _id);
    tab.pending=0;
    tab.mentions=0;
    FList.Chat.Activites.noIndicate(tab.tab);
    $(".tab-item").removeClass("list-item-important");
    tab.tab.addClass("list-item-important");

    if(this.activeTab!==false){
        this.activeTab.textfield=$("#message-field").val();
        $("#message-field").val(tab.textfield);
    }

    this.activeTab=tab;

    if(tab.type==="channel"){
        $("#message-field").attr("maxlength",parseInt(FList.Chat.serverVars["chat_max"]));
        $("#typing-send-actions").html("<input type='button' class='send-input-choice send-input-chat' value='Send Chat'><input type='button' class='send-input-choice send-input-ad' value='Send Ad'>");
        if(FList.Chat.channels.getData(_id).mode==="ads") $(".send-input-chat").attr("disabled", true);
        if(FList.Chat.channels.getData(_id).mode==="chat") $(".send-input-ad").attr("disabled", true);
    } else if(tab.type==="user"){
        $("#message-field").attr("maxlength",parseInt(FList.Chat.serverVars["priv_max"]));
        $("#typing-send-actions").html("<input type='button' class='send-input-single send-input-chat' value='Send Chat'>");
    } else {
        $("#message-field").attr("maxlength",1024);
        $("#typing-send-actions").html("<input type='button' class='send-input-single send-input-chat' value='Send Chat'>");
    }

    $("#typing-send-actions input").button();
    $(".send-input-chat").click(function(){ FList.Chat.Input.handle($("#message-field").val()); });
    $(".send-input-ad").click(function(){ FList.Chat.Roleplay.sendAd(FList.Chat.TabBar.activeTab.id, $("#message-field").val()); });
    this.printLogs(tab, _type ==="channel" ? FList.Chat.channels.getData(_id).userMode : "both");
    if(_type==="channel") FList.Chat.UserBar.renderTheWholeFuckingThing(FList.Chat.userListMode);
    FList.Chat.InfoBar.update();
    if(FList.Chat.Settings.current.keepTypingFocus) $("#message-field").focus();
    FList.Chat.TypingArea.indicate();
    FList.Chat.TypingArea.update();
    FList.Chat.Roleplay.update(_type==="channel" ? _id : "");

    if (_id.toLowerCase() in FList.tNotice.tabTally) {
        FList.tNotice.readMsg(_id.toLowerCase());
    }

};

FList.Chat.TabBar.closeTab = function(el){
    var tabdata=this.getTabFromElement(el);
    if(FList.Chat.TabBar.activeTab.type===tabdata.type && FList.Chat.TabBar.activeTab.id===tabdata.id) this.tabToTheLeft();
    if(tabdata.type==="channel") {
        var channeldata=FList.Chat.channels.getData(tabdata.id);
        if(channeldata.joined){
            FList.Connection.send("LCH " + JSON.stringify({ "channel": tabdata.id }));
        } else {
            this.removeTab(tabdata.type, tabdata.id);
        }
    }

    if(tabdata.type==="user") {
        this.removeTab(tabdata.type, tabdata.id);

    }

    if (tabdata.id.toLowerCase() in
       FList.tNotice.tabTally) {
        FList.tNotice.readMsg(tabdata.id.toLowerCase());
    }

};