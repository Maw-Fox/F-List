//CONVENTIONS:
//rule for naming. every method that requires a name as an input, should require an escaped version of the name,
//with the correct casing. if the casing comes from user input, using GetUserIndex to get the properly cased name,
// from the online userlist is the solution. Comparison functions like GetUserIndex itself are an exception;
//they may take whatever case as input and perform case conversions on the comparison.
//variables and arrays should all store names escaped and with the correct casing. if a name is displayed, an unescape() should occur.

WEB_SOCKET_SWF_LOCATION = "../WebSocket.swf";
WEB_SOCKET_DEBUG = false;
FList.Chat_ws=0;
FList.Chat_filtermode="showall";//showall|hidechats|hideads
FList.Chat_forceclose = false;
FList.Chat_reconnecting = false;
FList.Chat_isTabOpen=true;
FList.Chat_reconnectTabs = [];
FList.Chat_disableUserlist=false;
FList.Chat_notifications=false;
FList.Chat_backgroundTabs = false;
FList.Chat_identity=0;//correct case, escape()'d.
FList.Chat_identified=false;
FList.Chat_ignorelist=[];
FList.Chat_kinks=[];
FList.Chat_disableIcons=false;
FList.Chat_autoIdle=false;
FList.Chat_timers=[];
FList.Chat_host="ws://f-list.net:9722/";
FList.Chat_version="0.8.2";
FList.Chat_requestList=false;
FList.Chat_connectComplete = false;
FList.Chat_typingInterval = 3; // seconds
FList.Chat_truncateMaxChars = 1024;
FList.Chat_highlightColor = $('head link[href*="light.css"]').length == 1 ? "#9f9" : "#e62012";
//data for the search.
FList.Chat_positions = [ "Always Bottom","Usually Bottom","Usually Top","Always Top","Switch" ];
FList.Chat_genders = [ "Male", "Female", "Transgender", "Herm", "Shemale", "Male-Herm", "Cunt-boy", "None" ];
FList.Chat_furryprefs = [ "No humans, just furry characters", "Furs and / or humans", "No furry characters, just humans", "Humans ok, Furries Preferred", "Furries ok, Humans Preferred" ];
FList.Chat_roles = ["Always submissive","Usually submissive","Switch","Usually dominant","Always dominant"];
FList.Chat_rlanguages = [ "English", "German", "French", "Spanish", "Russian", "Italian" ];
FList.Chat_orientations = [ "Straight", "Gay", "Bisexual", "Asexual", "Unsure", "Bi - male preference", "Bi - female preference", "Pansexual", "Bi-curious"];
FList.Chat_languages = {"fr": {name: 'French/Francais', channel: 'French'}, "de": {name: 'German/Deutsch', channel: 'German'}, "es": {name: 'Spanish/Espanol', channel: 'Espanol'}};
FList.Chat_lastStatus = null;
FList.Chat_bingTabs = [];

FList.Chat_fixHelper = function(e, ui) {
    ui.children().each(function() {
        $(this).width($(this).width());
    });
    return ui;
};
function getdialogpos(el){//hacky get screen center.

var scrwidth=($(window).width()/2)-(el.width()/2);
    var dialogpos=[scrwidth,50];
    return dialogpos;
}



$(function(){

    $(window).focus(function(){
    FList.Chat_isTabOpen=true;
    });
    $(window).blur(function(){
    FList.Chat_isTabOpen=false;
    });

    $('#chatmenu').ptMenu();



    $('#mnuchatlogs').click(function() {
        FList.Chat_logs.openDialog();
        return false;
    });



    FList.Chat_settingsdialog = $('<div></div>');
    FList.Chat_settingsdialog.dialog({
        autoOpen: false, title: 'Chat Settings', width: '400', modal: true,
        buttons: {
                "Save Changes" : function(){FList.Chat_prefs.updatePrefs();FList.Chat_settingsdialog.dialog("close");},
                "Close": function(){
                FList.Chat_settingsdialog.dialog("close");
                }

        }
    });
    $('#mnusettings').click(function() {
        FList.Chat_settingsdialog.dialog("open");

        FList.Chat_settingsdialog.html(FList.Chat_prefs.getPrefPanel());
                $( ".chattabs" ).tabs();
                $("#ChatPrefFontSize").attr("disabled", "disabled");
                $( "#FontSizeSlider" ).slider({
                    range: "min",
                    value: $("#ChatPrefFontSize").val(),
                    min: 10,
                    max: 40,
                    slide: function( event, ui ) {
                        $("#ChatPrefFontSize").val(ui.value );
                    }
                });
        return false;
    });


    FList.Chat_chandialog = $('<div></div>');
    FList.Chat_chandialog.dialog({
        autoOpen: false, title: 'Channels', width: '400', modal: true
    });
    $('#mnuchannels').click(function() {
        FList.Chat_chandialog.dialog("open");

        FList.Chat_chandialog.html(FList.Chat_channels.getPanel());
        $( ".chattabs" ).tabs();
        FList.Chat_send("CHA");FList.Chat_send("ORS");
        return false;
    });




        $("#mnufriends").qtip({content: {text: "Loading...", title: {text: 'Friends in the Chat', button: true}}, style: {classes: 'ui-tooltip-shadow ui-tooltip-rounded dropdowntip', widget: true}, position: {
         my: 'top center', // ...at the center of the viewport
         at: 'bottom center'
      }, hide: {
            event: 'unfocus'
        },events: {
            show: function(event, api) {
                $("#mnufriends").qtip('option', 'content.text', FList.Chat_getFriendsMenu());
                //$("#FriendList .AvatarLink").each(function(){
                    //FList.Chat_contextMenu.bindTo(this);
                //});
            }
        },show: {
         event: 'click'
      }});


    FList.Chat_statusdialog = $('<div></div>');
    FList.Chat_statusdialog.dialog({
        autoOpen: false, title: 'Status', width: '400', modal: true,
        buttons: {"Update Status": function(){FList.Chat_idletimer.idle=false;FList.Chat_idletimer.reset();FList.Chat_status.update();FList.Chat_statusdialog.dialog("close");}, "Close": function(){FList.Chat_statusdialog.dialog("close");}}
    });
    $('#mnustatus').click(function() {
        FList.Chat_statusdialog.dialog("open");
        FList.Chat_statusdialog.html(FList.Chat_status.getPanel());
        FList.Chat_status.setValues();
        return false;
    });


    FList.Chat_alertdialog = $('<div></div>');
    FList.Chat_alertdialog.dialog({
        autoOpen: false, title: 'Alert Staff', width: '400', modal: true,
        buttons: {"Get Moderator": function(){FList.Chat_staffCall.panelSubmit();FList.Chat_alertdialog.dialog("close");}, "Close": function(){FList.Chat_alertdialog.dialog("close");}}
    });
    $('#mnualertstaff').click(function() {
        FList.Chat_alertdialog.dialog("open");
        FList.Chat_alertdialog.html(FList.Chat_staffCall.getPanel(currentreportuser));
        return false;
    });


    FList.Chat_searchdialog = $('<div></div>');
    FList.Chat_searchdialog.html(FList.Chat_search.getPanel())
    .dialog({
        autoOpen: false, title: 'Search', width: '350', modal: true,
        beforeClose: function(event, ui){$("#ChatKinksGender, #ChatKinks, #ChatKinksOrientation, #ChatKinksLanguage, #ChatKinksFurry, #ChatKinksPosition, #ChatKinksRole").multiChecklist("close");},
        buttons: {"Search": function(){FList.Chat_search.search();}, "Reset": function(){FList.Chat_search.clear();}}
    });
    $('#mnusearch').click(function() {
        FList.Chat_searchdialog.dialog("open");
        $("#ChatKinksGender, #ChatKinks, #ChatKinksOrientation, #ChatKinksLanguage, #ChatKinksFurry, #ChatKinksPosition, #ChatKinksRole").multiChecklist("close");
        if(FList.Chat_search.init==false){
            FList.Chat_search.init=true;
            FList.Chat_searchdialog.html(FList.Chat_search.getPanel());
            if(typeof($("#ChatKinks").data("multiChecklist")==="undefined"))
                $("#ChatKinks, #ChatKinksGender, #ChatKinksOrientation, #ChatKinksLanguage, #ChatKinksFurry, #ChatKinksPosition, #ChatKinksRole").multiChecklist();
        }
        return false;
    });

    FList.Chat_loggetdialog = $('<div></div>');
    FList.Chat_loggetdialog.dialog({
        autoOpen: false, title: 'Download Chatlogs', width: '400', modal: true,
        buttons: {"Close": function(){FList.Chat_loggetdialog.dialog("close");}}
    });
    $('#mnulogs').click(function() {
        FList.Chat_loggetdialog.dialog("open");
        FList.Chat_loggetdialog.html(FList.Chat_tabs.openLog());
        return false;
    });

    FList.Chat_legenddialog = $('<div></div>');
    FList.Chat_legenddialog.dialog({
        autoOpen: false, title: 'Colors and symbols', width: '400', modal: true
    });
    $('#mnulegend').click(function() {
        FList.Chat_legenddialog.dialog("open");
        FList.Chat_legenddialog.html( "<h3>Symbols</h3><img src='" + staticdomain + "images/ranks/chatop.png'> = chatop<br/><img src='" + staticdomain + "images/ranks/chanop.png'> = chanop<br/><img src='" + staticdomain + "images/ranks/chanown.png'> = channel owner<br/> <h3>Gender colors</h3><span class='AvatarLink GenderNone'>No Gender</span><br/><span class='AvatarLink GenderMale'>Male</span><br/><span class='AvatarLink GenderFemale'>Female</span><br/><span class='AvatarLink GenderHerm'>Herm</span><br/><span class='AvatarLink GenderTransgender'>Transgender</span><br/><span class='AvatarLink GenderShemale'>Shemale</span><br/><span class='AvatarLink GenderMale-Herm'>Male-Herm</span><br/><span class='AvatarLink GenderCunt-boy'>Cunt-boy</span><br/><span class='FriendLink'>FriendLink</span>");
        return false;
    });

    FList.Chat_cmdhelpdialog = $('<div></div>');
    FList.Chat_cmdhelpdialog.dialog({
        autoOpen: false, title: 'F-Chat command reference', width: '400', modal: true
    });
    $('#mnucommands').click(function() {
        FList.Chat_cmdhelpdialog.dialog("open");
        FList.Chat_cmdhelpdialog.html(FList.Chat_help.getPanel());
        $( ".chattabs" ).tabs();
        return false;
    });

    FList.Chat_notification.init();//check support

});

FList.Chat_help = {

    panelIsOpen: false,

    showTooltip: function(){
        var tipcontent=FList.Chat_help.getCommands();
        if( $("#MessageBox").data("qtip")) $("#MessageBox").qtip("destroy");
        if(tipcontent=="") return;
        $("#MessageBox").qtip({
           content: tipcontent,
           position: {my: 'bottom left',at: 'top left', adjust: {
         x: 10
      }, colission: "flip flip"},
           show: {ready: true, event: 'focus'},
           events: {show: function(event, api){FList.Chat_help.panelIsOpen=true;}, hide: function(event, api){FList.Chat_help.panelIsOpen=false;$("#MessageBox").qtip("destroy");}},
           hide: {event: 'unfocus', fixed:true},
           style: {classes: 'ui-tooltip-shadow ui-tooltip-blue ui-tooltip-rounded'}
        });
    },

    autocomplete: function(word){
        var text=$("#MessageBox").val();
        var endpos=$("#MessageBox").caret().start;
        var startpos=0;
        for(var i=endpos;i>=0;i--){
            var character=text.substr(i,1);
            startpos=i;
            if(character=="/"){
                break;
            }
        }
        text=$("#MessageBox").val().substr(0,startpos) + "/" + word.toLowerCase();
        var pos=startpos+word.length+1;
        $("#MessageBox").val(text).caret(pos,pos);
        FList.Chat_help.closeTooltip();
    },

    getCommands: function(){
        var panelstring="";
        var text=$("#MessageBox").val();
    var endpos=$("#MessageBox").caret().start;
    var startpos=0;
    for(var i=endpos;i>=0;i--){
        var character=text.substr(i,1);
        startpos=i;
        if(character=="/"){
            break;
        }
    }
    var completetext=text.substring(startpos, endpos).toLowerCase();
    if(completetext.length>0){
        if(completetext.substring(0,1)=="/" || completetext.substring(0,1)=="\"") completetext=completetext.substring(1).toLowerCase();
    } else {
        if(FList.Chat_help.panelIsOpen) return "";
    }
        for(var key in helpdata){
            if(jQuery.inArray("all",helpdata[key].rights)>-1 || (jQuery.inArray("admin",helpdata[key].rights)>-1 && FList.Rights.has("admin")) || (jQuery.inArray("debug",helpdata[key].rights)>-1 && WEB_SOCKET_DEBUG) ||  (jQuery.inArray("chatop",helpdata[key].rights)>-1 && FList.Chat_ischanop()) ||  (jQuery.inArray("chanop",helpdata[key].rights)>-1 && FList.Chat_ischanop()) ||  (jQuery.inArray("owner",helpdata[key].rights)>-1 && FList.Chat_ischanowner())){

                var syntaxhelp="";
                for(var i in helpdata[key].syntax){
                    syntaxhelp+=" &lt;<i>" + helpdata[key].syntax[i] + "</i>&gt; ";
                }
                if(syntaxhelp!=="") syntaxhelp=" (<i>" + syntaxhelp + "</i>)";
                var cmdinfo="<div class='synhelp' onclick='FList.Chat_help.autocomplete(\"" + key + "\");'>" + "/" + key + syntaxhelp + "</div>";
                if(completetext.length>0){
                    if(key.toLowerCase().substr(0,completetext.length)==completetext) panelstring+=cmdinfo;
                } else {
                    panelstring+=cmdinfo;
                }
            }
        }
        return panelstring;
    },

    closeTooltip: function(){
        FList.Chat_help.panelIsOpen=false;
        $("#MessageBox").qtip("destroy");
    },

    updateTooltip: function(){
        var tipcontent=FList.Chat_help.getCommands();
        if(tipcontent=="") {
            FList.Chat_help.closeTooltip();
            return;
        }
        $("#MessageBox").qtip('api').set('content.text', tipcontent);

    },

    getPanel: function(){
        var panel='<div class="chattabs">';
        panel += '<ul>';
        panel += '<li><a href="#tabs-1">General</a></li>';
        panel += '<li><a href="#tabs-2">BBCode</a></li>';
        panel += '<li><a href="#tabs-3">Moderation</a></li>';
        panel += '<li><a href="#tabs-4">Emoticons</a></li>';
        panel += '</ul>';
        panel += '<div id="tabs-1" class="StyledForm">';
        panel += '/me &lt;message&gt;<br/>';
        panel += '/clear<br/>';
        panel += '/channels<br/>';
        panel += '/join &lt;channel&gt;<br/>';
        panel += '/users<br/>';
        panel += '/close<br/>';
        panel += '/who<br/>';
        panel += '/priv &lt;character&gt;<br/>';
        panel += '/ignore &lt;character&gt;<br/>';
        panel += '/unignore &lt;character&gt;<br/>';
        panel += '/ignorelist<br/>';
        panel += '/code<br/>';
        panel += '/logout<br/>';
        panel += '/profile &lt;character&gt;<br/>';
        panel += '/soundon<br/>';
        panel += '/soundoff<br/>';
        panel += '/roll <1d10><br/>';
        panel += '/kinks &lt;character&gt;<br/>';
        panel += '/status &lt;Online|Looking|Busy|DND&gt; &lt;optional message&gt;<br/>';
        panel += '<h3>Channel owners</h3>';
        panel += '/makeroom &lt;name&gt;<br/>';
        panel += '/invite &lt;person&gt;<br/>';
        panel += '/openroom<br/>';
        panel += '/closeroom<br/>';
        panel += '/setdescription';
        panel += '/getdescription';
        panel += '/setmode';
        panel += '</div>';
        panel += '<div id="tabs-2" class="StyledForm">';
        panel += '[b]bold[/b]<br/>';
        panel += '[i]italic[/i]<br/>';
        panel += '[u]underline[/u]<br/>';
        panel += '[s]strike[/s]<br/>';
        panel += '[color=color]red|[/color]<br/>';
        panel += '[user]name[/user]<br/>';
        panel += '[icon]name[/icon]<br/>';
        panel += '[channel]name[/channel]<br/>';
        panel += '[collapse=title]text[/collapse]<br/>';
        panel += '[url=address]title[/url]';
        panel += '</div>';
        panel += '<div id="tabs-3" class="StyledForm">';
        panel += '<h3>Admin commands</h3>';
        panel += '/broadcast &lt;message&gt;<br/>';
        panel += '/op<br/>';
        panel += '/deop<br/>';
        panel += '<h3>Chatop commands</h3>';
        panel += '/gkick<br/>';
        panel += '/timeout<br/>';
        panel += '/ipban<br/>';
        panel += '/accountban<br/>';
        panel += '/gunban<br/>';
        panel += '/createchannel<br/>';
        panel += '/killchannel<br/>';
        panel += '<h3>Chan-Op commands</h3>';
        panel += '/warn<br/>';
        panel += '/kick<br/>';
        panel += '/ban<br/>';
        panel += '/unban<br/>';
        panel += '/banlist<br/>';
        panel += '/coplist<br/>';
        panel += '<h3>Chan Owner commands</h3>';
        panel += '/cop<br/>';
        panel += '/cdeop<br/>';
        panel += '</div>';
        panel += '<div id="tabs-4" class="StyledForm">';
        panel += '<h3>Emotes</h3>';
        var __emotes = ['heart', 'hex-yell', 'hex-sad', 'hex-grin', 'hex-red', 'hex-razz', 'hex-twist', 'hex-roll', 'hex-mad', 'hex-confuse', 'hex-eek',
            'hex-wink', 'lif-angry', 'lif-blush', 'lif-cry', 'lif-evil', 'lif-gasp', 'lif-happy', 'lif-meh', 'lif-neutral', 'lif-ooh', 'lif-purr',
            'lif-roll', 'lif-sad', 'lif-sick', 'lif-smile', 'lif-whee', 'lif-wink', 'lif-wtf', 'lif-yawn', 'cake'];
        for(var __i = 0; __i < __emotes.length; __i++)
        {
            var imote = __emotes[__i];
            panel += ':' + imote + ':<img src="' + staticdomain + 'images/smileys/' + imote + '.png" alt="' + imote + ' emote" title=":' + imote + ':" align="middle">';
        }
        panel += '</span>';
        panel += '</div>';
        panel += '</div>';
        return panel;
    }

};


FList.Chat_notification = {
    support: false,
    enabled: false,
    message: "",
    title: "",
    tab: 0,
    hideTimer: 0,
    queue: 0,
    user: "",
    init : function(){
        FList.Chat_notification.enabled=false;
        if(window.webkitNotifications){
            FList.Chat_notification.support=true;
                if(window.webkitNotifications.checkPermission() > 0){
                    FList.Chat_notifications=false;
                } else {
                    FList.Chat_notification.enabled=true;
                }
        }else{
            FList.Chat_notification.support=false;
        }
        FList.Chat_notification.queue=new Array();
    },

    create : function(message, title, user, tab){
        // titleAlert behaves oddly if multiple alerts conflict or the mouse is moved
        // $.titleAlert(title, {duration:10000, interval:1000, stopOnFocus:true, requireBlur:true, stopOnMouseMove:true});
        if(!FList.Chat_notifications) {
            //console.log("disabled, cancelled.");
            return;
        }
        if(!FList.Chat_notification.support){
            //console.log("unsupported, cancelled.");
            return;
        }
        FList.Chat_notification.message = message;
        FList.Chat_notification.title = title;
        FList.Chat_notification.user = user;
        FList.Chat_notification.tab = tab;
        FList.Chat_notification.show();
    },

    getPermission: function(){
        window.webkitNotifications.requestPermission();
    },

    hide: function(){
        var popup = FList.Chat_notification.queue.shift();
        popup.cancel();
        clearTimeout(FList.Chat_notification.hideTimer);
        if(FList.Chat_notification.queue.length>0){
            FList.Chat_notification.hideTimer=setTimeout(function(){
            FList.Chat_notification.hide();
            }, '10000');
        }
    },

    show: function(){
        if(!FList.Chat_notifications) {
            //console.log("disabled, cancelled.");
            return;
        }
        if(!FList.Chat_notification.support){
            //console.log("unsupported, cancelled.");
            return;
        }
        if(window.webkitNotifications.checkPermission() > 0){
            //FList.Chat_notification.getPermission(FList.Chat_notification.show);
            FList.Common_displayError("HTML5 desktop notifications are on, but you haven't granted permission to display them. Turn them off, or get permission, in settings.");
        } else {
            var instance=window.webkitNotifications.createNotification(staticdomain + "images/avatar/" + FList.Chat_notification.user.toLowerCase() + ".png",FList.Chat_notification.title, FList.Chat_notification.message.substr(0,100));
            var tab=FList.Chat_notification.tab;
            instance.onclick = function() {
                if(tab!==0) FList.Chat_tabs.switchTab(tab);
                window.focus();
                this.cancel();
            };

            instance.show();

            FList.Chat_notification.queue.push(instance);
            clearTimeout(FList.Chat_notification.hideTimer);
            if(FList.Chat_notification.queue.length>5){
                var popup = FList.Chat_notification.queue.shift();
                popup.cancel();
            }
            FList.Chat_notification.hideTimer=setTimeout(function(){
            FList.Chat_notification.hide();
            }, '10000');
        }
    }

};



//audio
FList.Chat_sounds=[];var audiosupport="none";
//flood control and message limit
var last_msg=0;var last_lfrp=0;FList.Chat_msgMaxLength=2048;FList.Chat_priMaxLength=4096;
var staffcalldialog=0;
var currentreportuser='None';
var logdownloaddialog=0;

            FList.Chat_getFriendsMenu = function(){
            var friends="";
            var userlist=FList.Chat_users.tracklist;
            for(var i in userlist){
                var classes=" ";
                if(jQuery.inArray(userlist[i],FList.Chat_users.list)!=-1){
                    var classes="AvatarLink";
                    if(jQuery.inArray(userlist[i],FList.Chat_users.ops)!=-1) {
                        classes+=" OpLink";
                    }
                    if(userlist[i] in FList.Chat_users.userdata) {
                        classes += " Gender" + FList.Chat_users.userdata[userlist[i]].gender;
                        classes += " Status" + FList.Chat_users.userdata[userlist[i]].status;
                    }
                    var user="<a class='" + classes + "'>"+userlist[i]+"</a><br/>";
                    friends = friends + user;
                }
            }
            return "<div id='FriendList'>" + friends + "</div>";
        };

$(document.body).mousedown(function(e){
    if($(e.target).hasClass("AvatarLink")){
        e.stopPropagation();
        var name=$(e.target).text();

        if(e.which==1){
            // Left click.
            if (FList.Chat_swapMouse == false) {
                window.open(domain + 'c/' + name, '_blank');
            } else {
                FList.Chat_openPrivateChat(name, false);
            }
        } else if(e.which==2) {
            // Middle click.
            window.open(domain + 'c/' + name, '_blank');
        } else if(e.which==3) {
            // Right click.
            $(e.target).contextMenu({inSpeed : 150, outSpeed: 75, menu: "CharacterMenu", beforeOpen: function(){
                var currentUser=name;
                $("#CharacterMenu .header").html("<h3 id='ContextMenuHeader'>" + currentUser + "</h3>");
                var sm = FList.Chat_users.getData(currentUser).statusmsg;
                if (typeof(sm) == "string" && sm != "") {
                    $("#CharacterMenu .ministatus img").attr("src", staticdomain + "images/avatar/" + currentUser.toLowerCase() + ".png");
                    $("#CharacterMenu .ministatus span").html(FList.ChatParser.parseContent(sm));
                    $("#CharacterMenu .ministatus").css("display", "block");
                } else {
                    $("#CharacterMenu .ministatus").css("display", "none");
                }
                if(!FList.Rights.has("chat-chatop") || jQuery.inArray(currentUser,FList.Chat_users.ops)!=-1){
                    $('#CharacterMenu .banip, #CharacterMenu .banaccount, #CharacterMenu .kick, #CharacterMenu .timeout, #CharacterMenu .altwatch').css("display","none");
                } else {
                    $('#CharacterMenu .banip, #CharacterMenu .banaccount, #CharacterMenu .kick, #CharacterMenu .timeout, #CharacterMenu .altwatch').css("display","inline");
                }
                if(!FList.Chat_ischanop() == true || jQuery.inArray(currentUser,FList.Chat_users.ops)!=-1){
                    $('#CharacterMenu .ckick, #CharacterMenu .cban').css("display","none");
                } else {
                    $('#CharacterMenu .ckick, #CharacterMenu .cban').css("display","inline");
                }
                if(!FList.Chat_ischanowner() == true || jQuery.inArray(currentUser, FList.Chat_users.ops)!=-1){
                    $('#CharacterMenu .cop, #CharacterMenu .cdeop').css("display","none");
                } else {
                    if(FList.Chat_ischanop(currentUser)!=1){
                        $("#CharacterMenu .cop").css("display","inline");
                        $("#CharacterMenu .cdeop").css("display","none");
                    } else {
                        $("#CharacterMenu .cop").css("display","none");
                        $("#CharacterMenu .cdeop").css("display","inline");
                    }
                }
                if (FList.Chat_swapMouse == false) {
                    $("#CharacterMenu .priv").css("display","inline");
                    $("#CharacterMenu .flist").css("display","none");
                } else {
                    $("#CharacterMenu .priv").css("display","none");
                    $("#CharacterMenu .flist").css("display","inline");
                }
                //if(jQuery.inArray(currentUser,FList.Chat_ignorelist)==-1){
                $("#CharacterMenu .ignore").css("display","inline");
                //  $("#CharacterMenu .unignore").css("display","none");
                //} else {
                //  $("#CharacterMenu .ignore").css("display","none");
                $("#CharacterMenu .unignore").css("display","inline");
                //}
            },callback: function(action, el, pos) {
                var currentUser=$(el).text();
                switch(action){
                    case 'priv':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_openPrivateChat(currentUser, true);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'flist':
                        //if(FList.Chat_users.getIndex(currentUser)!==-1){
                        window.open(domain + 'c/' + currentUser, '_blank');
                        //} else {
                        //  FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        //}
                        break;
                    case 'logs':
                        FList.Chat_logs.getUser(currentUser);
                        break;
                    case 'addop':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_send("AOP " + JSON.stringify({character: currentUser}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'deop':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_send("DOP " + JSON.stringify({character: currentUser}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'profile':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_RequestProfile(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'kinks':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_RequestKinks(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'report':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_staffCall.showPanel(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'ignore':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_users.addIgnore(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'track':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_users.requestTrack(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'untrack':
                        if(FList.Chat_users.getIndex(currentUser)!==-1){
                            FList.Chat_users.requestTrack(currentUser);
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'banip':
                        if(FList.Chat_users.getIndex(currentUser)!=-1){
                            if(confirm("IP ban " + currentUser + "?")) {
                                FList.Chat_send("IPB " + JSON.stringify({character: currentUser}));
                            }
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'banaccount':
                        var person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            if(confirm("Account ban " + currentUser + "?")) {
                                FList.Chat_send("ACB " + JSON.stringify({character: currentUser}));
                            }
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'unignore':
                        FList.Chat_users.delIgnore(currentUser);
                        break;
                    case 'ckick':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                            FList.Chat_send("CKU " + JSON.stringify({channel: channel, character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'cban':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                            FList.Chat_send("CBU " + JSON.stringify({channel: channel, character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'cop':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                            FList.Chat_send("COA " + JSON.stringify({channel: channel, character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'cdeop':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                            FList.Chat_send("COR " + JSON.stringify({channel: channel, character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'altwatch':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            FList.Chat_send("AWC " + JSON.stringify({character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'kick':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            FList.Chat_send("KIK " + JSON.stringify({character: person}));
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                    case 'timeout':
                        person=FList.Chat_users.getInstance(currentUser);
                        if(person!=-1){
                            var reason = prompt("Timeout " + currentUser + " for 30 minutes. Reason:");
                            if(reason != null && reason != "") {
                                FList.Chat_send("TMO " + JSON.stringify({time: 30, character: person, reason: reason}));
                            }
                        } else {
                            FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                        }
                        break;
                }}});
        }
    }
});

FList.DebugOp = function ()
{
    FList.Chat_users.addOpp(FList.Chat_identity);
    FList.FChat_printMessage("Debugging Admin Enabled.", "ChatTypeSystem","",'all');
};

FList.ForceOp = function ()
{
    FList.Chat_send("AOP " + JSON.stringify({character: FList.Chat_identity}));
    FList.FChat_printMessage("Granting Chat Operator.", "ChatTypeSystem","",'all');
};

FList.DebugOpOff = function ()
{
    FList.Chat_users.removeOp(FList.Chat_identity);
    FList.FChat_printMessage("Debugging Admin Disabled.", "ChatTypeSystem","",'all');
};

//Tab class, holding all the data of a tab
/**
 * @constructor
 */
FList.Chat_Tab = function (type,id,icon)
{
    this.id=id;
    this.type=type;
    this.icon=icon;
    this.logs=[];
    this.activity=false;
    this.closed=false;
    this.textfield="";
    this.metyping = false;
    this.status = "clear";
    this.laststatus = "clear";
    this.tabid=0;
};

//FList.Chat_tabs : The tab-bar on the left of the chatbox
FList.Chat_tabs = new function ChatTabs() {

    //list of Tab objects
    this.list = null;
    this.element = null;
    this.currentIndex = null;
    this.currentType = "";

    this.toggleBingCurrent = function() {
        var tab = this.list[this.currentIndex];
        var apos = $.inArray(tab.id, FList.Chat_bingTabs);
        if (apos > -1) {
            FList.Chat_bingTabs.splice(apos, 1);
            $("#bingtoggle").val("No Bing");
        } else {
            FList.Chat_bingTabs.push(tab.id);
            $("#bingtoggle").val("Bing!");
        }
    };

    this.addTab = function(type,id,icon){
        var tab = new FList.Chat_Tab(type,id,icon);
        if (type == "channel") {
            if (id.substr(0,3) == "ADH") tab.title = FList.Chat_channels.getInstance(id).title; //This doesn't get the right title fast enough...
        }
        this.list.push(tab);
        this.update();
    };

    //hide open tab.
    this.closeTab = function(index) {
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

    //completely render the tab bar from scratch.
    this.show = function()
    {
        this.update();
        this.element.fadeIn("fast");
        this.switchTab(this.currentIndex);
    };

    //clear and hide the tab bar.
    this.hide = function()
    {
        if (this.element == null) return;
        this.element.fadeOut("fast");
    };

    //initialize tab bar for the first time, on pageload.
    this.init = function()
    {
        this.list=[];
        this.currentIndex=0;
        this.addTab("console","Console","console.png");
        if(!$("#TabBox").length>0){$("<div/>").attr("id","TabBox").insertBefore("#ChatBox");}
        this.element=$("#TabBox");
        FList.Chat_tabscroll.init();
    };

    this.getToolTips = function(tab){
        var tabtext="";var tdescription="";
        if(tab.type=="console"){
            tabtext = "The console";
            tdescription = "Beware the mighty console.";
        }
        if(tab.type=="channel"){
            var title = "#" + tab.id;
            if (typeof(tab.title) == "string")
                title = tab.title;
            tabtext = "A channel";
            tdescription = title;
        }
        if(tab.type=="person"){
            tabtext = "A user";
            tdescription = "Private chat with " + tab.id;
        }
        return {tooltip: tabtext, description: tdescription};
    };

    //add new tabs, hide closed ones.
    this.update = function()
    {
        if (this.element == null) return;
        for(var i in this.list){
            var tab=this.list[i];
            if(tab.closed==false){
                if(document.getElementById("ChatTab" + i)!=null){
                    // Chat tab is opening
                    $("#ChatTab" + i).fadeIn("fast");
                } else {
                    tab.tabid = parseInt(i);
                    var newtab=document.createElement("span");
                    newtab.className="ChatTab";
                    if(tab.id!=="Console") newtab.className+=" SortTab";
                    newtab.id="ChatTab" + i;
                    var closelink=document.createElement("a");
                    closelink.className="ChatTabClose";
                    var imagelink= staticdomain + "images/icons/" + tab.icon;
                    var linkel=document.createElement("a");
                    var imageel=document.createElement("img");
                    if(tab.type=="person"){
                        newtab.className+=" ChatPersonTab";
                        newtab.appendChild(closelink);
                        imagelink= staticdomain + "images/avatar/" + tab.id.toLowerCase() + ".png";
                    } else if(tab.type=="channel"){
                        newtab.appendChild(closelink);
                    } else {
                        var savelink=document.createElement("a");
                        savelink.id="ChatTabSave";
                        newtab.appendChild(savelink);
                    }
                    imageel.className="ico";
                    imageel.src=imagelink;
                    if(FList.Common_highContrast()){
                        $(linkel).append("<span class='hcindicator'></span>" + tab.id);
                    } else {
                        linkel.appendChild(imageel);
                    }
                    if(tab.type=="person"){
                        var indiimg=document.createElement("img");
                        indiimg.src=staticdomain + "images/typing.gif";
                        indiimg.className="TypingIndicator";
                        newtab.appendChild(indiimg);
                    }
                    newtab.appendChild(linkel);

                    document.getElementById("TabBox").appendChild(newtab);
                    $("#ChatTab" + i + " .ChatTabClose").unbind("mousedown").mousedown(function(e){
                        FList.Chat_tabs.closeTab(qtab.attr("id").substring(7));
                        if(tab.type=="channel"){
                            FList.Chat_send("LCH " + JSON.stringify({channel: FList.Chat_tabs.list[qtab.attr("id").substring(7)].id}));
                        }
                        e.preventDefault();
                        return false;
                    });
                    $("#ChatTabSave").unbind("mousedown").mousedown(function(e){
                        var po=FList.Chat_prefs.currentPrefs;
                        var ochannels = FList.Chat_channels.getCurrentChannels();
                        var fchannels = [];
                        for (var i = 0; i < ochannels.length; i++) {
                            if(ochannels[i].toLowerCase()!=="adh-staffroomforstaffppl" && ochannels[i].toLowerCase()!=="adh-chanoproomforchanops" && ochannels[i].toLowerCase()!=="adh-uberawesomestaffroom")
                                fchannels.push(ochannels[i]);
                        }
                        po.defaultChannels = fchannels;
                        FList.Chat_prefs.applyPrefs(po);
                        FList.Chat_prefs.storePrefs();
                        FList.Common_displayNotice("Your (channel) tabs were saved.");
                        e.preventDefault();
                        return false;
                    });

                    var qtab = $("#ChatTab" + i);
                    qtab.unbind("mousedown").bind("mousedown",function(){FList.Chat_tabs.switchTab(parseInt(this.id.substring(7)));});
                    var tabtip=FList.Chat_tabs.getToolTips(tab)["tooltip"];
                    var tabtext=FList.Chat_tabs.getToolTips(tab)["description"];
                    if(!FList.Common_highContrast())
                        qtab.qtip({style: {classes: 'ui-tooltip-shadow', widget: true}, show: {effect: false},hide: {effect: false}, position: {my: 'left center',  at: 'right center'}, content: {text: tabtext}});
                }
            } else {
                // Chat tab is closing
                if($("#ChatTab" + i).length>0) {
                $("#ChatTab" + i).fadeOut("slow", function(){$(this).remove();});
                }
            }
        }
        $(".ActiveChatTab").removeClass("ActiveChatTab");
        $("#ChatTab" + this.currentIndex).addClass("ActiveChatTab");
        if($("#TabBox").sortable) { $("#TabBox").sortable( "destroy" ); }
        $("#TabBox").sortable({
            start: function(){$("#ChatTabClose").remove();},
            placeholder: 'TempSortTab',
            items: '.SortTab',
            helper: FList.Chat_fixhelper,
            distance: '5',
            revert: 200,
            axis: 'y'
        });
    };

    //makes the tab with the given index the active tab, if possible
    this.switchTab = function(index){
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

    //Make a tab blink; only to be used as activity indicator.
    this.flashTab = function(index){
        if(!$("#ChatTab" + index).hasClass("ChatActivity") && (index!=this.currentIndex || FList.Chat_alwaysSound)){
            FList.Chat_playSound("attention");
            this.list[index].activity=true;
           $("#ChatTab" + index).stop().clearQueue().attr('style', '');
            $("#ChatTab" + index).removeClass("ChatActivity");
                if(index!=FList.Chat_tabs.currentIndex && FList.Chat_tabs.list[index].activity==true) {
                    $("#ChatTab" + index).addClass("ChatActivity");
                    if(FList.Common_highContrast()){
                         $("#ChatTab" + index + " .hcindicator").html("♦");
                    }
                    $("#ChatTab" + index).stop().clearQueue().attr('style', '');
                }
        }
    };

    //finds the first open tab in a given direction.
    //valid directions are "up" and "down"
    this.findOpen = function(dir){
        if(dir=="up"){
            for(var i = this.currentIndex-1;i>0;i--){
                if(this.list[i].closed==false) return i;
            }
            return 0;//console
        } else {//down
            for(var i = this.currentIndex+1;i<this.list.length;i++){
                if(this.list[i].closed==false) return i;
            }
            return 0;//console
        }
    };

    //Get the index of a tab based on a channel name.
    this.channelGetIndex = function(channel){
        channel=channel.toLowerCase();
        for(var i in this.list){
            if(this.list[i].type=="channel"){
                if(this.list[i].id.toLowerCase()==channel) return i;
            }
        }
        return -1;
    };



    //Get the index of a tab based on a character name.
    this.userGetIndex = function(user){
        user=user.toLowerCase();
        for(var i in this.list){
            if(this.list[i].type=="person"){
                if(this.list[i].id.toLowerCase()==user) return i;
            }
        }
        return -1;
    };

    //Jump up or down one tab, if possible.
    this.jump = function(dir)
    {
        var selectTab = this.findOpen(dir);
        if (dir == "down" && selectTab == 0) return;
        if (selectTab >= 0) this.switchTab(selectTab);
    };

    // Create a download log link for the currently open tab.
    // A bit spammy, because we generate dependency-free html all in javascript.
    this.openLog = function(tabidx, raw) {
        if (FList.Chat_truncateLogs == true) return "You have disabled chat logs in your settings.";
        if (typeof(tabidx) == "undefined") var tabidx = FList.Chat_tabs.currentIndex;
        var tabname = FList.Chat_tabs.list[tabidx].id.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(FList.Chat_tabs.list[tabidx].id).title : FList.Chat_tabs.list[tabidx].id;
        var header = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n'
            + '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n'
            + '<head><title>F-list - Chat</title>\n'
            + '<style>\n'
            + 'h1{color:white;margin-bottom:10px;font-size:14pt;}\n'
            + 'body{background-color:#1F5284;font-family:verdana,helvetica;font-size:10pt;}\n'
            + 'span.ChatMessage{display:block;border-bottom:1px solid #666666;color: #eeeeee;padding:5px;margin-bottom:3px;}\n'
            + 'span.ChatMessage a {color:#00bbff;}'
            + 'span.ChatMessage a.AvatarLink{font-weight:bold;color:white;}\n'
            + 'span.ChatMessage span.ChatTimestamp{color:#bbbbbb;padding:5px 0px;font-size:6pt;margin-right:5px;}\n'
            + '</style>\n'
            + '</head>\n'
            + '<body>\n'
            + '<h1>F-Chat Log: ' + tabname + ', ' + new Date() + '</h1>\n'
            + '<div id="LogContainer">\n';
        var footer = '</div></body></html>';
        var logs = FList.Chat_tabs.list[tabidx].logs;
        var loglength = logs.length;
        var space = $("<div></div>");
        var doc = "";
        for (var l = 0; l < loglength; l++) {
            space.empty();
            space.append(logs[l].clone());
            doc = space.html() + doc;
        }
        doc = header + doc;
        doc += footer;
        if (raw == true) return doc;
        return 'Right click and save to your computer.<br/><a href="data:text/html;filename='+escape(FList.Chat_tabs.list[tabidx].id)+'.html;charset=utf-8,' + escape(doc) + '" target="_blank">Download Log</a>';
    };

    this.getZippedLogs = function() {
        var zip = new JSZip();
        for (var i = 1; i < FList.Chat_tabs.list.length; i++) {
            var tab = FList.Chat_tabs.list[i];
            var tabname = tab.id.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(tab.id).title : tab.id;
            if (tabname == undefined) tabname = "Private Room (closed)";
            var valid_filename = tabname.replace(/[^a-zA-Z \-_0-9]+/g,'');
            zip.add(valid_filename+".htm", FList.Chat_tabs.openLog(i,true));
        }
        var content = zip.generate();
        return '(right click/save):</br><a href="data:application/zip;filename=logs.zip;base64,'+content+'">Download zipped chatlogs</a>';
    };

};

/**
 * @constructor
 */
FList.Chat_Channel = function(name, description){
    this.name=name;//correct case, escape()'d
    this.title = "Private Room"; // title for adhoc channels
    this.oplist=[];//correct case, escape'd
    this.chanops=[];
    this.userlist=[];//correct case, escape'd
    this.description=description;
    this.mode="both";
};


FList.Chat_channels = new function ChatChannels() {

    this.list = null;

    this.create = function(channel){
        if(this.getIndex(channel)==-1) this.list.push(new FList.Chat_Channel(channel, ""));
    };

    this.updateDescription = function(channel, description){
        var channel=this.getInstance(channel);
        if(channel!=-1){
            channel.description=description;

            if (channel.name.substr(0,3) == "ADH" && !FList.Chat_reconnecting)
                FList.FChat_printMessage("[<b>Channel Description</b>] " + FList.ChatParser.parseContent(description), "ChatTypeNotice","",FList.Chat_tabs.channelGetIndex(channel.name));

            if (FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id == channel.name)
                FList.Chat_DisplayInfoBar(channel.name);
        }
    };

    this.join = function(channel, title){
        this.create(channel);
        this.getInstance(channel).title=title;
        var tab = FList.Chat_tabs.channelGetIndex(channel);
        if (tab == -1) {
            if (channel.substr(0,3) == "ADH") var icon = "private.png";
            else var icon = "channel.png";
            FList.Chat_tabs.addTab("channel", channel, icon);
            tab = FList.Chat_tabs.channelGetIndex(channel);
        } else if(FList.Chat_tabs.list[tab].closed != false) {
            FList.Chat_tabs.list[tab].closed = false;
            FList.Chat_tabs.update();
        }
        if(FList.Chat_channels.getIndex(channel)!==-1) FList.Chat_channels.addUser(channel, FList.Chat_identity, false);
        if (!FList.Chat_reconnecting && !FList.Chat_backgroundTabs) FList.Chat_tabs.switchTab(tab);
    };

    this.leave = function(channel){
        var index=this.getIndex(channel);
        if(index != -1) this.list.splice(index,1);
        var tabindex=FList.Chat_tabs.channelGetIndex(channel);
        if(index != -1) FList.Chat_tabs.closeTab(tabindex);
    };

    //initialize tab bar for the first time, on pageload.
    this.init = function()
    {
        this.list=[];
    };

    this.requestJoin = function(channel, dounescape){
        if (dounescape == true) channel = unescape(channel);
        if (jQuery.inArray(channel, FList.Chat_reconnectTabs) == -1 && FList.Chat_channels.getInstance(channel) != -1) {
            FList.Chat_tabs.switchTab(FList.Chat_tabs.channelGetIndex(channel));
            return;
        }
        var index=this.getIndex(channel);
        FList.Chat_send("JCH " + JSON.stringify({channel: channel}));
    };

    this.getIndex = function(name){
        name = name.toLowerCase();
        for(var i in this.list){
            if(this.list[i].name.toLowerCase()==name) return i;
        }
        return -1;
    };

    this.getInstance = function(name){
        name=name.toLowerCase();
        for(var i in this.list){
            if(this.list[i].name.toLowerCase()==name) return this.list[i];
        }
        return -1;
    };

    this.getCurrentChannels = function(){
        var channels = [];
        for(var i in this.list){
            channels.push(this.list[i].name);
        }
        return channels;
    };

    this.removeUser = function(channel,user, notify){
        if (notify == null) notify=true;
        var channel=this.getInstance(channel);
        var name=user.toLowerCase();
        if(channel!==-1){
            for(var i in channel.userlist){
                if(channel.userlist[i].toLowerCase()==name){
                    channel.userlist.splice(i, 1);
                    break;
                }
            }
            var tabindex=FList.Chat_tabs.channelGetIndex(channel.name);
            if(tabindex!==-1){
                if (channel.name.substr(0,3) == "ADH") var title = channel.title;
                else var title = "#" + channel.name;
                if(user!=FList.Chat_identity && notify && FList.Chat_channelAlerts) FList.FChat_printMessage("<a class='AvatarLink'>" + user + "</a> left " + title, "ChatTypeLeave","",tabindex);
                if(tabindex==FList.Chat_tabs.currentIndex) {
                    $("#UserList .user").each(function(i){
                        if($(this).text()==user){
                            $(this).remove();
                            return false;
                        }
                    });
                }
            }
        }
    };

    this.addUser = function(channel, user, notify, dontUpdate){
        if (user == "") return;
        if (notify == null) notify=true;
        var channel=this.getInstance(channel);
        if(channel!==-1){
            if(jQuery.inArray(user,channel.userlist)==-1) {
                channel.userlist.push(user);
                if (dontUpdate != true) FList.Common_iSort(channel.userlist);
            }
            var tabindex=FList.Chat_tabs.channelGetIndex(channel.name);
            if(tabindex!==-1){
                if (channel.name.substr(0,3) == "ADH") var title = channel.title;
                else var title = "#" + channel.name;
                if(user!=FList.Chat_identity && notify && FList.Chat_channelAlerts) FList.FChat_printMessage("<a class='AvatarLink'>" + user + "</a> joined " + title, "ChatTypeJoin","",tabindex);
                if(tabindex==FList.Chat_tabs.currentIndex && dontUpdate != true) FList.Chat_users.addUser(user);
            }
        }
    };

    this.getPanel = function() {
    var panel = '<div class="chattabs">';
    panel += '<ul>';
    panel += '<li><a href="#tabs-1">Public Rooms</a></li>';
    panel += '<li><a href="#tabs-2">Private Rooms</a></li>';
    panel += '<li><a href="#tabs-3">Create Room</a></li>';
    panel += '</ul>';
    panel += '<div id="tabs-1" class="StyledForm">';
    panel += "<div id='ChatChannelsList' style='height:200px;overflow-x:hidden;overflow-y:auto;'>Loading channels...</div>";
    panel += '</div>';
    panel += '<div id="tabs-2" class="StyledForm">';
    panel += "<b>THESE ARE NOT MODERATED BY F-LIST STAFF.</b><div id='ChatAdhocOpenRoomList' style='height:190px;overflow-x:hidden;overflow-y:auto;'>Loading rooms...</div>";
    panel += '</div>';
    panel += '<div id="tabs-3" class="StyledForm">';
    panel += "<span style='font-size:0.8em;'>Private rooms are invisible and invitation-only by default. Read <a href='" + domain + "doc/chat_faq.php' target='_blank'>the help</a>!</span><br/><br/>";
    panel+='<input type="button" class="button" value="Make Room" onclick="FList.Chat_adhoc.create();$(\'#mnuchannels\').qtip(\'hide\');"/>Room Name:<br/>';
    panel += "<input id='ChatAdhocRoomName' style='width:250px;' type='text' />";
    panel += '<br/><br/><b>Manage your room</b><br/><span style="font-size:0.8em"><b>/invite &lt;name&gt;</b> - invite &lt;name&gt; to join your room.<br/><b>/openroom</b> - Open your room to the public.<br/><b>/closeroom</b> - close it again.<br/><b>/kick &lt;name&gt;</b> - kicks someone out.</span><br/>';
    panel += '</div>';
    panel += '</div>';
        return panel;
    };
};


//tracks the global and local userlists.
FList.Chat_users = new function ChatUsers() {
//global userlist.
    this.list = null;
    this.tracklist = [];
    this.ops = null;
    this.userdata = {};
    this.links = {};

    this.init = function(){
        this.clear();

            if(!$("#UserList").length>0)  $('<div><span id="OpList"/><span id="ChanOwnerList"/><span id="ChanOpList"/><span id="FriendList"/><span id="RegularList"/></div>').attr("id","UserList").insertBefore("#ChatBox");
            $("#UserList").bind('scroll',function(){
                FList.Chat_users.styleVisible(false);
            });
    };

    this.clear = function(){
        this.list=[];
        this.ops=[];
    };


    this.show = function(){
        //TODO: uh, stuff. this just calls update.
        this.update();
    };

    this.hide = function(){
        var ulist = $("#UserList");
        if(ulist.is(":visible")){
            ulist.hide("slide", {direction: "right"}, 300);
        }
    };

    this.addOpp = function(name){
        if(jQuery.inArray(name,this.ops)==-1){
            this.ops.push(name);
            FList.Common_iSort(this.ops);
            this.ops.reverse();
            this.updateUser(name);
        }
    };

    this.removeOp = function(name){
        if(jQuery.inArray(name, this.ops)!==-1){
            for(var i in this.ops){
                if(this.ops[i]==name) this.ops.splice(i,1);
            }
            this.updateUser(name);
        }
    };

    this.add = function(name, skiptabcheck){
        if(jQuery.inArray(name, this.list)==-1) {
            this.list.push(name);
        }
        if (skiptabcheck == true) return;
        var tab=FList.Chat_tabs.userGetIndex(name);
        if(tab!==-1){
            if(FList.Chat_tabs.list[tab].closed==false)
                FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> connected.", "ChatTypeConnect","", tab);
            else
                if(jQuery.inArray(name, this.tracklist)!=-1 && FList.Chat_statusAlerts){
                    FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> connected.", "ChatTypeConnect","", "all");
                }
        } else if(jQuery.inArray(name, this.tracklist)!=-1 && FList.Chat_statusAlerts)
            FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> connected.", "ChatTypeConnect","", "all");
        this.update();
    };


    this.remove = function(name){
        for(var i in this.list){
            if(this.list[i]==name) this.list.splice(i, 1);
        }
        for(var i in FList.Chat_channels.list){
             if(jQuery.inArray(name,FList.Chat_channels.list[i].userlist)!=-1) {
                FList.Chat_channels.removeUser(FList.Chat_channels.list[i].name,name);
             }

             var tab=FList.Chat_tabs.channelGetIndex(FList.Chat_channels.list[i].name);//leave message in private tab
             if(tab.closed==false) FList.FChat_printMessage(name + " left #" + tab.name, "ChatTypeLeave","",i);
        }
        var tab=FList.Chat_tabs.userGetIndex(name);
        if(tab!==-1){
            if(FList.Chat_tabs.list[tab].closed==false){
                FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> disconnected.", "ChatTypeDisconnect","", tab);
            } else {
                if(jQuery.inArray(name,this.tracklist)!=-1 && FList.Chat_statusAlerts){
                    FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> disconnected.", "ChatTypeDisconnect","", "all");
                }
            }
        } else {
            if(jQuery.inArray(name,this.tracklist)!=-1 && FList.Chat_statusAlerts){
                FList.FChat_printMessage("<a class='AvatarLink'>" + name + "</a> disconnected.", "ChatTypeDisconnect","", "all");
            }
        }
    };


    this.addTrack = function(name){
        if(jQuery.inArray(name, this.tracklist)==-1) {
            this.tracklist.push(name);
            FList.Common_iSort(this.tracklist);
            FList.Chat_users.update();
        }
    };

    this.removeTrack = function(name){
        for(var i in this.tracklist){
            if(this.tracklist[i]==name){
                this.tracklist.splice(i, 1);
                FList.Chat_users.update();
            }
        }
    };

    this.requestTrack = function(name){
        $.ajax({
            type: "GET",
            url: domain + "json/userTrack2.json",
            dataType: "json",
            timeout: (timeoutsec * 1000),
            data: ({
                dest_character_name: name
            }),
            success: function (data) {
                if(data.error==""){
                } else {
                    FList.Common_displayError(data.error);
                }
            },
            error: function (objAJAXRequest, strError, errorThrown) {
                FList.Common_displayError(strError + ", " + errorThrown);
            }
        });
    };

    this.getLink = function(user) {
        // return a dummy link if no such user is online
        if (FList.Chat_users.getInstance(user) == -1) return $("<a class='AvatarLink'>" + user + "</a>");
        // create link
        if (!FList.Chat_users.links[user]) {
            var data = this.getData(user);

            FList.Chat_users.links[user] = $("<a class='AvatarLink Gender" + data.gender + "'><span class='RankLink'></span>" + user + "</a>");
            FList.Chat_users.links[user].removeClass('StatusNone StatusOnline StatusLooking StatusIdle StatusAway StatusBusy StatusDND StatusCrown').addClass('Status' + data.status);
            //if (jQuery.inArray(user,FList.Chat_ignorelist) != -1) FList.Chat_users.links[user].removeClass("ChatLinkIgnored").addClass("ChatLinkIgnored");
        }
        if (FList.Chat_users.links[user].data("events") == undefined) {
            // garbage collection stole the damn context menu!!
            // (or it's just not initialized)
            //FList.Chat_contextMenu.bindTo(FList.Chat_users.links[user]);
        }
        return FList.Chat_users.links[user];
    };



    this.printCurrent = function(){
        if(FList.Chat_tabs.currentType=="channel"){
            var userlist=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).userlist;
            var chanops=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).chanops;
            var namestring="";
            userlist.sort();
            for(var i in userlist){
                var classes="";
                if(jQuery.inArray(userlist[i],this.ops)!=-1) {
                    classes="AvatarLink OpLink";
                } else if (userlist[i]==chanops[0]) {
                    classes="AvatarLink ChanOwnerLink";
                } else if (jQuery.inArray(userlist[i],chanops)!=-1) {
                    classes="AvatarLink ChanOpLink";
                } else if (jQuery.inArray(userlist[i],this.tracklist)!=-1) {
                    classes="AvatarLink FriendLink";
                } else {
                    classes="AvatarLink";
                    if(userlist[i] in FList.Chat_users.userdata) classes += " Gender" + FList.Chat_users.userdata[userlist[i]].gender;
                }
                //if(jQuery.inArray(userlist[i],FList.Chat_ignorelist)!==-1){
                //  classes=classes + " ChatLinkIgnored";
                //}
                namestring=namestring + ", <a class='" + classes + "'>" + userlist[i] + "</a>";
            }
            namestring=namestring.substring(2);
            FList.FChat_printMessage(namestring, "ChatTypeInfo","",'all');
        } else {
            FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
        }
    };

    this.printGlobal = function(filter){
        if (typeof(filter) == "undefined") var userlist = this.list;
        else {
            // filter userlist by filter object
            var userlist = jQuery.grep(this.list, function(item, index) {
                var udata = FList.Chat_users.getData(item);
                for (var f in filter) {
                    if (!udata[f] || udata[f].toLowerCase() != filter[f]) return false;
                }
                return true;
            });
        }
        var namestring="";
        for(var i in userlist){
            var classes="AvatarLink";
            if(jQuery.inArray(userlist[i],this.ops)==-1){
                if(userlist[i] in FList.Chat_users.userdata) classes += " Gender" + FList.Chat_users.userdata[userlist[i]].gender;
                //if(jQuery.inArray(userlist[i],FList.Chat_ignorelist)!==-1) classes=classes + " ChatLinkIgnored";
                namestring=namestring + ", <a class='" + classes + "'>" + userlist[i] + "</a>";
            }
        }
        namestring = namestring.substring(2);
        var opstring = "";
        for(var i = userlist.length - 1; i >= 0; i--){
            var classes="AvatarLink OpLink";
            if(jQuery.inArray(userlist[i],this.ops)!==-1){
                //if(jQuery.inArray(userlist[i],FList.Chat_ignorelist)!==-1) classes=classes + " ChatLinkIgnored";
                opstring = ", <a class='" + classes + "'>" + userlist[i] + "</a>" + opstring;
            }
        }
        if (opstring.length > 0) {
            opstring += ", ";
            opstring = opstring.substring(2);
        }
        FList.FChat_printMessage(opstring + namestring, "ChatTypeInfo","",'all');
    };

    this.getIndex = function(user){
        user=user.toLowerCase();
        for(var i in this.list){
            if(this.list[i].toLowerCase()==user) return i;
        }
        return -1;
    };

    this.getInstance = function(user){
        user=user.toLowerCase();
        for(var i in this.list){
            if(this.list[i].toLowerCase()==user) return this.list[i];
        }
        return -1;
    };

    this.addIgnore = function(name) {
        if (FList.Rights.has("chat-chatop")) {
            FList.Common_displayError("As a chatop, you can't ignore chatters, and they cannot ignore you.");
            return;
        }
        for (var opname in FList.Chat_users.ops) {
            if (name.toLowerCase() == FList.Chat_users.ops[opname].toLowerCase()) {
                FList.Common_displayError("You can't ignore a global moderator, and they cannot ignore you.");
                return;
            }
        }

        FList.Chat_send("IGN " + JSON.stringify({"action": "add", "character": name}));
    };

    this.delIgnore = function(name) {
        FList.Chat_send("IGN " + JSON.stringify({"action": "delete", "character": name}));
    };

    this.sanitizeStatus = function(status) {
        if (status.toLowerCase() == "looking") return "Looking";
        else if (status.toLowerCase() == "busy") return "Busy";
        else if (status.toLowerCase() == "idle") return "Idle";
        else if (status.toLowerCase() == "away") return "Away";
        else if (status.toLowerCase() == "dnd") return "DND";
        else if (status.toLowerCase() == "crown") return "Crown";
        else return "Online";
    };

    this.setData = function(user, data) {
        if (typeof(data.status) == "string") {
            data.status = this.sanitizeStatus(data.status);
        }
        if (typeof(data.statusmsg) == "string") data.statusmsg = data.statusmsg.replace(/\[icon\].*\[\/icon\]/g, "");
        if (typeof(this.userdata[user]) == "undefined") this.userdata[user] = {};
        for (var i in data) {
            this.userdata[user][i] = data[i];
        }
    };

    this.getData = function(user) {
        if (this.userdata[user]) return this.userdata[user];
        else return {status: "Online", gender: "None"};
    };

    this.updateUser = function(name){
        if(FList.Chat_disableUserlist==true) return;
        if(FList.Chat_tabs.currentType!=="channel") return;
        $("#UserList .user").each(function(i){
            if($(this).text()==name){
                $(this).remove();
                return false;
            }
        });
        return this.addUser(name);
    };

    this.styleVisible = function(redraw){
        if(FList.Chat_disableUserlist==true) return;
        var scrollViewTop = $("#UserList").scrollTop()-21;
        var scrollViewBottom = scrollViewTop + $("#UserList").height()+21;
        var selector=$("#UserList .user.unstyled");
        if(redraw)
            selector=$("#UserList .user");
        selector.each(function(i,el){
            if(i*21>=scrollViewTop && (i*21)+21<=scrollViewBottom){
                FList.Chat_users.styleLink($(el));
            }
        });
    };

    this.styleLink = function(el){
        if(FList.Chat_disableUserlist==true) return;
        //setTimeout(function() { el.html(FList.Chat_users.getLink(el.text())).removeClass("unstyled"); }, 500);
        var name=el.text();
        var chanops=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).chanops;
        el.html(FList.Chat_users.getLink(name)).removeClass("unstyled");
        el=el.children(".RankLink");
        el.removeClass("RankChatop RankChanop RankOwner");
        if (jQuery.inArray(name,FList.Chat_users.ops)!= -1){
        el.addClass("RankChatop");
        } else if (name == chanops[0]){
            el.addClass("RankOwner");
        }else if (jQuery.inArray(name,chanops) != -1){
            el.addClass("RankChanop");
        }
    };

    this.addUser = function(name){
        var userlist=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).userlist;
        var chanops=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).chanops;
    //  var link = FList.Chat_users.getLink(name);
        //link.find(".RankLink").removeClass("RankChatop RankChanop RankOwner");
        var addto="#RegularList";
        if (jQuery.inArray(name,this.ops)!= -1){
            addto="#OpList";
            //link.find(".RankLink").addClass("RankChatop");
        } else if (name == chanops[0]){
            addto="#ChanOwnerList";
            //link.find(".RankLink").addClass("RankOwner");
        }else if (jQuery.inArray(name,chanops) != -1){
            addto="#ChanOpList";
            //link.find(".RankLink").addClass("RankChanop");
        }else if (jQuery.inArray(name,this.tracklist)!= -1)
            addto="#FriendList";
        var myindex=jQuery.inArray(name,FList.Chat_users.list);
        if(FList.Chat_disableUserlist==false){
            var added=false;
            var newel=0;
            $("#UserList " + addto + " .user").each(function(i){
                var thisindexof=jQuery.inArray($(this).text(),FList.Chat_users.list);
                if(thisindexof>myindex){
                    newel=$("<div>" + name + "</div>").insertBefore(this);
                    FList.Chat_users.styleLink(newel);
                    added=true;
                    return false;
                }
            });
            if(added==false) {
                $("#UserList " + addto).append("<div class='user unstyled'>" + name + "</div>");
                FList.Chat_users.styleLink($("#UserList " + addto + " .user:last"));
                return $("#UserList " + addto + " .user:last");
            } else {
                return newel;
            }
        }

    };


    this.update = function(){
        if(FList.Chat_disableUserlist==true) return;
        //TODO: make this actually update, not redraw


        // delete this by hand because jquery leaks like a sieve!
        $("#UserList div").detach();
        if(FList.Chat_tabs.currentType=="channel"){
            var userlist=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).userlist;
            var chanops=FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).chanops;
            if(userlist.length>0){
                var rlisthtml="";var olisthtml="";var owlisthtml="";var colisthtml="";var flisthtml="";
                for(var i in userlist){
                    if(!(userlist[i] in FList.Chat_ignorelist)){
                        //var link = FList.Chat_users.getLink(userlist[i]);
                        if (jQuery.inArray(userlist[i],this.ops)!= -1){
                            olisthtml=olisthtml + "<div class='user unstyled'>" + userlist[i] + "</div>";
                        } else if (userlist[i] == chanops[0]){
                            owlisthtml=owlisthtml + "<div class='user unstyled'>" + userlist[i] + "</div>";
                        }else if (jQuery.inArray(userlist[i],chanops) != -1){
                            colisthtml=colisthtml + "<div class='user unstyled'>" + userlist[i] + "</div>";
                        }else if (jQuery.inArray(userlist[i],this.tracklist)!= -1){
                            flisthtml=flisthtml + "<div class='user unstyled'>" + userlist[i] + "</div>";
                            } else {
                            rlisthtml=rlisthtml + "<div class='user unstyled'>" + userlist[i] + "</div>";
                            }
                    }
                }
                $("#UserList #RegularList").html(rlisthtml);
                $("#UserList #OpList").html(olisthtml);
                $("#UserList #ChanOwnerList").html(owlisthtml);
                $("#UserList #ChanOpList").html(colisthtml);
                $("#UserList #FriendList").html(flisthtml);

            }
        }
        //$("#ChatHeader").empty();
        $("#ChatOnlineCount").text("F-Chat (" + this.list.length + ")");
       // if (FList.Chat_fullscreen) $("#ChatHeader").append(' &bull; <a href="/doc/chat_faq.php" target="_blank">Help</a> &bull; <a href="/doc/chat_rules.php" target="_blank">Rules</a> &bull; <a href="javascript:" id="ChatGetAMod">Alert Staff</a>');
       this.styleVisible(true);
       //TODO apply chanop styles here.
    };
};


FList.Chat_ads = new function ChatAds() {
    this.maxAds = 25;
    this.inited = false;
    this.lastAds = [];
    this.newcount = 0;
    this.receiveAd = function(adhtml) {
            if (!this.inited) {
                this.initAdCounter();
                this.inited = true;
            }
            var newhtml = $(adhtml).clone();
            this.lastAds.unshift(newhtml);
            this.lastAds = this.lastAds.slice(0, this.maxAds);
            this.newcount++;
            if (this.newcount > this.maxAds) this.newcount = this.maxAds;
            $("#recentads").html(this.newcount);
    };
    this.getAds = function() {
        this.newcount = 0;
        $("#recentads").html(this.newcount);
        var adholder = $('<div></div>');
        $.each(this.lastAds, function (i, e) {adholder.append(e);});
        return adholder.html();
    };
    this.initAdCounter = function() {
      $("#recentads").qtip({
          hide: {
                    event: 'unfocus'
                },
          show: {
                    event: 'click', // Show it on click...
          modal: true // ...and make it modal
                },
          style: {classes: 'ui-tooltip-shadow ui-tooltip-rounded chatdialog ChatLastAds', widget: true, width: $(window).width() * 0.6 + 20},
          position: {
              my: 'center', // ...at the center of the viewport
          at: 'center',
          target: $(window)
          },
          content: {
                       text: "Loading...",
          title: {text: 'Recent RP Ads (all open channels)', button: true}
                   },
          events: {
                      show: function(event, api) {
                                $("#recentads").qtip('option', 'content.text', FList.Chat_ads.getAds());
                                //FList.Chat_contextMenu.bindTo(".ChatLastAds .AvatarLink");
                            }
                  }
        });
    };
};

// BEGIN TRANSLATION
FList.Chat_translation = new function ChatTranslation() {
    this.loaded = false;
    this.loading = false;
    this.buffer = [];
    this.onLoad = function() {
        FList.Chat_translation.loaded = true;
        for (var t in FList.Chat_translation.buffer) {
            var tr = FList.Chat_translation.buffer[t];
            google.language.translate(tr.content, tr.from, tr.to, tr.callback);
        }
        FList.Chat_translation.buffer = [];
    };
    this.translate = function(content, from, to, callback) {
        if (this.loaded == false) {
            this.buffer.push({content: content, from: from, to: to, callback: callback});
            if (this.loading == true) return;
            this.loading = true;
            google.load("language", "1", {callback: FList.Chat_translation.onLoad});
            return;
        }
        google.language.translate(content, from, to, callback);
    };
};
// END TRANSLATION

FList.Chat_prefs = new function ChatPrefs() {
    this.currentPrefs = {
        defaultChannels: [],
        muteSound: false,
        alwaysSound: false,
        swapMouse: false,
        fontSize: 12,
        disableIcons: false,
        autoIdle: false,
        highlightName: false,
        notifications: false,
        highlightWords: "",
        highlightMyMessages: true,
        channelAlerts: false,
        statusAlerts: true,
        ticketAlerts: false,
        messageCap: 50,
        autoparseURLs: true,
        truncateLogs: false,
        logPM: false,
        autoTranslate: false
    };
    this.applyPrefs = function(po) {
        // take this out after some time
        if (typeof(po.defaultChannels) != "undefined") {
            for (var i in po.defaultChannels) {
                po.defaultChannels[i] = unescape(po.defaultChannels[i]);
            }
        }
        if(po.disableIcons && po.disableIcons==true) FList.Chat_disableIcons=true;
            else FList.Chat_disableIcons=false;
        if (po.muteSound && po.muteSound == true) FList.Chat_muteSound = true;
            else FList.Chat_muteSound = false;
        if (po.notifications && po.notifications == true) FList.Chat_notifications = true;
            else FList.Chat_notifications = false;
        if (po.fontSize && po.fontSize > 0) FList.Chat_fontSize = po.fontSize;
            else FList.Chat_fontSize = 12;
        if (po.alwaysSound && po.alwaysSound == true) FList.Chat_alwaysSound = true;
            else FList.Chat_alwaysSound = false;
        if (po.swapMouse && po.swapMouse == true) FList.Chat_swapMouse = true;
            else FList.Chat_swapMouse = false;
        if (po.autoIdle && po.autoIdle == true) FList.Chat_autoIdle = true;
            else FList.Chat_autoIdle = false;
        if (po.highlightName && po.highlightName == true) FList.Chat_highlightName = true;
            else FList.Chat_highlightName = false;
        if (po.highlightMyMessages && po.highlightMyMessages == true) FList.Chat_highlightMyMessages = true;
            else FList.Chat_highlightMyMessages = false;
        if (po.highlightWords && po.highlightWords.length > 0) FList.Chat_highlightWords = po.highlightWords;
            else FList.Chat_highlightWords = "";
        if (po.channelAlerts && po.channelAlerts == true) FList.Chat_channelAlerts = true;
            else FList.Chat_channelAlerts = false;
        if (po.statusAlerts && po.statusAlerts == true) FList.Chat_statusAlerts = true;
            else FList.Chat_statusAlerts = false;
        if (po.ticketAlerts && po.ticketAlerts == true) FList.Chat_ticketAlerts = true;
            else FList.Chat_ticketAlerts = false;
        if (po.messageCap && po.messageCap > 0) FList.Chat_messageCap = po.messageCap;
            else FList.Chat_messageCap = 50;
        if (po.truncateLogs && po.truncateLogs == true) FList.Chat_truncateLogs = true;
            else FList.Chat_truncateLogs = false;
        if (po.logPM && po.logPM == true) FList.Chat_logPM = true;
            else FList.Chat_logPM = false;
        if (po.autoparseURLs && po.autoparseURLs == true) FList.Chat_autoparseURLs = true;
            else FList.Chat_autoparseURLs = false;
        if (po.defaultChannels && po.defaultChannels.length > 0) FList.Chat_defaultChannels = po.defaultChannels;
            else {
                FList.Chat_defaultChannels = this.currentPrefs.defaultChannels;
                po.defaultChannels = this.currentPrefs.defaultChannels;
            }
        if (po.autoTranslate && po.autoTranslate != "off") FList.Chat_autoTranslate = po.autoTranslate;
            else FList.Chat_autoTranslate = false;
        $("#ChatArea .inner").css("font-size", FList.Chat_fontSize + "px");
        this.currentPrefs = po;
    };
    this.storePrefs = function() {
        // OMG I AM SO GLAD WE'RE USING FULL JSON NOW.
        var prefstring = JSON.stringify(this.currentPrefs);
        FList.Common_setCookie("chat_preferences", prefstring, 60);
    };
    this.loadPrefs = function() {
        var prefstring = FList.Common_getCookie("chat_preferences");
        if (prefstring == "") var loadedPrefs = this.currentPrefs;
        else var loadedPrefs = $.parseJSON(prefstring);
        loadedPrefs.messageCap=(!isNaN(loadedPrefs.messageCap) && loadedPrefs.messageCap!="undefined") ? loadedPrefs.messageCap : 100;
        loadedPrefs.fontSize=(!isNaN(loadedPrefs.fontSize) && loadedPrefs.fontSize!="undefined") ? loadedPrefs.fontSize : 12;
        this.applyPrefs(loadedPrefs);
    };
    this.getPrefPanel = function() {
        var panel = '<div id="ChatPrefPanel">';
        panel += '<div class="chattabs">';
        panel += '<ul>';
        panel += '<li><a href="#tabs-1">General</a></li>';
        panel += '<li><a href="#tabs-2">Notifications</a></li>';
        panel += '<li><a href="#tabs-3">Translation</a></li>';
        panel += '</ul>';
        panel += '<div id="tabs-1" class="StyledForm">';
        panel += '<input type="checkbox" id="ChatPrefAlerts" name="ChatPrefAlerts" class="check"' + (this.currentPrefs.channelAlerts ? 'checked="checked"' : "") + '/><label for="ChatPrefAlerts">Display leave/join notices</label><br/>';
        panel += '<input type="checkbox" id="ChatDisableIcons" name="ChatDisableIcons" class="check"' + (this.currentPrefs.disableIcons ? 'checked="checked"' : "") + '/><label for="ChatDisableIcons">Disable [icon]</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefSAlerts" name="ChatPrefSAlerts" class="check"' + (this.currentPrefs.statusAlerts ? 'checked="checked"' : "") + '/><label for="ChatPrefSAlerts">Display online/offline notices for friends</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefURLs" name="ChatPrefURLs" class="check"' + (this.currentPrefs.autoparseURLs ? 'checked="checked"' : "") + '/><label for="ChatPrefURLs">Make links clickable</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefSwapMouse" name="ChatPrefSwapMouse" class="check"' + (this.currentPrefs.swapMouse ? 'checked="checked"' : "") + '/><label for="ChatPrefSwapMouse">Clicking names opens PM</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefAutoIdle" name="ChatPrefAutoIdle" class="check"' + (this.currentPrefs.autoIdle ? 'checked="checked"' : "") + '/><label for="ChatPrefAutoIdle">Set status to idle automatically</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefTruncateLogs" name="ChatPrefTruncateLogs" class="check"' + (this.currentPrefs.truncateLogs ? 'checked="checked"' : "") + '/><label for="ChatPrefTruncateLogs">Disable chatlogs</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefLogPM" name="ChatPrefLogPM" class="check"' + (this.currentPrefs.logPM ? 'checked="checked"' : "") + '/><label for="ChatPrefLogPM">Disable PM logs</label><br/>';
        panel += 'Maximum displayed messages: <input type="text" size="3" id="ChatPrefCap" name="ChatPrefCap" class="text" value="' + (this.currentPrefs.messageCap) + '"/><br/>';
        panel += '<div id="FontSizeSlider"></div><label for="ChatPrefFontSize">Chat font size:</label>';
        panel += '<input type="text" id="ChatPrefFontSize" disabled="disabled" size="3" name="ChatPrefFontSize" style="border:0; font-weight:bold;" value="' + (this.currentPrefs.fontSize) + '" /><br/>';
        panel += '<button name="ClearLocalStorage" onClick="FList.Chat.Logs.Delete()" title="Delete locally stored PM logs. (HTML5 Web Storage)">Delete PM Logs</button><br/>';
        panel += '</div>';
        panel += '<div id="tabs-2" class="StyledForm">';
        panel += '<input type="checkbox" id="ChatPrefAudio" name="ChatPrefAudio" class="check"' + (this.currentPrefs.muteSound ? 'checked="checked"' : "") + '/><label for="ChatPrefAudio">Mute (HTML5) sounds</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefAlwaysSound" name="ChatPrefAlwaysSound" class="check"' + (this.currentPrefs.alwaysSound ? 'checked="checked"' : "") + '/><label for="ChatPrefAlwaysSound">Always play PM/Highlight sound</label><br/>';
        if(!FList.Chat_notification.enabled){
            panel += '<input type="button" style="float:right;" value="Get Permission" onclick="FList.Chat_notification.getPermission();"/>';
        }
        panel += '<input type="checkbox" id="ChatPrefNotifications" name="ChatPrefNotifications" class="check"' + (this.currentPrefs.notifications ? 'checked="checked"' : "") + '/><label for="ChatPrefNotifications">Enable notifications(Chrome)</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefName" name="ChatPrefName" class="check"' + (this.currentPrefs.highlightName ? 'checked="checked"' : "") + '/><label for="ChatPrefName">Highlight people mentioning me,</label><br/>';
        panel += "and these other words (comma separated):<br/>";
        panel += '<input type="text" size="20" id="ChatPrefWords" name="ChatPrefWords" class="text" value="' + (this.currentPrefs.highlightWords) + '"/><br/>';
        panel += '<input type="checkbox" id="ChatPrefMyMessages" name="ChatPrefMyMessages" class="check"' + (this.currentPrefs.highlightMyMessages ? 'checked="checked"' : "") + '/><label for="ChatPrefMyMessages">Different color for my own messages</label><br/>';
        panel += '<input type="checkbox" id="ChatPrefTAlerts" name="ChatPrefTAlerts" class="check"' + (this.currentPrefs.ticketAlerts ? 'checked="checked"' : "") + '/><label for="ChatPrefTAlerts">Display helpticket notices.</label><br/><br/>';
        panel += '</div>';
        panel += '<div id="tabs-3" class="StyledForm">';
        panel += 'Auto-translate chat:<br/>';
        panel += '<select name="ChatPrefTranslate" id="ChatPrefTranslate">';
        panel += '<option value="off">No translation</option>';
        for (var l in FList.Chat_languages) {
            var lang = FList.Chat_languages[l];
            panel += '<option value="' + l + '"';
            if (FList.Chat_autoTranslate == l) panel += ' selected="selected"';
            panel += '>' + lang.name + '</option>';
        }
        panel += '</select><br/><span style="font-size:0.9em;">Auto-translating will submit your messages to Google Translate.</span><br/>';
        panel += '</div>';
        panel += '</div>';
        panel += "<br/>Saving settings saves your open channels.<br/>";
        panel += '</div>';
        return panel;
    };
    this.updatePrefs = function() {
        var po = {};
        var ochannels = FList.Chat_channels.getCurrentChannels();
        var fchannels = [];
        for (var i = 0; i < ochannels.length; i++){
            if(ochannels[i].toLowerCase()!=="adh-staffroomforstaffppl" && ochannels[i].toLowerCase()!=="adh-chanoproomforchanops" && ochannels[i].toLowerCase()!=="adh-uberawesomestaffroom")
                fchannels.push(ochannels[i]);
        }
        po.defaultChannels = fchannels;
        po.muteSound = $("#ChatPrefPanel input:checkbox[name=ChatPrefAudio]:checked").length>0 ? true : false;
        po.alwaysSound = $("#ChatPrefPanel input:checkbox[name=ChatPrefAlwaysSound]:checked").length>0 ? true : false;
        po.notifications = $("#ChatPrefPanel input:checkbox[name=ChatPrefNotifications]:checked").length>0 ? true : false;
        po.swapMouse = $("#ChatPrefPanel input:checkbox[name=ChatPrefSwapMouse]:checked").length>0 ? true : false;
        po.autoIdle = $("#ChatPrefPanel input:checkbox[name=ChatPrefAutoIdle]:checked").length>0 ? true : false;
        po.highlightName = $("#ChatPrefPanel input:checkbox[name=ChatPrefName]:checked").length>0 ? true : false;
        po.disableIcons = $("#ChatPrefPanel input:checkbox[name=ChatDisableIcons]:checked").length>0 ? true : false;
        po.highlightWords = $("#ChatPrefPanel input:text[name=ChatPrefWords]").val().length > 0 ? $("#ChatPrefPanel input:text[name=ChatPrefWords]").val().trim().replace(/["']/g, '') : "";
        po.highlightMyMessages = $("#ChatPrefPanel input:checkbox[name=ChatPrefMyMessages]:checked").length>0 ? true : false;
        po.channelAlerts = $("#ChatPrefPanel input:checkbox[name=ChatPrefAlerts]:checked").length>0 ? true : false;
        po.statusAlerts = $("#ChatPrefPanel input:checkbox[name=ChatPrefSAlerts]:checked").length>0 ? true : false;
        po.ticketAlerts = $("#ChatPrefPanel input:checkbox[name=ChatPrefTAlerts]:checked").length>0 ? true : false;
        po.autoparseURLs = $("#ChatPrefPanel input:checkbox[name=ChatPrefURLs]:checked").length>0 ? true : false;
        po.autoTranslate = $("#ChatPrefPanel select[name=ChatPrefTranslate]").val();
        po.truncateLogs = $("#ChatPrefPanel input:checkbox[name=ChatPrefTruncateLogs]:checked").length>0 ? true : false;
        po.logPM = $("#ChatPrefPanel input:checkbox[name=ChatPrefLogPM]:checked").length>0 ? true : false;
        po.messageCap = !isNaN($("#ChatPrefPanel input:text[name=ChatPrefCap]").val()) ? $("#ChatPrefPanel input:text[name=ChatPrefCap]").val() : 50;
        po.fontSize = !isNaN($("#ChatPrefPanel input:text[name=ChatPrefFontSize]").val()) ? $("#ChatPrefPanel input:text[name=ChatPrefFontSize]").val() : 12;
        this.applyPrefs(po);
        this.storePrefs();
        //$('#ChatSettingsLink').qtip("hide");
        FList.Chat_tabs.switchTab(FList.Chat_tabs.currentIndex);//redraw current tab with new limit.
        FList.Chat_idletimer.init();
    };
};

FList.Chat_idletimer = {
    timer: 0,
    idle: false,
    init: function(){
        FList.Chat_idletimer.disable();
        //console.log("idle timer debug: init | " + FList.Common_getDate(new Date()));
        if(FList.Chat_autoIdle){
            FList.Chat_idletimer.enable();
            //console.log("init, enabled");
        }
    },
    enable: function(){
        if(FList.Chat_autoIdle){
        FList.Chat_idletimer.timer = setTimeout(function () {
                //console.log("idle timer debug: IDLE ACTIVE | " + FList.Common_getDate(new Date()));
                FList.Chat_idletimer.timer=0;
                var tempstate={};
                tempstate.status="Idle";
                tempstate.statusmsg= FList.Chat_lastStatus==null ? "" : FList.Chat_lastStatus.statusmsg;
                FList.Chat_send("STA " + JSON.stringify(tempstate));
                FList.Chat_idletimer.idle=true;
            }, 300000);
        }
    },
    //called upon activity
    reset: function(){
        if(FList.Chat_autoIdle && FList.Chat_idletimer.idle==false){
            FList.Chat_idletimer.disable();
            FList.Chat_idletimer.enable();
        }
        if(FList.Chat_idletimer.idle==true){
            FList.Chat_idletimer.idle=false;
            //console.log("idle timer debug: deactivating idle | " + FList.Common_getDate(new Date()));
            FList.Chat_status.update();//restore old status
        }
    },
    //clear out timers
    disable: function(){
        clearTimeout(FList.Chat_idletimer.timer);
    }
};

// BEGIN TAB SCROLLING
FList.Chat_tabscroll = {};
FList.Chat_tabscroll.init = function() {
    $("#TabBox").unbind("mouseenter mouseleave mousemove");
    clearInterval(FList.Chat_tabscroll.scrollInterval);

    FList.Chat_tabscroll.scrollInterval = null;
    FList.Chat_tabscroll.tabbox = $("#TabBox");
    FList.Chat_tabscroll.scrollFunction = function() {
        FList.Chat_tabscroll.tabbox.scrollTop(FList.Chat_tabscroll.tabbox.scrollTop() + FList.Chat_tabscroll.scrollSpeed);
    };
    FList.Chat_tabscroll.tabbox.mouseenter(function(e) {
        e.preventDefault();
        if (FList.Chat_tabscroll.scrollInterval != null) return;
        FList.Chat_tabscroll.scrollInterval = setInterval(FList.Chat_tabscroll.scrollFunction, 20);
    });
    FList.Chat_tabscroll.tabbox.mouseleave(function(e) {
        e.preventDefault();
        clearInterval(FList.Chat_tabscroll.scrollInterval);
        FList.Chat_tabscroll.scrollInterval = null;
    });
    FList.Chat_tabscroll.tabbox.mousemove(function(e){
        e.preventDefault();
        var t = FList.Chat_tabscroll.tabbox;
        var y = e.pageY - t.offset().top;
        var offs = 120;
        if (y < offs) {
            FList.Chat_tabscroll.scrollSpeed = 0 - parseInt((1 - (y / offs)) * 30);
        } else if (y > t.height() - offs) {
            FList.Chat_tabscroll.scrollSpeed = parseInt((1 - ((t.height() - y) / offs)) * 30);
        } else {
            FList.Chat_tabscroll.scrollSpeed = 0;
        }
    });
};
// END TAB SCROLLING

FList.Chat_paraBar = new function ParaBar() {
    // HTML element shortcuts to save on jQuery selection during an update.
    this.messageBox = null;
    this.element = null;
    this.innerDiv = null;

    // Shows the bar in the corner of the input box.
    this.show = function() {
        this.messageBox = $("#MessageBox").first();
        if (this.element != null) {
            this.element.hide();
        } else {
            this.element = $(document.createElement("div"));
            $(document.body).append(this.element);
            this.innerDiv = $(document.createElement("div"));
            this.element.append(this.innerDiv);
            this.element.attr("id", "ParaBar");
        }
        this.element.css("height", $("#MessageBox").css("height"));
        this.nudge();
        this.element.fadeIn("fast", function(){FList.Chat_paraBar.nudge();});
    };

    this.hide = function(){
        if(this.element!=null) this.element.hide();
    };

    // Updates the bar, should be called on keypresses and whenever the box gets focus or blurs.
    this.update = function() {
        if (this.element == null) return;
        var cTab = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
        var cMax = cTab.type == "person" || cTab.id.substr(0,3) == "ADH" ? FList.Chat_priMaxLength : FList.Chat_msgMaxLength;
        var fill = this.messageBox.val().length / cMax;
        if (fill < 0) fill = 0;
        if (fill > 1) fill = 1;
        this.innerDiv.css("height", ((1 - fill) * 100) + "%");
        if (fill == 1) {
            this.element.css("background-color", "#ff6666");
        } else {
            this.element.css("background-color", "#666666");
        }
        this.nudge();
    };

    // Adjust parabar position.
    this.nudge = function() {
        if (!this.element) return;
        this.element.css("height", $("#MessageBox").css("height"));
        if($("#MessageBox").length>0){
            if (!$.browser.webkit) {
                this.element.css("top", ($("#MessageBox").offset().top + 1) + "px");
                this.element.css("left", ($("#MessageBox").offset().left + parseInt($("#MessageBox").css("width")) - 2) + "px");
            } else {
                this.element.css("top", ($("#MessageBox").offset().top + 2) + "px");
                this.element.css("left", ($("#MessageBox").offset().left + parseInt($("#MessageBox").css("width")) - 5 ) + "px");
            }
        }
    };
};

FList.Chat_typing = {
    interval: null,
    update: function() {
        var tab = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
        if (tab.type != "person") return;
        tab.typetime = new Date().getTime();
        if (tab.mewaiting == true) {
            tab.mewaiting = false;
            return;
        }
        if (tab.metyping == false && $("#MessageBox").val().length > 0) {
            tab.metyping = true;
            FList.Chat_send("TPN " + JSON.stringify({character: tab.id, status: "typing"}));
        }
    },
    check: function(force) {
        var minTypeTime = new Date().getTime() - FList.Chat_typingInterval * 1000 + 10;
        var tab = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
        if (tab.type != "person") return;
        if (force == true || (tab.typetime < minTypeTime && tab.metyping == true)) {
            tab.metyping = false;
            var tst = "paused";
            if ($("#MessageBox").val().length == 0) tst = "clear";
            FList.Chat_send("TPN " + JSON.stringify({character: tab.id, status: tst}));
        }
    },
    indicate: function() {
        var tab = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
        $("#ChatTypingIndicator").html("");
        $("#ChatTypingIndicator").hide();
        if (tab.type != "person") return;
        if (tab.laststatus == tab.status) return;
        tab.laststatus = tab.status;

        $("#ChatTypingIndicator").css("left",($("#MessageBox").offset().left) + "px");
        $("#ChatTypingIndicator").css("top",($("#MessageBox").offset().top-25) + "px");
        if (tab.status != "clear") {
            if (tab.status == "typing") var msg = "is typing...";
            else var msg = "has entered text.";
            $("#ChatTypingIndicator").html("<strong>" + tab.id + "</strong> " + msg);
            $("#ChatTypingIndicator").show();
        } else {
            $("#ChatTypingIndicator").hide();
        }
        //if($("#ChatArea div").prop("scrollTop")>=($("#ChatArea div").prop("scrollHeight")- $('#ChatArea div').height() )-50) $("#ChatArea div").scrollTop($("#ChatArea div").prop("scrollHeight") - $('#ChatArea div').height());
    }
};

FList.Chat_updateHeight = function() {
    var winheight = $(window).height()-42;
    if (winheight < 200) var winheight = 0;
    $("#TabBox, #UserList").height(winheight+8);
    //$("#ChatArea div.inner").height(winheight-27-$("#msgfieldarea").outerHeight());
    $("#ChatArea div.inner").height($(window).height()-$("#msgfieldarea").outerHeight()-86);
    //$("#").height($("#MessageBox").height());
    $("#msgfieldarea").css("margin-left", $("#TabBox").outerWidth() + "px");
    $("#msgfieldarea").css("margin-right", $("#UserList").outerWidth() + "px");
    $("#msgfieldarea").css("width",$(window).width()-($("#UserList").outerWidth()+$("#TabBox").outerWidth()+20)).css("top","0px");
    $("#msgfieldarea textarea").css("height",$("#msgfieldarea").outerHeight()-41);
    //$(window).width()-($("#UserList").outerWidth()+12+$("#TabBox").outerWidth())+"px").css("left",$("#TabBox").outerWidth() + "px");
    //$("#CharBox").width($(window).width()-($("#UserList").outerWidth()+60)+"px").css("left","50px");
    if(FList.Chat_disableUserlist){
        $("#UserList").css("width","0px").hide();
    }
    var obj=$("#MessageBox").offset();
    if(obj!==null) $("#ChatTypingIndicator").css("top",(obj.top-40) + "px");
    FList.Chat_paraBar.nudge();
};

    function EventData(type, payload){
        this.type=type;
        this.payload=payload;
    }

FList.Chat_connect = function(ticket, account, character){
    //console.log("connecting...");
    $("#ChatStatusLink").removeClass('StatusNone StatusOnline StatusLooking StatusIdle StatusAway StatusBusy StatusDND StatusCrown');
    FList.Chat_connectComplete = false;
    document.title = "F-Chat [Connecting...]";
    if(FList.Chat_ws) FList.Chat_ws.close();
    FList.Chat_host="wss://chat.f-list.net:9799/";
    if(window.location.href.indexOf("useDev") != -1) {
        FList.Chat_host="wss://chat.f-list.net:8799/";
        //console.log("using dev");
    }
    if(window.location.href.indexOf("useHexxy") != -1){
        FList.Chat_host="ws://94.212.51.157:9722/";
    }
    if(window.location.href.indexOf("NoUserlist") != -1){
        FList.Chat_disableUserlist=true;
    }
    if(window.location.href.indexOf("useLocal") != -1){
        FList.Chat_host="wss://127.0.0.1:9721/";
    }
    //if(window.location.href.indexOf("useExperimental") != -1){
    //}
    if ('MozWebSocket' in window) {
        FList.Chat_ws = new MozWebSocket(FList.Chat_host);
    } else {
        FList.Chat_ws = new WebSocket(FList.Chat_host);
    }
    FList.Chat_ws.onopen = function() {
        //console.log("connection opened!");
         FList.Chat_send("IDN " + JSON.stringify({
                "method": "ticket",
                "ticket": ticket,
                "account": account,
                "character": character,
                cname: "F-List Web Chat - old",
                cversion: FList.Chat_version
            }));

        //if(FList.Chat_logging) FList.Chat_send("VAR " + JSON.stringify({ "variable":"logging","value": "1" }));
    };
    FList.Chat_ws.onmessage = function (evt) {
        FList.Chat_parseCommand(evt.data);
    };
    FList.Chat_ws.onclose = function(e) {
        FList.Chat_playSound("logout");
        clearTimeout(FList.Chat_pingTimeout);
        FList.Chat_idletimer.disable();
        //console.log("connection closed");
        if (FList.Chat_forceclose) {
            FList.Chat_forceclose = false;
            FList.Chat_initLoginBox();
        }
        else FList.Chat_reconnect();
    };

  FList.Chat_ws.onerror = function(e) {
      clearTimeout(FList.Chat_pingTimeout);
      console.log("Connection error. Dumping error event:");
      console.log(e);

      if (FList.Chat_ws.readyState == 0) {
          // An error occurred while attempting to connect.
          FList.Common_displayError("Failed to connect. There may be a problem with your internet connection, or F-Chat is currently not available.");
      } else {
          // An error occurred while we were connected (e.g. the server timed us out).
          FList.Common_displayError("A connection error occurred. Please check your internet connection.");
      }

      FList.Chat_ws.close();
  };
};

FList.Chat_joinChannels = function() {
    if (!FList.Chat_reconnecting) {
        FList.Chat_playSound("login");
        FList.Chat_initChatbox();
        FList.Chat_urlparams = {};
        var params = window.location.search.substr(1);
        if(params.length>0){
            params = params.split("&");
            for (var p in params) FList.Chat_urlparams[params[p].split("=", 2)[0]] = params[p].split("=", 2)[1];
        }
        for(var i in FList.Chat_tabs.list){
            var tab=FList.Chat_tabs.list[i];
            if(tab.type=="channel" && tab.closed==false && jQuery.inArray(tab.id,FList.Chat_defaultChannels)==-1){
                FList.Chat_send("JCH " + JSON.stringify({channel: tab.id}));
            }
        }

        if (typeof(FList.Chat_urlparams["openPM"]) == "string") {
            // for 3 seconds, open new tabs in the background so the PM stays focused
            FList.Chat_backgroundTabs = true;
            FList.Chat_openPrivateChat(unescape(FList.Chat_urlparams["openPM"]), true);
            setTimeout(function() {FList.Chat_backgroundTabs = false;}, 3000);
        }
        if (typeof(FList.Chat_urlparams["joinChannel"]) == "string" && !FList.Chat_reconnecting) {
            FList.Chat_send("JCH " + JSON.stringify({channel: FList.Chat_urlparams["joinChannel"]}));
        } else {
            for(var i in FList.Chat_defaultChannels){
                FList.Chat_send("JCH " + JSON.stringify({channel: FList.Chat_defaultChannels[i]}));
            }
        }
    } else {
        // On reconnect, just restore tabs quietly.
        // Store to-be-restored tabs in array to detect when reconnect is complete.
        FList.Chat_reconnectTabs = [];
        for(var i in FList.Chat_tabs.list){
            var tab=FList.Chat_tabs.list[i];
            if(tab.type=="channel" && tab.closed==false){
                FList.Chat_reconnectTabs.push(tab.id);
                FList.Chat_send("JCH " + JSON.stringify({channel: tab.id}));
            }
        }
    }
};

// Attempt to reconnect to the chat server
FList.Chat_reconnect = function() {
    if (FList.Chat_reconnecting) return;
    FList.FChat_printMessage("Chat connection interrupted. Trying to restore, one moment!", "ChatTypeNotice","",'all');
    clearTimeout(FList.Chat_pingTimeout);
    FList.Chat_reconnecting = true;
    FList.Chat_reconnectCancelTimeout = setTimeout(function() {
        FList.Chat_reconnecting = false;
        FList.Chat_ws.close();
        FList.Chat_initLoginBox();
    }, 15000);
    FList.Chat_reconnectStartTimeout = setTimeout(function() {
        var faccount=$("#ChatAccount").val();
        $.ajax({
            type: "GET",
            url: domain + "json/getApiTicket.php",
            dataType: "json",
            timeout: timeoutsec * 1000,
            data: { },
            success: function (data) {
                if(data.error==""){
                    // The following line was causing F-Chat to repeatedly attempt to reconnect.
                    // Specifically connect and reconnect would enter a recursive infinite loop by calling each other.
                    // FList.Chat_connect(data.hash, faccount, FList.Chat_identity);
                    FList.Chat_giveUpReconnect();
                } else {
                    FList.Common_displayError(data.error);
                }
            },
            error: function (objAJAXRequest, strError, errorThrown) {
                FList.Common_displayError("Failed to get an API ticket while reconnecting. There may be a problem with your internet connection or F-List.");
                console.log("Error while trying to get API ticket while reconnecting: " + strError + ", " + errorThrown);
            }
        });
    }, 3000);
};

// Call once giving up connecting
FList.Chat_giveUpReconnect = function()
{
    FList.FChat_printMessage("Failed to reconnect to server. You will have to reconnect manually.", "ChatTypeNotice","",'all');
    clearTimeout(FList.Chat_pingTimeout);
    FList.Chat_reconnecting = false;
    document.title = "F-Chat [Could not connect]";
};

FList.Chat_send = function(line){
    FList.Chat_ws.send(line);
    if(WEB_SOCKET_DEBUG){
        FList.FChat_printMessage("&gt;&gt;" + line, "ChatTypeConsole", "", 0);
    }
    //console.log(line);
};

// BEGIN CHAT COMMANDS
FList.Chat_commands = {};
FList.Chat_commands['MSG'] = function(params) {
    if(jQuery.inArray(params.character.toLowerCase(),FList.Chat_ignorelist)!==-1) return;
    var identity = params.character;
    //if (message.substring(0,6) != "/warn ") return;//HOW DID THIS GET HERE? o.o
    var channel = params.channel;
    var message = params.message;
    if(FList.Chat_disableIcons || channel.toLowerCase()=="frontpage") {message=message.replace(/\[icon\]/g, "[user]");message=message.replace(/\[\/icon\]/g, "[/user]");}
    var icons = message.match(/\[icon\]/g);
    if (icons != null && icons.length > 4) message = "[color=red]- Icon spam detected. Message filtered by the chat. -[/color]";
    var tabindex=FList.Chat_tabs.channelGetIndex(channel);
    if(tabindex!==-1){
        if (FList.Chat_autoparseURLs == true)
            message = message.replace(/(?:[^=\]]|^)((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g, "[url]$1[/url]");
        var ctype = "ChatTypeChat";
        if(message.substring(0,4).toLowerCase()=="/me ") {
            message = message.substring(4);
            ctype = "ChatTypeAction";
        } else if(message.substring(0,5).toLowerCase()=="/me's") {
            message = message.substring(5);
            ctype = "ChatTypeAction";
        } else if(message.substring(0,6)=="/warn ") {
            message = message.substring(6);
            if (FList.Chat_ischanop(identity, channel)) {
                ctype = "ChatTypeWarn";
            }
        }
        if(identity==FList.Chat_identity) FList.ChatParser._cutLongWords=false;
        if (FList.Chat_autoTranslate && FList.Chat_languages[FList.Chat_autoTranslate].channel != channel) {
            FList.Chat_translation.translate(FList.ChatParser.parseContent(message), 'en', FList.Chat_autoTranslate, function(result) {
                FList.FChat_printMessage(result.translation, ctype, identity,tabindex);
            });
        } else FList.FChat_printMessage(FList.ChatParser.parseContent(message), ctype, identity,tabindex);
        if (ctype == "ChatTypeWarn") {
            if (FList.Chat_detectHighlight(message, true)) {
                FList.Chat_tabs.flashTab(tabindex);
                FList.Chat_playSound("modalert");
            }
        }
        if(identity==FList.Chat_identity) FList.ChatParser._cutLongWords=true;

        if(FList.Chat_tabs.currentIndex!=tabindex && identity!==FList.Chat_identity){
            $("#ChatTab" + tabindex).addClass("ChatTalk");
        }
    }
};
FList.Chat_commands['LRP'] = function(params) {
    if(jQuery.inArray(params.character.toLowerCase(),FList.Chat_ignorelist)!==-1) return;
    var identity = params.character;
    var channel = params.channel;
    var message = params.message;
    //message=FList.Chat_truncateMessage(message, FList.Chat_truncateMaxChars);
    //if (message.substring(0,6) != "/warn ") return; HOW DID THIS GET HERE
    var icons = message.match(/\[icon/g);
    if (icons != null) {
        message=message.replace(/\[icon/g, "[user");
        message=message.replace(/\[\/icon/g, "[/user");
    }
    var tabindex=FList.Chat_tabs.channelGetIndex(channel);
    if(tabindex!==-1){
        if (FList.Chat_autoparseURLs == true) message = message.replace(/(?:[^=\]]|^)((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g, "[url]$1[/url]");
        var ctype = "ChatTypeAd";
        if(message.substring(0,6)=="/warn ") {
            message = message.substring(6);
            if (FList.Chat_ischanop(identity, channel)) {
                ctype = "ChatTypeWarn";
            }
        }
        if (FList.Chat_autoTranslate && FList.Chat_languages[FList.Chat_autoTranslate].channel != channel) {
            FList.Chat_translation.translate(FList.ChatParser.parseContent(message), 'en', FList.Chat_autoTranslate, function(result) {
                FList.FChat_printMessage(result.translation, ctype, identity,tabindex);
            });
        } else FList.FChat_printMessage(FList.ChatParser.parseContent(message), ctype, identity,tabindex);
        if (ctype == "ChatTypeWarn") {
            if (FList.Chat_detectHighlight(message, true)) {
                FList.Chat_tabs.flashTab(tabindex);
                FList.Chat_playSound("modalert");
            }
        }
        if(FList.Chat_tabs.currentIndex!=tabindex && identity!==FList.Chat_identity && FList.Chat_filtermode!=="hideads"){
            $("#ChatTab" + tabindex).addClass("ChatTalk");
        }
    }
};
FList.Chat_commands['RLL'] = function(params) {
    var channel = params.channel;
    var identity = params.character;
    var message = params.message;
    var tabindex=FList.Chat_tabs.channelGetIndex(channel);
    if(tabindex!==-1){
        FList.FChat_printMessage(FList.ChatParser.parseContent(message), "ChatTypeInfo", identity, tabindex);
    }
};
FList.Chat_commands['LOG'] = function(params) {

    var type = params.type;
    if(params.action=="count"){
        if(FList.Chat_logs.currentUser.toLowerCase()==params.id){
            FList.Chat_logs.logCount=params.count;
        }
    } else if(params.action=="remove"){
        var panelstring="<div style='height:310px;margin:0px -12px 10px -12px;overflow:auto;'>";
        $(".ChatlogEntry").each(function(i, el){
            var key=$(el).text();
            if(key==params.key) {
                var id=this.id;
                id=id.substring(12);
                $(this).remove();
                $(".del" + id).remove();
            }
            if(params.key==FList.Chat_logs.currentUser.toLowerCase()){
                $("#LogItemList").html("Select a name from the left.");
            }
        });
    } else if(params.action=="list"){
        var panelstring="<div style='margin:-3px -12px -30px -12px;'><table id='LogTable'><tr><td style='width:200px;'><div id='LogEntryList'>";
        params.list.sort();
        $.each(params.list, function(i, name){
            panelstring=panelstring+"<a class='del del"+i+"' onclick=\"FList.Chat_logs.deleteLog('" + name + "');\"></a><a href='#' onclick=\"FList.Chat_logs.getUser('" + name + "');\"><div id='ChatlogEntry"+i+"' class='ChatlogEntry list-highlight'><img src='" + staticdomain + "images/avatar/" + name.toLowerCase() +  ".png'/>" + name + "</div></a>";
        });
        FList.Chat_history.html(panelstring + "</div></td><td class='logs'><div id='LogItemList'>Select a name from the left.</div></td></tr></table></div>");
        FList.Chat_logs.resize();
    } else if (params.action=="last"){

        var logs = params.logs;
        var tabindex=-1;
        if(type=="channel"){
            tabindex=FList.Chat_tabs.channelGetIndex(params.id);
        } else if(type=="user"){
            tabindex=FList.Chat_tabs.userGetIndex(params.id);
        }
        var date=0;
        if(tabindex!==-1 && logs.length>0){
            var logstring="";
            $.each(logs, function(i, log){
                log = jQuery.parseJSON(log);
                date = new Date(log.time*1000);
                var time=date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + " " + (date.getHours() > 11 ? "PM" : "AM");
                var loghtml="<span class='ChatMessage ChatTypeChat ChatTypeLog'><span class='ChatTimestamp'>[" + time + "]</span>" + log.character + ": " + log.text + "</span>";
                FList.Chat_tabs.list[tabindex].logs.unshift($(loghtml));
                if(tabindex==FList.Chat_tabs.currentIndex){
                    logstring=logstring+loghtml;
                }
            });
            var day = date.getDate() + " " + FList.Common_getmonth(date.getMonth()) + "," + date.getFullYear();
            FList.Chat_tabs.list[tabindex].logs.unshift($("<span class='ChatMessage ChatTypeChat ChatTypeLog'>Last log entry: " + day + "</span>"));
            if(tabindex==FList.Chat_tabs.currentIndex){
                $("#ChatArea .inner").prepend(logstring + "<span class='ChatMessage ChatTypeChat ChatTypeLog'>Last log entry: " + day + "</span>");
            }
        }
    } else if (params.action=="get"){
        if(FList.Chat_logs.currentUser.toLowerCase()==params.id){
            var logs = params.logs;
            var panelstring="<div id='LogItemList'><h2>Logs with " + FList.Chat_logs.currentUser + "</h2>";
            var day="";
            $.each(logs, function(i, log){
                log = jQuery.parseJSON(log);
                var date = new Date(log.time*1000);
                var lastday=day;
                day = date.getDate() + " " + FList.Common_getmonth(date.getMonth()) + "," + date.getFullYear();
                if(lastday!==day) panelstring=panelstring+"<b>" + day + "</b><br/>";
                var time=date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + " " + (date.getHours() > 11 ? "PM" : "AM");
                panelstring=panelstring+"<i>[" + time + "]</i> <b>" + log.character + "</b>: " + log.text + "<br/>";
            });

            var pages =  Math.floor(FList.Chat_logs.logCount / 100) + 1;
            var current =  pages-Math.abs(Math.floor(FList.Chat_logs.currentOffset / 100));
            $("#LogTable td.logs").html(panelstring + "</div><div id='logpager'><a href='#' class='first'>First</a> | <a href='#' class='prev'>Previous</a> | <span id='logpaging'>Page ... of ...</span> | <a href='#' class='next'>Next</a> | <a href='#' class='last'>Last</a></div>");
            if(current==pages){
                $("#logpager .next, #logpager .last").css("opacity","0.5");
            } else {
                $("#logpager .next").click(function(){
                    FList.Chat_logs.next();
                });
                $("#logpager .last").click(function(){
                    FList.Chat_logs.last();
                });
            }
            if(current==1){
                $("#logpager .first, #logpager .prev").css("opacity","0.5");
            } else {
                 $("#logpager .prev").click(function(){
                    FList.Chat_logs.previous();
                });
                 $("#logpager .first").click(function(){
                    FList.Chat_logs.first();
                });
            }
            $("#logpaging").html("page " + current + " of " + pages);
            FList.Chat_logs.resize();
        }
    }
};
FList.Chat_commands['IGN'] = function(params){
    var character=params.character;
    var action=params.action;
    if(action=="add"){
        FList.FChat_printMessage(character + " has been added to your ignore list.", "ChatTypeInfo", "",'all');
        FList.Chat_ignorelist.push(character.toLowerCase());
        FList.Chat_users.update();
    }
    if(action=="delete"){
        FList.FChat_printMessage(character + " has been removed from your ignore list.", "ChatTypeInfo", "",'all');
        character=character.toLowerCase();
        for(var i in FList.Chat_ignorelist){
            if(FList.Chat_ignorelist[i]==character) FList.Chat_ignorelist.splice(i,1);
        }
        FList.Chat_users.update();
    }
    if(action=="list"){
        var list = params.characters;
        FList.Chat_ignorelist=params.characters;
        if (list.length == 0) {
            FList.FChat_printMessage("You aren't ignoring anybody.", "ChatTypeInfo","",'all');
            return;
        }
        var liststring="Your ignorelist: ";
        for(var i in list){
            liststring+="[user]" + list[i] + "[/user], ";
        }
        liststring=liststring.substring(0,liststring.length-2);
        FList.FChat_printMessage(FList.ChatParser.parseContent(liststring), "ChatTypeInfo", "",'all');
    }
    if(action=="init"){
        FList.Chat_ignorelist=[];
        $.each(params.characters, function(i,chara){
            FList.Chat_ignorelist.push(chara.toLowerCase());
        });
        FList.Chat_users.update();
    }
};

FList.Chat_commands['VAR'] = function(params) {
    var name = params.variable;
    var value = params.value;
    if(name=="chat_max"){
        FList.Chat_msgMaxLength=value;
    }
    if(name=="priv_max"){
        FList.Chat_priMaxLength=value;
    }
};
FList.Chat_commands['PRI'] = function(params) {
    if(jQuery.inArray(params.character.toLowerCase(),FList.Chat_ignorelist)!==-1) {
        FList.Chat_send("IGN " + JSON.stringify({"action": "notify", "character": params.character}));
        return;
    }
    var source = params.character;
    var message = params.message;
    var icons = message.match(/\[icon\]/g);
    if (icons != null && icons.length > 4) message = "[color=red]- Icon spam detected. Message filtered by the chat. -[/color]";
    var destination = params.recipient;
    var printtab = FList.Chat_tabs.userGetIndex(source);
    if(printtab==-1){//chat with this person isn't open yet
        if(FList.Chat_openPrivateChat(source,false)!==-1) printtab=FList.Chat_tabs.list.length-1;
    } else {
        FList.Chat_tabs.list[printtab].closed=false;
        FList.Chat_tabs.update();
    }
    if (FList.Chat_autoparseURLs == true) message = message.replace(/(?:[^=\]]|^)((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g, "[url]$1[/url]");
    var ctype = "ChatTypeChat";
    if(message.substring(0,4)=="/me ") {
        message = message.substring(4);
        ctype = "ChatTypeAction";
    }
    if(message.substring(0,5)=="/me's") {
        message = message.substring(5);
        ctype = "ChatTypeAction";
    }
    if(FList.Chat_disableIcons) {message=message.replace(/\[icon\]/g, "[user]");message=message.replace(/\[\/icon\]/g, "[/user]");}
    if (FList.Chat_autoTranslate) {
        FList.Chat_translation.translate(FList.ChatParser.parseContent(message), 'en', FList.Chat_autoTranslate, function(result) {
            FList.FChat_printMessage(result.translation, ctype, source, printtab);
        });
    } else FList.FChat_printMessage(FList.ChatParser.parseContent(message), ctype, source, printtab);
    FList.Chat_tabs.flashTab(printtab);
    if(FList.Chat_tabs.currentIndex!==printtab || !FList.Chat_isTabOpen){
        FList.Chat_notification.create(FList.ChatParser.parseContent(message), "Private chat from " + source, source, printtab);
    }

    // Lastly, if we got a message, they must have stopped typing.
    FList.Chat_tabs.list[printtab].status = "clear";
    $("#ChatTab" + printtab + " img.TypingIndicator").removeClass("ChatTabStatusTyping").removeClass("ChatTabStatusPaused");
    FList.Chat_typing.indicate();
};
FList.Chat_commands['TPN'] = function(params) {
    if(jQuery.inArray(params.character.toLowerCase(),FList.Chat_ignorelist)!==-1) return;
    printtab=FList.Chat_tabs.userGetIndex(params.character);
    if (printtab == -1) return;
    switch(params.status){
        case "clear":
            $("#ChatTab" + printtab + " img.TypingIndicator").removeClass("ChatTabStatusTyping").removeClass("ChatTabStatusPaused");
        break;
        case "paused":
            $("#ChatTab" + printtab + " img.TypingIndicator").removeClass("ChatTabStatusTyping").addClass("ChatTabStatusPaused");
        break;
        case "typing":
            $("#ChatTab" + printtab + " img.TypingIndicator").removeClass("ChatTabStatusPaused").addClass("ChatTabStatusTyping");
        break;
    }
    FList.Chat_tabs.list[printtab].status = params.status;
    FList.Chat_typing.indicate();
};
FList.Chat_commands['NLN'] = function(params) {
    FList.Chat_users.add(params.identity);
    FList.Common_iSort(FList.Chat_users.list);
    FList.Chat_users.setData(params.identity, params);
    if (params.identity == FList.Chat_identity) {
      if (FList.Chat_lastStatus) FList.Chat_send("STA " + JSON.stringify(FList.Chat_lastStatus));
        FList.Common_iSort(FList.Chat_users.list);
         //code formerly executed at NLN~ this command is more reliable.
        $("#ChatStatusLink").removeClass('StatusNone StatusOnline StatusLooking StatusIdle StatusAway StatusBusy StatusDND StatusCrown').addClass('Status' + params.status);
        document.title = "F-Chat (" + FList.Chat_identity + ")";
        FList.Chat_connectComplete = true;
        FList.Chat_ads.initAdCounter();
        FList.Chat_joinChannels();
        clearTimeout(FList.Chat_reconnectCancelTimeout);
        if (FList.Chat_reconnecting) {
            FList.Chat_reconnectPartialTimeout = setTimeout(function() {
                if (FList.Chat_reconnecting == false) return;
                FList.FChat_printMessage("Your connection was restored, but your joined hidden private rooms will not work until you get re-invited or re-create them.", "ChatTypeNotice","",'all');
                FList.Chat_reconnecting = false;
            }, 4000);
        }
    }
};
FList.Chat_commands['CDS'] = function(params) {
    var channel = params.channel;
    var description = params.description;
    FList.Chat_channels.updateDescription(channel, description);
};
FList.Chat_commands['RMO'] = function(params) {
    var channel = params.channel;
    channel=FList.Chat_channels.getInstance(channel);
    if(channel!=-1){
        channel.mode = params.mode;
        var tabindex=FList.Chat_tabs.channelGetIndex(channel.name);
        FList.FChat_printMessage("Room mode for room " + channel.title + " has been set to " + channel.mode + ".", "ChatTypeSystem","",tabindex);
        //FList.Chat_channels.updateDescription(channel, description);
            if(FList.Chat_tabs.currentType=="channel"){
                var chan=FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                if(chan==channel.name){//it applies to the active tab, triggering a visible change
                    if(channel.mode=="chat"){
                        $(".postadbutton").hide();
                        $("#noadnotice").show();
                    } else {
                        $(".postadbutton").show();
                        $("#noadnotice").hide();
                    }
                }
            }
        }
};
FList.Chat_commands['FLN'] = function(params) {
    var identity = params.character;
    if(identity!==FList.Chat_identity){
        FList.Chat_users.remove(identity);
        if (FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id == identity) FList.Chat_DisplayInfoBar(identity);
        // disconnect = typing no more.
        printtab = FList.Chat_tabs.userGetIndex(params.character);
        $("#ChatTab" + printtab + " img.TypingIndicator").removeClass("ChatTabStatusTyping").removeClass("ChatTabStatusPaused");
        if (printtab != -1) FList.Chat_tabs.list[printtab].status = "clear";
    } else {
        FList.Chat_ws.close();
        FList.Common_displayError("You were disconnected.");
    }
    $("#UserList " + ".user").each(function(i){
        if($(this).text()==params.character){
            $(this).remove();
            return false;
        }
    });
    delete FList.Chat_users.userdata[params.character];
    delete FList.Chat_users.links[params.character];
};
FList.Chat_commands['HLO'] = function(params) {//server welcome message
    if (FList.Chat_reconnecting) {
        // now is the time to clear the list because LIS is coming soon after this
        FList.Chat_users.clear();
        return;
    }
    var message = params.message;
    FList.FChat_printMessage(FList.ChatParser.parseContent(message +
                            "\n\nClick the 'channels' button up top to choose a channel, or try" +
                            " [channel]Sex Driven LFRP[/channel] or [channel]Non-Sex Driven LfRP[/channel]" +
                            " to advertise for RP partners, [channel]RP Bar[/channel], [channel]RP Dark City[/channel]" +
                            " or [channel]RP Nudist Camp[/channel] for general RP, or [channel]Frontpage[/channel]" +
                            " for general OOC chatter.\n\nTo log out and retrieve your logs when you're done, click" +
                            " the 'F-Chat(####)' button up top.\n\nFor more help, type /help for command info," +
                            " or join the [channel]Helpdesk[/channel] channel.\n\nRemember to follow the" +
                            " [url=https://wiki.f-list.net/index.php/Rules]site rules[/url]!"),
                            "ChatTypeInfo","", 0);
};
FList.Chat_commands['ADL'] = function(params) {
    var names = params.ops;
    for(var i in names){
        FList.Chat_users.addOpp(names[i]);
    }
};
FList.Chat_commands['CIU'] = function(params) {//Received when being invited to a room. This used to be with SYS.
    var sender = params.sender;
    var title = params.title;
    var name = params.name;
    var message = "[user]" + sender + "[/user] has invited you to join [session=" + title + "]" + name + "[/session].";
    var parsed = FList.ChatParser.parseContent(message);
    if (typeof(params.channel) == "string")
        var tabindex=FList.Chat_tabs.channelGetIndex(params.channel);
    else
        var tabindex = 'all';
    FList.FChat_printMessage(parsed, "ChatTypeInfo", "", tabindex);
};
FList.Chat_commands['SYS'] = function(params) {//Informational (displayed) message (never a human) often in response to a command you sent.
    var message = params.message;
    if (typeof(params.channel) == "string")
        var tabindex=FList.Chat_tabs.channelGetIndex(params.channel);
    else
        var tabindex = 'all';
    FList.FChat_printMessage(FList.ChatParser.parseContent(message), "ChatTypeInfo", "", tabindex);
};
FList.Chat_commands['BRO'] = function(params) {//Admin/Op/Server broadcast, or shutdown notification
    var message = params.message;
    if(FList.Chat_disableIcons) {message=message.replace(/\[icon\]/g, "[user]");message=message.replace(/\[\/icon\]/g, "[/user]");}
    FList.FChat_printMessage(FList.ChatParser.parseContent(message), "ChatTypeBroadcast","",'reallyall');
    FList.Chat_tabs.flashTab(FList.Chat_tabs.currentIndex);
};
FList.Chat_commands['KID'] = function(params) {//Kinks
    var type = params.type;
    var tab= 'all';//console
    if(type=="start" || type=="end"){
        var message = params.message;
        FList.FChat_printMessage(FList.ChatParser.parseContent(message), "ChatTypeInfo","",tab);
    }
    if(type=="custom"){
        var key = params.key;
        var value = params.value;
        FList.FChat_printMessage("<b>" + key + ":</b> " + value, "ChatTypeInfo","",tab);
    }
    if(tab==0) FList.Chat_tabs.flashTab(0);
};
FList.Chat_commands['PRD'] = function(params) {//Profile
    var type = params.type;
    var tab= 'all';//console
    if(type=="start" || type=="end") FList.FChat_printMessage(FList.ChatParser.parseContent(params.message), "ChatTypeInfo","",tab);
    if(type=="info" || type=="select") FList.FChat_printMessage("<b>" + params.key + ":</b> " + params.value, "ChatTypeInfo","",tab);
    if(tab==0) FList.Chat_tabs.flashTab(0);
};
FList.Chat_commands['LIS'] = function(params) {
    var users = params.characters;
    for(var i in users){
        FList.Chat_users.add(users[i][0], true);
        var data = {
            identity: users[i][0],
            gender: users[i][1],
            status: users[i][2],
            statusmsg: users[i][3]
        };
        FList.Chat_users.setData(users[i][0], data);
    }
};
FList.Chat_commands['CHA'] = function(params) {
    var channels = params.channels;
    var namestring="";
    channels = channels.sort(function(a,b) {if (a.name == b.name) return 0;return a.name > b.name ? 1 : -1;});
    $(channels).each(function(index, item) {
        var name = item.name;
        var users = item.characters;
        namestring = namestring + ", <a class='ChannelLink' onclick='FList.Chat_channels.requestJoin(\"" + escape(name) + "\", true)'>" + name + "</a>(" + users + ")";
    });
    $('#ChatChannelsList').html(namestring.substring(2).replace(/, (?!true)/g, "<br/>"));
    if (FList.Chat_requestList==true){
        FList.FChat_printMessage("List of channels: " + namestring.substring(2), "ChatTypeInfo","",'all');
        FList.Chat_requestList=false;
    }
};
FList.Chat_commands['ORS'] = function(params) {
    var channels = params.channels;
    var namestring="";
    channels = channels.sort(function(a,b) {if (a.characters == b.characters) return 0;return parseInt(a.characters) < parseInt(b.characters) ? 1 : -1;});
    FList.Chat_adhoc.updatePanel(channels);
    if (FList.Chat_requestList != true) return;
    FList.Chat_requestList = false;
    $(channels).each(function(index, item) {
        var name = item.name;
        var title = item.title;
        var users = item.characters;
        namestring = namestring + ", <a class='SessionLink' onclick='FList.Chat_channels.requestJoin(\"" + escape(name) + "\", true)'>" + title + "</a>(" + users + ")";
    });
    FList.FChat_printMessage("List of open private rooms.<br/><br/><b>NOTE THAT THESE ROOMS ARE UNMODERATED BY F-LIST STAFF.</b><br/><br/> " + namestring.substring(2), "ChatTypeInfo","",'all');
};
FList.Chat_commands["COL"] = function(params) { // chanop list: COL channel [identities]
    var channelname = params.channel;
    var chanops = params.oplist;
    var channel = FList.Chat_channels.getInstance(channelname);
    channel.chanops = chanops;
};
FList.Chat_commands["COA"] = function(params) {
    // if we're in a channel while that channel's chanop list is updated, refresh user list
    var channelname = params.channel;
    if (channelname == FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id) {
        FList.Chat_users.update();
    }
};
FList.Chat_commands["COR"] = FList.Chat_commands["COA"];
FList.Chat_commands['FRL'] = function(params){
    FList.Chat_users.tracklist=[];
    $.each(params.characters, function (i, character) {
        FList.Chat_users.addTrack(character);
    });
};
FList.Chat_commands['ICH'] = function(params) {
    var channel = params.channel;
    var users = params.users;
    var channel = FList.Chat_channels.getInstance(channel);
    if(channel !== -1){
        if (typeof(params.title) == "string") channel.title = params.title;
        if (params.mode !== undefined) channel.mode = params.mode;
        channel.userlist=[];
        for(var user in users) {
            FList.Chat_channels.addUser(channel.name, users[user].identity, false, true);
        }
        FList.Common_iSort(channel.userlist);
        if(params.channel.substr(0,3) == "ADH"){
            FList.Chat_tabs.list[FList.Chat_tabs.channelGetIndex(channel.name)].title=channel.title; //Edit the title for the tab
        }
        if(FList.Chat_tabs.channelGetIndex(channel.name)==FList.Chat_tabs.currentIndex) FList.Chat_users.update();
    }
};
FList.Chat_commands['FKS'] = function(params) {
    var names = params.characters;
    names.sort();
    var lookingstring = "";
    var namestring = "";
    for(var i in names) {
        var classes = "AvatarLink";
        if(jQuery.inArray(names[i],FList.Chat_users.ops)!==-1){
            classes = classes + " OpLink";
        }
        else if(jQuery.inArray(names[i],FList.Chat_users.tracklist)!=-1){
            classes = classes + " FriendLink";
        }
        if(names[i] in FList.Chat_users.userdata)
          classes += " Gender" + FList.Chat_users.userdata[names[i]].gender;

        var linkstring = "<a class='" + classes + "'>" + names[i] + "</a>";
        var ud = FList.Chat_users.getData(names[i]);
        if (ud.status == "Looking" && typeof(ud.statusmsg) == "string" && jQuery.trim(ud.statusmsg).length != 0)
          lookingstring += '<hr style="clear:left;"/><img style="float:left;margin:-1px 5px 3px;width:32px;height:32px;" src="' + staticdomain + 'images/avatar/' + names[i].toLowerCase() + '.png"/>' + linkstring + '<br/>' + FList.ChatParser.parseContent(ud.statusmsg);
        else
          namestring += ", " + linkstring;
    }
    if (lookingstring.length > 0) FList.FChat_printMessage("Characters looking to play right now: " + lookingstring, "ChatTypeInfo","",'all');
    if (namestring.length > 0) FList.FChat_printMessage("Online characters with this kink: " + namestring.substring(2), "ChatTypeInfo","",'all');
};
FList.Chat_commands['ERR'] = function(params) {
    var code = parseInt(params.number);
    var string = params.message;
    // disable reconnect, a ban is incoming
    // also disable for duplicate connects (code 31)
    if (code == 40 || code == 39 || code == 9 || code == 31) FList.Chat_forceclose = true;
    if(code==62 || code==14 || code==2 || code==3 || code==4 || code==9 || code==30 || code==31 || code==27 || code==39 || code==40) FList.Common_displayError(string);
    if(FList.Chat_identified==false){//not connected yet, so likely an error connecting.
        FList.Chat_ws.close();
    } else {
        FList.FChat_printMessage("Error code " + code + ", " + string, "ChatTypeError","",'all');
    }
};
FList.Chat_commands['CON'] = function(params) {
    $("#ChatOnlineCount").text("F-Chat (" + params.count + ")");
    FList.Chat_con=params.count;
};
FList.Chat_commands['STA'] = function(params) {//STA username status
    var user = params.character;
    var sta = FList.Chat_users.sanitizeStatus(params.status);
    var alert=true;
    FList.Chat_users.userdata[user].status = sta;
    if(FList.Chat_users.userdata[user].status=="Idle" || sta=="Idle") alert=false;//going from or to idle should not give an alert. no spamming users.
    FList.Chat_users.getLink(user).removeClass('StatusNone StatusOnline StatusIdle StatusAway StatusLooking StatusBusy StatusDND StatusCrown').addClass('Status' + sta);
    // update status link if this was my status
    if (user == FList.Chat_identity && sta!=="Idle") {
        $("#ChatStatusLink").removeClass('StatusNone StatusOnline StatusIdle StatusAway StatusLooking StatusBusy StatusDND StatusCrown').addClass('Status' + sta);
        $("#ChatStatusSelect option").removeAttr("selected");
        $("#ChatStatusSelect option[value=" + sta + "]").attr("selected", true);
    }
    // update status message
    if (typeof(params.statusmsg) == "string") {
        // no icons in status messages!
        params.statusmsg = params.statusmsg.replace(/\[icon\].*\[\/icon\]/g, "");
        FList.Chat_users.userdata[user].statusmsg = params.statusmsg;
        if (FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id == user) FList.Chat_DisplayInfoBar(user);
        if (user == FList.Chat_identity) {
            $("#ChatStatusMessage").val(params.statusmsg);
        }
    }
    if(jQuery.inArray(user,FList.Chat_users.tracklist)!=-1 && FList.Chat_statusAlerts && alert){
        if(params.statusmsg!="") FList.FChat_printMessage("<a class='AvatarLink'>" + user + "</a> is now " + sta + ". [" + FList.ChatParser.parseContent(params.statusmsg) + "]", "ChatTypeInfo","", "all");
        else FList.FChat_printMessage("<a class='AvatarLink'>" + user + "</a> is now " + sta + ".", "ChatTypeInfo","", "all");
    }

};
FList.Chat_commands['JCH'] = function(params) {//JCH channelname { identity: identity, gender: gender }
    var channelname = params.channel;
    var user = params.character;
    var identity = user.identity;
    FList.Chat_users.setData(identity, user);
    // quick workaround for the 'user is offline' bug -- if the user joins a channel, they must be online!
    if (FList.Chat_users.getInstance(identity) == -1) {
        FList.Chat_users.add(identity, true);
        FList.Common_iSort(FList.Chat_users.list);
    }
    if(identity==FList.Chat_identity){//I joined o:
        //if(FList.Chat_logging && FList.Chat_channels.getIndex(channelname)==-1) FList.Chat_send("LOG " + JSON.stringify({ action: "last", type: "channel", id: channelname }));
        FList.Chat_channels.join(channelname, params.title);
        if (FList.Chat_reconnecting) {
            var idx = jQuery.inArray(channelname, FList.Chat_reconnectTabs);
            if (idx != -1) FList.Chat_reconnectTabs.splice(idx, 1);
            if (FList.Chat_reconnectTabs.length == 0) {
                // all previous tabs have been restored
                FList.FChat_printMessage("Chat connection restored.", "ChatTypeInfo","",'all');
                FList.Chat_reconnecting = false;
            }
        }
    } else {
        if(FList.Chat_channels.getIndex(channelname)!==-1) FList.Chat_channels.addUser(channelname, identity);
    }

};
FList.Chat_commands['LCH'] = function(params) {
    var channelname = params.channel;
    var identity = params.character;
    if(identity==FList.Chat_identity){
        FList.Chat_channels.leave(channelname);
    } else {
        if(FList.Chat_channels.getIndex(channelname)!==-1) FList.Chat_channels.removeUser(channelname, identity);
    }
};
FList.Chat_commands['UPT'] = function(params) {
    var message = "Server has been running since " + params.startstring + ", there are " + params.channels.toString() + " channels, " + params.users + " users, " + params.accepted + " accepted connections, " + params.maxusers + " users was the maximum number of users connected at some point since the last server restart.";
    FList.FChat_printMessage(message, "ChatTypeInfo","",'all');
};
FList.Chat_commands['IDN'] = function(params) {
    var name = params.character;
    FList.Chat_identity=name;
    FList.Chat_users.add(name);
    FList.Common_iSort(FList.Chat_users.list);
    FList.Chat_identified=true;
    window.onbeforeunload = function() {
        if(FList.Chat_identity!=0){
            return "Are you sure you want to leave the chat?";
        }
    };
    window.onmousemove = function() {
        FList.Chat_idletimer.reset();
    };
    clearInterval(FList.Chat_typing.interval);

    FList.Chat_typing.interval = setInterval(FList.Chat_typing.check, FList.Chat_typingInterval * 1000);
    FList.Chat_idletimer.init();

    // show toolbar info when user doesn't have preferences
   // if (!FList.Chat_reconnecting && FList.Common_getCookie("chat_preferences") == "") $("#ChatHeader").trigger("ctoolbarinfo");
};
FList.Chat_commands['PIN'] = function(params) {
    clearTimeout(FList.Chat_pingTimeout);
    FList.Chat_pingTimeout = setTimeout(function() {
        if(FList.Chat_ws!==0) {
            FList.Chat_ws.close();
        }
    }, 300000);
    FList.Chat_send("PIN");
};
FList.Chat_commands['AOP'] = function(params) {
    var name = params.character;
    FList.Chat_users.addOpp(name);
};
FList.Chat_commands['DOP'] = function(params) {
    var name = params.character;
    FList.Chat_users.removeOp(name);
};
FList.Chat_commands['OPP'] = function(params) {
    var stats = params.presence;
    if (FList.Chat_opStatsCommand == "noop")
        stats = jQuery.grep(stats, function(el, i) {
            return parseInt(el.cops) + parseInt(el.ops) == 0;
        });
    table = "<b>Channel (Users) - Total Chanops | Online Chanops  Online Globals | Ops Online</b><br/>";
    for (var c in stats) {
        var chan = stats[c];
        table += chan.name + " (" + chan.users + ") - " + chan.totalcops + " | " + chan.cops + " " + chan.ops + " | " + (parseInt(chan.cops) + parseInt(chan.ops)) + "<br/>";
    }
    FList.FChat_printMessage(table, "ChatTypeInfo","",'all');
};
FList.Chat_commands['SFC'] = function(params) {
    if (params.action == "report") {
        var message = 'MODERATOR ALERT. <a href="' + domain + 'c/' + params.character + '" target="_blank" class="AvatarLink">' + params.character + '</a> writes:<hr/>' + params.report + '<hr/>Things you can do: ';
        message += '<a href="javascript:FList.Chat_staffCall.confirmAlert(\'' + params.callid + '\')">Confirm Alert</a>';
        if (typeof(params.logid) == "number") message += ', <a href="' + domain + 'fchat/getLog.php?log=' + params.logid + '" target="_blank">View Attached Log</a>';
        FList.FChat_printMessage(message, "ChatTypeNotice","",'reallyall');
        if (FList.Chat_connectComplete == true) {
            // only do the big flashy alerts if it's a live call, not an old one.
            FList.Chat_playSound("modalert");
        }
    } else if (params.action == "confirm") {
        message = 'ALERT CONFIRMED. <a href="' + domain + 'c/' + params.moderator + '" target="_blank" class="AvatarLink">' + params.moderator + '</a> is handling <a href="' + domain + 'c/' + params.character + '" target="_blank" class="AvatarLink">' + params.character + '</a>\'s report.';
        FList.FChat_printMessage(message, "ChatTypeNotice","",'reallyall');
    }
};
FList.Chat_commands['RTB'] = function(params) {
    // we've received a site notification via realtime bridge
    if (params.type == "note") {
        var message = "<b>New Note</b> from ";
        message += "<a class='AvatarLink'>" + params.sender + "</a>: " + params.subject;
        message += ' (<a href="/view_note.php?note_id=' + params.id + '" target="_blank">Open Note</a>)';
        if(!FList.Chat_isTabOpen){
            FList.Chat_notification.create(params.subject, "Note from " + params.sender, params.sender,0);
        }
        FList.FChat_printMessage(message, "ChatTypeMailNotify", "", "all");
        FList.Chat_playSound("newnote");
    }
    else if (params.type == "bugreport") {
        //FList.Chat_users.addTrack(params.name);
        var url=domain + "view_bugreport.php?id=" + params.id;
        FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> submitted a bugreport: "<a href="' + url + '" target="_blank">' + params.title + '</a>"', "ChatTypeInfo","",'all');
    }else if (params.type == "helpdeskticket") {
        //FList.Chat_users.addTrack(params.name);
        var url=domain + "view_ticket.php?id=" + params.id;
        FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> submitted a helpdesk ticket: "<a href="' + url + '" target="_blank">' + params.title + '</a>"', "ChatTypeInfo","",'all');

    }else if (params.type == "helpdeskreply") {
        //FList.Chat_users.addTrack(params.name);
        var url=domain + "view_ticket.php?id=" + params.id;
        FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> submitted a reply to a helpdesk ticket you are involved in, <a href="' + url + '" target="_blank">located here</a>.', "ChatTypeInfo","",'all');
    }else if (params.type == "featurerequest") {
        //FList.Chat_users.addTrack(params.name);
        var url=domain + "vote.php?fid=" + params.id;
        FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> submitted a feature request: "<a href="' + url + '" target="_blank">' + params.title + '</a>"', "ChatTypeInfo","",'all');
    } else if (params.type == "comment") {
        //FList.Chat_users.addTrack(params.name);
        var url = "";
    var targetName = params.target_type;
        switch(params.target_type){
            case "newspost":
                url = domain + "newspost/" + params.target_id + "/#Comment" + params.id;
        friendlyName = "news post";
            break;
            case "bugreport":
                url=domain + "view_bugreport.php?id=" + params.target_id + "#" + params.id;
        friendlyName = "bug report";
            break;
            case "changelog":
                url=domain + "log.php?id=" + params.target_id + "#" + params.id;
        friendlyName = "changelog post";
            break;
            case "feature":
                url=domain + "vote.php?fid=" + params.target_id + "#" + params.id;
        friendlyName = "feature request";
            break;
            default:
        }
        if(params.parent_id==0){
            FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> commented on your ' + targetName + ' "<a href="' + url + '" target="_blank">' + params.target + '</a>".', "ChatTypeInfo","",'all');
        } else {
            FList.FChat_printMessage('<a class="AvatarLink">' + params.name + '</a> replied to your comment on a ' + targetName + ' called "<a href="' + url + '" target="_blank">' + params.target + '</a>".', "ChatTypeInfo","",'all');
        }
    }else if (params.type == "grouprequest") {
        FList.FChat_printMessage("<a class='AvatarLink'>" + params.name + "</a> requested a group named \"<a href='" + domain + "panel/group_requests.php' target='_blank'>" + params.title + "</a>\".", "ChatTypeInfo","",'all');
    }else if (params.type == "trackadd") {
        FList.Chat_users.addTrack(params.name);
        if(!FList.Chat_isTabOpen){
            FList.Chat_notification.create(params.sender + " was added to your bookmarks.", "Friends info", params.sender,0);
        }
        FList.FChat_printMessage("Added <a class='AvatarLink'>" + params.name + "</a> to your track list.", "ChatTypeInfo","",'all');
    }
    else if (params.type == "trackrem") {
        FList.Chat_users.removeTrack(params.name);
        if(!FList.Chat_isTabOpen){
            FList.Chat_notification.create(params.sender + " was removed from your bookmarks.", "Friends info", params.sender,0);
        }
        FList.FChat_printMessage("Removed <a class='AvatarLink'>" + params.name + "</a> from your track list.", "ChatTypeInfo","",'all');
    }
    else if (params.type == "friendrequest") {
        FList.FChat_printMessage("<a class='AvatarLink' target='_blank' href='../messages.php'>" + params.name + "</a> requested to be your friend. ", "ChatTypeInfo","",'all');
    } else if (params.type == "friendadd") {
        FList.Chat_users.addTrack(params.name);
        FList.FChat_printMessage("<a class='AvatarLink'>" + params.name + "</a> was added to your friends list.", "ChatTypeInfo","",'all');
    } else if (params.type == "friendremove") {
        FList.Chat_users.removeTrack(params.name);
        //FList.FChat_printMessage("<a class='AvatarLink'>" + params.name + "</a> was removed from your friends list.", "ChatTypeInfo","",'all');
    }
};

FList.Chat_commands['CKU'] = function(params) {
    var character = params.character;
    var channel = params.channel;
    var operator = params.operator;
    var tabname = channel.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(channel).title : channel;
    if (character == FList.Chat_identity) {
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked you from the <b>" + tabname + "</b> channel."), "ChatTypeInfo", "", 'reallyall');
        FList.Chat_channels.leave(channel);
    } else {
        var tabindex=FList.Chat_tabs.channelGetIndex(params.channel);
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked [user]" + character + "[/user] from the channel."), "ChatTypeInfo", "", tabindex);
        if (FList.Chat_channels.getIndex(channel)!==-1) FList.Chat_channels.removeUser(channel, character);
    }
};
FList.Chat_commands['CTU'] = function(params) {
    var character = params.character;
    var channel = params.channel;
    var operator = params.operator;
    var minutes = params.length;
    var tabname = channel.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(channel).title : channel;
    if (character == FList.Chat_identity) {
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked and timed you out from the <b>" + tabname + "</b> channel for " + minutes + " minute(s)."), "ChatTypeInfo", "", 'reallyall');
        FList.Chat_channels.leave(channel);
    } else {
        var tabindex=FList.Chat_tabs.channelGetIndex(params.channel);
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked and timed out [user]" + character + "[/user] from the channel for " + minutes + " minute(s)."), "ChatTypeInfo", "", tabindex);
        if (FList.Chat_channels.getIndex(channel)!==-1) FList.Chat_channels.removeUser(channel, character);
    }
};
FList.Chat_commands['CBU'] = function(params) {
    var character = params.character;
    var channel = params.channel;
    var operator = params.operator;
    var tabname = channel.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(channel).title : channel;
    if (character == FList.Chat_identity) {
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked and banned you from the <b>" + tabname + "</b> channel."), "ChatTypeInfo", "", 'reallyall');
        FList.Chat_channels.leave(channel);
    } else {
        var tabindex=FList.Chat_tabs.channelGetIndex(params.channel);
        FList.FChat_printMessage(FList.ChatParser.parseContent("[user]" + operator + "[/user] has kicked and banned [user]" + character + "[/user] from the channel."), "ChatTypeInfo", "", tabindex);
        if (FList.Chat_channels.getIndex(channel)!==-1) FList.Chat_channels.removeUser(channel, character);
    }
};
FList.Chat_commands['COA'] = function(params) {
};
FList.Chat_commands['COR'] = function(params) {
};
FList.Chat_commands['ACB'] = function(params) {
};
FList.Chat_commands['IPB'] = function(params) {
};
FList.Chat_commands['TMO'] = function(params) {
};
// END CHAT COMMANDS

FList.Chat_parseCommand = function(line){
    line = line.replace(/</g, "&lt;");
    line = line.replace(/>/g, "&gt;");
    if(jQuery.trim(line)==""){
        return;
    }
    if(WEB_SOCKET_DEBUG){
        FList.FChat_printMessage("&lt;&lt;" + line, "ChatTypeConsole", "", 0);
    }
    var type = line.substr(0,3);
    var params = line.length > 4 ? JSON.parse(line.substr(4)) : {};
    if (typeof(FList.Chat_commands[type]) == "function") FList.Chat_commands[type](params);

};

FList.Chat_playSound = function(soundname){
    if(audiosupport!="none" && !FList.Chat_muteSound) {
        FList.Chat_sounds[soundname].play();
    }
};


function getlogdlpanel(){
var panelstring="";
panelstring+="<p>Click on the tabs below to generate a download link.</p>";
panelstring+="<p id='logdlchooser'>";

                            for (var i = 1; i < FList.Chat_tabs.list.length; i++) {
                var tab = FList.Chat_tabs.list[i];
                var tabname = tab.id.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(tab.id).title : tab.id;
                if (tabname == undefined) tabname = "Private Room (closed)";
                var linkClass = "";
                if (tab.type == "channel") linkClass = "ChannelLink";
                if (tab.type == "person") linkClass = "CharacterLink ImageLink";
                if (tab.id.substr(0,3) == "ADH") linkClass = "SessionLink";
                panelstring+='<a class="' + linkClass + '" href="javascript:void(0);" onclick="$(\'#LogLinkBox\').html(FList.Chat_tabs.openLog(' + i + '));$(\'#LogLinkBox\').effect(\'highlight\');">' + tabname + '</a>';
                panelstring+="<br />";
                }
                panelstring+="</p>";
                var ziplink = FList.Chat_tabs.getZippedLogs();
                panelstring+="<br />";
                panelstring+=ziplink;
                panelstring+="<br />";
                panelstring+='<br/><div id="LogLinkBox" style="width:400px;height:50px;overflow:hidden;">Your download link will appear here.</div>';
                return panelstring;
}

FList.Chat_initLoginBox = function(){
    document.title = "F-Chat";
    clearInterval(FList.Chat_typing.interval);
    if($("#MessageBox").val()!="") FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].textfield=$("#MessageBox").val();
    var audiotest=document.createElement('audio');
    FList.Chat_tabs.hide();
    $("#MessageBox, #IdentityBox, #GroupBox").fadeOut("fast");
    FList.Chat_identity=0;
    FList.Chat_identified=false;
    FList.Chat_users.clear();
    FList.Chat_users.hide();
    FList.Chat_ws=0;
    if(typeof(Audio) == "function" && audiotest.canPlayType){
        audiosupport="wav";
        if(("no" != audiotest.canPlayType("audio/mpeg")) && ("" != audiotest.canPlayType("audio/mpeg"))) audiosupport="mp3";
        if(audiosupport!="mp3" && ("no" != audiotest.canPlayType("audio/ogg")) && ("" != audiotest.canPlayType("audio/ogg"))) audiosupport="ogg";
        FList.Chat_sounds['login'] = new Audio(staticdomain + 'sound/login.' + audiosupport);
        FList.Chat_sounds['attention'] = new Audio(staticdomain + 'sound/attention.' + audiosupport);
        FList.Chat_sounds['chat'] = new Audio(staticdomain + 'sound/chat.' + audiosupport);
        FList.Chat_sounds['system'] = new Audio(staticdomain + 'sound/system.' + audiosupport);
        FList.Chat_sounds['modalert'] = new Audio(staticdomain + 'sound/modalert.' + audiosupport);
        FList.Chat_sounds['newnote'] = new Audio(staticdomain + 'sound/newnote.' + audiosupport);
        FList.Chat_sounds['logout'] = new Audio(staticdomain + 'sound/logout.' + audiosupport);
    }
    $("#ChatUsersLink, #ChatLogLink, #ChatAdhocLink, #ChatStatusLink, #ChatSearchLink, #ChatHelpLink, #ChatChannelsLink, #ChatSettingsLink").fadeOut("fast");
    FList.Chat_paraBar.hide();
    $("#CharBox").fadeOut("fast");
    $("#chatmenu li.inchat").fadeOut("fast");
    $("#ChatArea").fadeOut("fast", function(){
        $("#ChatArea").fadeIn("fast", function(){FList.Chat_updateHeight();});
        $("#ChatArea").empty();
        $("#ChatArea").append('<div class="pchatlogin"><p><input type="button" value="Enter Chat" id="ChatSignIn"/><span class="pformlabel">Log In As:</span><select id="ChatCharacter" class="select"></select></p></div>');
        $("#ChatCharacter").empty().html($("#CharacterData").html());
        $(".pchatlogin").append('<a id="ChatTrouble" class="link" href="https://wiki.f-list.net/Frequently_Asked_Questions#Why_can.27t_I_connect_to_the_chat.3F">Problems connecting?</a>');
        $(".pchatlogin").append('<br/><a id="ChatStats" class="link" target="_new" href="http://chat.f-list.net:9002/stats/">Chat Statistics</a>');
        if(FList.Rights.has("developer")){
            $(".pchatlogin").append('<br/><br/><input type="checkbox" class="Checkbox" id="ChatDebugmode"/><label for="ChatDebugmode">Enable raw network output.</label>');
        }
        if (FList.Chat_tabs.list.length > 1 && FList.Chat_truncateLogs != true) {


                            $("#logdownloads").qtip("destroy");
                $("<div id='logdownloads'><div>").qtip({content: {text: getlogdlpanel(), title: {text: 'You have chatlogs ready to save.', button: true}}, style: {classes: 'ui-tooltip-shadow ui-tooltip-rounded chatdialog', widget: true}, position: {
         my: 'center', // ...at the center of the viewport
         at: 'center',
         target: $(window)
      }, hide: {
            event: false
        },show: {ready: true, modal: true}});

        }
        $("#ChatSignIn").click(function(){
            if($("#ChatDebugmode:checked").length>0){
                WEB_SOCKET_DEBUG=true;
            } else {
                WEB_SOCKET_DEBUG=false;
            }
            //if($("#ChatLoggingmode:checked").length>0 || window.location.href.indexOf("logging") != -1){
            //    FList.Chat_logging=true;
            //} else {
            //    FList.Chat_logging=false;
            //}
            FList.Chat_contextMenu.init();
            if(typeof(WebSocket)=="undefined" && typeof(MozWebSocket)=="undefined"){
                if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
                    FList.Common_displayError("Please <a href='http://get.adobe.com/flashplayer'>Install Flash Player 10+</a>, or Disable Ad blocker to use F-Chat.");
                    return;
                }
            }
            $("#ChatSignIn").attr("disabled","disabled");
            $("#ChatSignIn").val("Connecting...");
            FList.Chat_prefs.loadPrefs();
            var faccount=$("#ChatAccount").val();
            $.ajax({
                type: "GET",
                url: domain + "json/getApiTicket.php",
                dataType: "json",
                timeout: timeoutsec * 1000,
                data: {},
                success: function (data) {
                    if(data.error==""){
                        FList.Chat_connect(data.ticket, faccount, $("#ChatCharacter").val());
                    } else {
                        FList.Common_displayError(data.error);
                    }
                },
                error: function (objAJAXRequest, strError, errorThrown) {
          FList.Common_displayError("Failed to get an API ticket. There may be a problem with your internet connection or F-List.");
          console.log("Error while trying to get API ticket while connecting: " + strError + ", " + errorThrown);
                }
            });
        });
    });
};


FList.Chat_openPrivateChat = function(user, manually){
    var user=FList.Chat_users.getInstance(user);
    if(user==-1){
        FList.Common_displayError("Unable to open private chat, no such user is online.");
        return -1;
    }
    if(FList.Chat_identity==user){
        FList.Common_displayError("You cannot open private chat with yourself.");
        return -1;
    }
    var already_open = FList.Chat_tabs.userGetIndex(user);

    if (already_open == -1) {
        // tab doesn't exist
        FList.Chat_tabs.addTab("person",user,"");
        //if(FList.Chat_logging) FList.Chat_send("LOG " + JSON.stringify({ action: "last", type: "user", id: user }));
    } else if (FList.Chat_tabs.list[already_open].closed != false) {
        // exists but is closed, re-open
        FList.Chat_tabs.list[already_open].closed = false;
        FList.Chat_tabs.update();
    }
    if(manually==true){
        var already_open = FList.Chat_tabs.userGetIndex(user);
        // switch to it if manually opened
        FList.Chat_tabs.switchTab(already_open);
    }
};

FList.Chat_detectHighlight = function(message, override) {
    if (!FList.Chat_highlightName && override != true) return false;
    var nameexp = new RegExp("\\b" + FList.Chat_identity + "['s]*\\b", "i");
    if(nameexp.test(message) == true) return true;
    if (typeof(FList.Chat_highlightWords) != "string" || FList.Chat_highlightWords.length == 0) return false;
    var words = FList.Chat_highlightWords.split(",");
    for (var word in words) {
        var searchexp = new RegExp("\\b" + words[word].trim() + "\\b", "i");
        if (searchexp.test(message) == true) return true;
    }
    return false;
};

FList.Chat_staffCall = new function StaffCall() {
    this.panel = null;
    this.isStaffOnline = function() {
        for (var o in FList.Chat_users.ops) {
            if (jQuery.inArray(FList.Chat_users.ops[o],FList.Chat_users.list) != -1) return true;
        }
        return false;
    };
    this.getPanel = function(reportUser) {
        var panel = "<b>Before you alert the moderators, PLEASE READ:</b><br/>If you're just having personal trouble with someone, right-click their name and ignore them. Moderators enforce the rules of the chat. If what you're reporting is not a violation of the rules, NOBODY WILL DO A THING.<br/><br/>";
        panel += "<b>What's your problem? Be brief.</b><br/><textarea id='ChatGetAModText'></textarea><br/>";
        if (reportUser != "") panel += "<input type='textbox' id='ChatGetAModReportUser' value='" + reportUser + "' /> Reported User<br/>";
        if (FList.Chat_truncateLogs == false) panel += "<input type='checkbox' id='ChatGetAModAttachLog' checked /> Automatically attach a log of this channel<br/>";
        if (FList.Chat_staffCall.isStaffOnline() == false) panel += "<br/><b style='color: red;'>Currently no staff is available. Your report will be queued and delivered when a moderator comes online.</b>";
        return panel;
    };
    this.showPanel = function(reportUser) {
        currentreportuser=reportUser;
        FList.Chat_alertdialog.dialog("open");
        FList.Chat_alertdialog.html(FList.Chat_staffCall.getPanel(currentreportuser));
    };
    this.hidePanel = function() {
        if (this.panel == null) return;
        this.panel.remove();
        this.panel = null;
    };
    this.sendAlert = function(alerttext, logid) {
        var call = {};
        call.action = "report";
        call.character = FList.Chat_identity;
        call.report = alerttext;
        if (typeof(logid) == "number") call.logid = logid;
        FList.Chat_send("SFC " + JSON.stringify(call));
    };
    this.confirmAlert = function(callid) {
        var call = {};
        call.action = "confirm";
        call.moderator = FList.Chat_identity;
        call.callid = callid;
        FList.Chat_send("SFC " + JSON.stringify(call));
    };
    this.panelSubmit = function() {
        var tabid = FList.Chat_tabs.currentIndex;
        var tabname = FList.Chat_tabs.list[tabid].id.substr(0,3) == "ADH" ? FList.Chat_channels.getInstance(FList.Chat_tabs.list[tabid].id).title : FList.Chat_tabs.list[tabid].id;

        var report = "Current Tab/Channel: " + tabname + " | Reporting User: " + $("#ChatGetAModReportUser").val() + " | " + $("#ChatGetAModText").val();
        var character = FList.Chat_identity;
        if ($("#ChatGetAModAttachLog").prop("checked") == true) {
            var log = FList.Chat_tabs.openLog(undefined, true);
            FList.FChat_printMessage("Hang on, the chat is uploading your chat log...", "ChatTypeInfo","",'all');
            jQuery.post("https://" + window.location.host + "/fchat/submitLog.php", {character: character, log: log, reportText: $("#ChatGetAModText").val(), reportUser: $("#ChatGetAModReportUser").val(), channel: tabname }, function(data) {
                if (typeof(data.log_id) != "string" || parseInt(data.log_id) == 0) {
                    FList.FChat_printMessage("Error uploading your chat log. Mod alert aborted.", "ChatTypeError","",'all');
                    return;
                }
                FList.Chat_staffCall.sendAlert(report, parseInt(data.log_id));
            }, "json");
        } else FList.Chat_staffCall.sendAlert(report);
        FList.Chat_staffCall.hidePanel();
    };
};

FList.Chat_contextMenu = {

    currentUser : null,

    init: function(){
        if($("#CharacterMenu").length>0) return;
        $("<ul/>").attr("id","CharacterMenu").addClass("contextMenu").appendTo(document.body);
        $("#CharacterMenu").append('<li class="header"></li>');
        $("#CharacterMenu").append('<li class="ministatus"><img/><span/><div style="clear:left;"/></li>');
        $("#CharacterMenu").append('<li class="priv"><a href="#priv">Private Message</a></li>');
        $("#CharacterMenu").append('<li class="flist"><a href="#flist">Profile Page</a></li>');
        $("#CharacterMenu").append('<li class="kinks"><a href="#kinks">Print Kinks</a></li>');
        $("#CharacterMenu").append('<li class="profile"><a href="#profile">Quick Profile</a></li>');
        if(FList.Chat_logging){$("#CharacterMenu").append('<li class="logs"><a href="#logs">Chatlogs</a></li>');}
        $("#CharacterMenu").append('<li class="ignore"><a href="#ignore">Ignore</a></li>');
        $("#CharacterMenu").append('<li class="unignore"><a href="#unignore">Unignore</a></li>');
        $("#CharacterMenu").append('<li class="report"><a href="#report">Report</a></li>');
        $("#CharacterMenu").append('<li class="ckick"><a href="#ckick">Channel Kick</a></li>');
        $("#CharacterMenu").append('<li class="cban"><a href="#cban">Channel Ban</a></li>');
        $("#CharacterMenu").append('<li class="cop"><a href="#cop">Make Channel Op</a></li>');
        $("#CharacterMenu").append('<li class="cdeop"><a href="#cdeop">Remove Channel Op</a></li>');
        $("#CharacterMenu").append('<li class="kick"><a href="#kick">Chat Kick</a></li>');
        $("#CharacterMenu").append('<li class="altwatch"><a href="#altwatch">Alt Watch</a></li>');
        $("#CharacterMenu").append('<li class="timeout"><a href="#timeout">Timeout (30m)</a></li>');
        $("#CharacterMenu").append('<li class="banip"><a href="#banip">Ban IP</a></li>');
        $("#CharacterMenu").append('<li class="banaccount"><a href="#banaccount">Ban Account</a></li>');
    }

};



FList.Chat_search = {
    init : false,
    getPanel : function(){
        var panelstring = '<div class="StyledForm"><br/>Search characters in the chat with a kink in "yes" or "fave". To appear in searches, you must be Online or Looking. If you are Looking and have a message set, you will appear with your icon and the message.<br/><p><span class="label">Kinks (required)</span><span class="element"><select id="ChatKinks" class="multiple" multiple="multiple" style="width:150px;">' + $("#KinkData").html() + '</select></span></p><p><span class="label">Genders</span><span class="element"><select id="ChatKinksGender" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_genders)
            panelstring = panelstring + '<option value="' + FList.Chat_genders[g] + '"> ' + FList.Chat_genders[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p><span class="label">Orientations</span><span class="element"><select id="ChatKinksOrientation" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_orientations)
            panelstring = panelstring + '<option value="' + FList.Chat_orientations[g] + '"> ' + FList.Chat_orientations[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p><span class="label">Languages</span><span class="element"><select id="ChatKinksLanguage" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_rlanguages)
            panelstring = panelstring + '<option value="' + FList.Chat_rlanguages[g] + '"> ' + FList.Chat_rlanguages[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p><span class="label">Furry pref:</span><span class="element"><select id="ChatKinksFurry" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_furryprefs)
            panelstring = panelstring + '<option value="' + FList.Chat_furryprefs[g] + '"> ' + FList.Chat_furryprefs[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p><span class="label">Position:</span><span class="element"><select id="ChatKinksPosition" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_positions)
            panelstring = panelstring + '<option value="' + FList.Chat_positions[g] + '"> ' + FList.Chat_positions[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p><span class="label">Sub/Dom:</span><span class="element"><select id="ChatKinksRole" class="multiple" multiple="multiple">';
        for (var g in FList.Chat_roles)
            panelstring = panelstring + '<option value="' + FList.Chat_roles[g] + '"> ' + FList.Chat_roles[g] + '</option>';
        panelstring += '<option value="None">Nothing set</option></select></span></p><p></p>';
        panelstring = panelstring + "</div>";
        return panelstring;
    },

    clear: function(){
          $("#ChatKinks option:selected, #ChatKinksGender option:selected, #ChatKinksOrientation option:selected, #ChatKinksLanguage option:selected, #ChatKinksFurry option:selected, #ChatKinksPosition option:selected, #ChatKinksRole option:selected").attr("selected", false);
          $( ".mcl-item").removeClass("selected");
          $( ".mcl-parent").val("0 choices selected.");
    },

    search : function(){
        var kinkname = $("#ChatKinks option:selected").text();
        var kinks = [];
        $('#ChatKinks option:selected').each(function() {
            kinks.push($(this).val());
        });
        var genders = [];
        $('#ChatKinksGender option:selected').each(function() {
            genders.push($(this).val());
        });
        var orientations = [];
        $('#ChatKinksOrientation option:selected').each(function() {
            orientations.push($(this).val());
        });
        var languages = [];
        $('#ChatKinksLanguage option:selected').each(function() {
            languages.push($(this).val());
        });
        var furryprefs = [];
        $('#ChatKinksFurry option:selected').each(function() {
            furryprefs.push($(this).val());
        });
        var positions = [];
        $('#ChatKinksPosition option:selected').each(function() {
            positions.push($(this).val());
        });
        var roles = [];
        $('#ChatKinksRole option:selected').each(function() {
            roles.push($(this).val());
        });
        var searchdata={};
        searchdata.kinks = kinks;
        if(genders.length>0) searchdata.genders=genders;
        if(orientations.length>0) searchdata.orientations=orientations;
        if(languages.length>0) searchdata.languages=languages;
        if(furryprefs.length>0) searchdata.furryprefs=furryprefs;
        if(positions.length>0) searchdata.positions=positions;
        if(roles.length>0) searchdata.roles=roles;
        FList.FChat_printMessage("Running a search for users who are online or looking for play with the kinks you selected in their fave/yes.", "ChatTypeInfo","",'all');
        FList.Chat_send("FKS " + JSON.stringify(searchdata));
        //$("#ChatSearchLink").qtip("hide");
    }

};


FList.Chat_adhoc = {
    getPanel : function(){
        var panel = "<span style='font-size:0.8em;font-weight:bold;'>PRIVATE ROOMS ARE NOT MODERATED BY F-LIST STAFF.</span><br/><br/><b>Make your own</b><br/><span style='font-size:0.8em;'>Your private rooms are invisible and invitation-only by default. Read <a href='" + domain + "doc/chat_faq.php' target='_blank'>the help</a>!</span><br/><br/>Room Name:<br/><input id='ChatAdhocRoomName' style='width:250px;' type='text' />";
        panel += '<br/><br/><b>Manage your room</b><br/><span style="font-size:0.8em"><b>/invite &lt;name&gt;</b> - invite &lt;name&gt; to join your room.<br/><b>/openroom</b> - Open your room to the public.<br/><b>/closeroom</b> - close it again.<br/><b>/kick &lt;name&gt;</b> - kicks someone out.</span>';
        return panel;
    },

    create : function(){
        var roomname = $("#ChatAdhocRoomName").val();
        $("#ChatAdhocRoomName").val("");
        FList.Chat_send("CCR " + JSON.stringify({channel: roomname}));
        //$("#ChatAdhocLink").qtip("hide");
    },

    updatePanel: function(rooms) {
        var div = $("#ChatAdhocOpenRoomList");
        div.empty();
        for (var r in rooms) {
            var room = rooms[r];
            div.append('<a class="SessionLink" onclick=\'FList.Chat_channels.requestJoin("' + escape(room.name) + '", true)\'>' + room.title + '</a> (' + room.characters + ')<br/>');
        }
    }

};

FList.Chat_status = {

    getPanel : function(){
        var panel = 'Your status:<br/><select id="ChatStatusSelect"><option value="Online">Online</option><option value="Looking">Looking for play</option><option value="Busy">Busy</option><option value="Away">Away</option><option value="DND">Do Not Disturb!</option></select><br/><br/>Status message:<br/><input id="ChatStatusMessage" style="width: 250px;" maxlength="256"/><br/><span style="font-size: 0.9em">A status message will show up when someone clicks or PMs you, and will make you show up extra big in searches if you\'re set Looking.</span>';
        return panel;
    },

    setValues : function(){
        $("#ChatStatusSelect option").removeAttr("selected");
        $("#ChatStatusSelect option[value=" + FList.Chat_users.userdata[FList.Chat_identity].status + "]").attr("selected", true);
        $("#ChatStatusMessage").val(FList.Chat_users.userdata[FList.Chat_identity].statusmsg);
    },

    update : function(){
        var status = "Online";
        var statusmsg = "";
        if($("#ChatStatusSelect").length>0){
            if($("#ChatStatusSelect").val()!==null){
                status = $("#ChatStatusSelect").val();
                statusmsg = $("#ChatStatusMessage").val().substr(0,256);
            }
        } else if(FList.Chat_lastStatus!==null){
                status = FList.Chat_lastStatus.status;
                statusmsg = FList.Chat_lastStatus.statusmsg;
            } else {
        }
        FList.Chat_lastStatus = {status: status, statusmsg: statusmsg};
        FList.Chat_send("STA " + JSON.stringify(FList.Chat_lastStatus));
    }

};


FList.Chat_init = function(fullscreen){
    if(domain.indexOf("dev")!==-1) {
        if (window.location.href.indexOf("useRelay") != -1) FList.Chat_host="ws://relay1.f-list.net:9722";
    }
    FList.ChatParser = new FList.BBParser();
    FList.ChatParser.replaceLongWordsWith("<span class=\"redfont\">- Word stretching detected. Message filtered by the chat. -</span>");
    FList.Chat_tabs.init();
    FList.Chat_users.init();
    FList.Chat_channels.init();

    FList.ChatParser.addCustomTag("user", false, function(content) {
    var cregex = /^[a-zA-Z0-9_\-\s]+$/;
    if(cregex.test(content))
        return '<a href="' + domain + 'c/' + content + '" target="_blank" class="AvatarLink">' + content + '</a>';
    else return content;
    });
    FList.ChatParser.addCustomTag("icon", false, function(content) {
    var cregex = /^[a-zA-Z0-9_\-\s]+$/;
    if(cregex.test(content))
        return '<a href="' + domain + 'c/' + content + '" target="_blank"><img src="' + staticdomain + 'images/avatar/' + content.toLowerCase() + '.png" style="width:50px;height:50px;" class="ParsedAvatar" align="top" /></a>';
    else return content;
    });

    FList.ChatParser.addCustomTag("channel", false, function(content) {
    var cregex = /^[a-zA-Z0-9\/_\-\s']+$/;
    if(cregex.test(content))
        return '<a class="ChannelLink" onclick=\'FList.Chat_channels.requestJoin("' + escape(content) + '", true)\'>' + content + '</a>';
    else return content;
    });

    FList.ChatParser.addCustomTag("session", false, function(content, title) {
    var cregex = /^[a-zA-Z0-9\/_\-\s']+$/;
    if(cregex.test(content))
        return '<a class="SessionLink" onclick=\'FList.Chat_channels.requestJoin("' + escape(content) + '", true)\'>' + title + '</a>';
    else return content;
    });

    // Finally, replace the color tag with FList's more restrictive version.
    // This even uses an attribute (the color)!
    FList.ChatParser.addCustomTag("color", true, function(content, attribute) {
        var cregex = /^(red|blue|white|yellow|pink|gray|green|orange|purple|black|brown|cyan)$/;
        if (cregex.test(attribute))
            return '<span class="' + attribute + 'font">' + content + '</span>';
        else return content;
    });

    FList.Chat_initLoginBox();

    $("#ChatLogoutLink").click(function(){
        window.onbeforeunload = function(){};
        FList.Chat_forceclose = true;
            FList.Chat_ws.close();
        });
    $(window).bind("unload", function() {
        if(FList.Chat_ws) {
            FList.Chat_forceclose = true;
            FList.Chat_ws.close();
        }
    });
};


FList.Chat_ischanop = function(user, channel) {
    if (FList.Chat_tabs.currentType != "channel" && user == undefined && channel == undefined) return false;
    if (user == undefined) user = FList.Chat_identity;
    if (channel == undefined) channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
    if (jQuery.inArray(user,FList.Chat_users.ops) != -1) return true;
    var chanops = FList.Chat_channels.getInstance(channel).chanops;
    if(chanops==undefined) return false;
    return (jQuery.inArray(user,chanops) != -1);
};

FList.Chat_ischanowner = function(user, channel) {
    if (FList.Chat_tabs.currentType != "channel" && user == undefined && channel == undefined) return false;
    if (user == undefined) user = FList.Chat_identity;
    if (channel == undefined) channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
    if (jQuery.inArray(user,FList.Chat_users.ops) != -1) return true;
    var chanops = FList.Chat_channels.getInstance(channel).chanops;
    if(chanops==undefined) return false;
    return user == chanops[0];
};

FList.Chat_displayHelp = function(){
    FList.FChat_printMessage("<b>Commands:</b><br/>/help<br/>/me &lt;message&gt;<br/>/clear<br/>/channels<br/>/join &lt;channel&gt;<br/>/users<br/><br/>/who<br/>/priv &lt;character&gt;<br/>/ignore &lt;character&gt;<br/>/unignore &lt;character&gt;<br/>/ignorelist<br/>/code<br/>/logout<br/>/profile &lt;character&gt;<br/>/soundon<br/>/soundoff<br/>/kinks &lt;character&gt;<br/>", "ChatTypeInfo","",'all');
    FList.FChat_printMessage("You can set your status light with /status &lt;Online|Looking|Busy|DND&gt; and an optional message.<br/>", "ChatTypeInfo","",'all');
    FList.FChat_printMessage("F-Chat also supports a subset of bbcode, and our :smiley: codes. Use TAB to autocomplete names. Supported tags are:", "ChatTypeInfo","",'all');
    FList.FChat_printMessage("[b]bold[/b], [i]italic[/i], [u]underline[/u], [s]strike[/s], [color=color]red|[/color], [user]name[/user], [icon]name[/icon], [channel]name[/channel], [url=address]title[/url]", "ChatTypeInfo","",'all');
    FList.FChat_printMessage("To make your own private room and give it a name, type /makeroom [name]. You can then invite other people into it with /invite [person]. (You don't need to type the []).", "ChatTypeInfo","",'all');
    if(FList.Chat_ischanop() == true){
        FList.FChat_printMessage("Chan-Op commands: /warn, /kick, /ban, /unban, /invite, /banlist, /coplist, /setdescription, /getdescription, /setmode <chat|ads|both>, /ctimeout", "ChatTypeInfo","",'all');
    }
    if(FList.Chat_ischanowner() == true){
        FList.FChat_printMessage("Chan Owner commands: /cop, /cdeop", "ChatTypeInfo","",'all');
    }
    if(FList.Rights.has("chat-chatop")){
        FList.FChat_printMessage("Global Op commands: /gkick, /timeout, /ipban, /accountban, /gunban, /createchannel, /killchannel", "ChatTypeInfo","",'all');
    }
    if(FList.Rights.has("admin")){
        FList.FChat_printMessage("Admin commands: /op, /deop, /broadcast.", "ChatTypeInfo","",'all');
    }
    if(FList.Rights.has("developer")){
        FList.FChat_printMessage("Developer commands: /debugop, /debugopoff, /forceop.", "ChatTypeInfo","",'all');
    }
};


FList.Chat_initChatbox = function(){
    $("#ChatArea").hide();
    if(FList.Chat_disableUserlist){
        $("#UserList").hide().css("width","0px");
    } else {
        $("#UserList").show().css("width","140px");
    }
    $("#ChatHelpLink, #ChatAdhocLink, #ChatStatusLink, #ChatLogLink").show();
    //start with console by default.
    $("#chatmenu li.inchat").show("fast");
    if(!FList.Chat_logging) $("#mnuchatlogs").stop().hide();
    $("#ChatArea").html('<div class="inner"/><div id="ChatTypingIndicator"></div><div id="msgfieldarea"><span id="noadnotice">This channel does not allow roleplay ads.</span><input class="postadbutton" type="button" onclick="FList.Chat_looking.sendAd();" value="Post as RP ad"/><select class="filterbox" onchange="FList.Chat_looking.setFilter();"><option value="showall">Show all messages</option><option value="hidechats">Hide chats</option><option value="hideads">Hide ads</option></select><input type="button" id="bingtoggle" onclick="FList.Chat_tabs.toggleBingCurrent();" value="No Bing"/><a id="recentads">0</a><div id="msg-wrapper"><textarea></textarea></div></div>');
    $("#ChatArea div.inner").css("font-size", FList.Chat_fontSize + "px");
    $("#ChatBox textarea").attr("id", "MessageBox");
    FList.Chat_tabs.show();
    FList.Chat_tabs.switchTab(0);
    $("#MessageBox").val(FList.Chat_tabs.list[0].textfield);
   $( "#msgfieldarea" ).resizable({
            handles: "n", maxHeight: 300, minHeight: 50, resize: function(){FList.Chat_updateHeight();}
    });
    $("#MessageBox").bind("keydown", function(e){
        $(".autocompletelink").each(function(i, el){
            var text=$(this).text();
            $(this).replaceWith(text);
        });
        if(e.which==9 && !e.ctrlKey){
            e.preventDefault();
            var matches=FList.Chat_autoCompleteName(true);
            var matches2=FList.Chat_autoCompleteName(false);
            if(matches==-1 && matches2==-1) {
                FList.Common_displayError("Too short to autocomplete.");
            } else {
                if(matches==-1) matches=[];
                if(matches2==-1) matches2=[];
                var names=[];
                $.each(matches, function(key,match){
                    names.push(match["name"]);
                });
                $.each(matches2, function(key,match){
                    if(jQuery.inArray(match["name"],names)==-1)
                        matches.push(match);
                });
                //TODO: click and autocomplete, handle one result case
                if(matches.length>1){
                    var matchstring="";
                    for(var i in matches){
                        matchstring=matchstring+"<a href='#' class='autocompletelink' onclick=\"completeName(" + matches[i]["start"] + ", '"+matches[i]["name"] + "', '"+ $("#MessageBox").val() + "');\">"+matches[i]["name"] + "</a>, ";
                    }
                    matchstring=matchstring.substring(0,matchstring.length-2);//remove comma lol
                    FList.FChat_printMessage("Several matches found: " + matchstring, "ChatTypeInfo","", FList.Chat_tabs.currentIndex);
                } else if(matches.length==1){
                    completeName(matches[0]["start"], matches[0]["name"], $("#MessageBox").val());
                } else {
                    FList.FChat_printMessage("No matches found.", "ChatTypeInfo","", FList.Chat_tabs.currentIndex);
                }
            }

            $("#MessageBox").focus();
        }
        if(e.which==38 && e.ctrlKey) FList.Chat_tabs.jump("up");
        if(e.which==40 && e.ctrlKey) FList.Chat_tabs.jump("down");

    });
    // Hook it up and show it!
    $("#ChatArea").fadeIn("fast", function(){FList.Chat_updateHeight();});
    $(window).unbind("resize").bind("resize", FList.Chat_updateHeight);

    $.each(["focus", "blur", "keyup"], function(i, v) {$("#MessageBox").bind(v, function() {FList.Chat_paraBar.update();});});
    $("#MessageBox").bind("keyup", function(e) {
        FList.Chat_typing.update();
        FList.Chat_idletimer.reset();
        if(e.which==8 || e.which==32){
            FList.Chat_help.closeTooltip();
        } else {
            if(FList.Chat_help.panelIsOpen){
                FList.Chat_help.updateTooltip();
            }
        }
    });
    $("#MessageBox, #IdentityBox, #GroupBox").show();
    FList.Chat_paraBar.show();
    $("#MessageBox").bind("keypress", function(e){

        if(e.which==13 && (e.shiftKey || e.ctrlKey) || (e.which==10 && e.ctrlKey)){
            e.preventDefault();
            var resultingtext=$("#MessageBox").val();
            var pos=$("#MessageBox").caret().start;
            resultingtext=resultingtext.substring(0,pos) + "\n" + resultingtext.substring(pos);
            $("#MessageBox").val(resultingtext).caret(pos+1,pos+1);
        }
        if(e.which==47 && $("#MessageBox").val().length<1){
            //FList.Chat_help.showTooltip(); TODO: improve

        }
        if(e.which==13 && !(e.shiftKey || e.ctrlKey)){
            e.preventDefault();
            var msg=$("#MessageBox").val();
            if(msg!==""){
                FList.Chat_handleInput(msg);
            } else {
                FList.Common_displayError("You did not enter a message.");
            }

        }
    });
};

FList.Chat_handleInput = function(msg){
    FList.Chat_playSound("chat");
    if(msg.substring(0,1)=="/" && msg.substring(0,4)!=="/me " && msg.substring(0,5)!=="/me's" && msg.substring(0,6) != "/warn "){
        var error=false;
        if(msg=="/clear"){
            $("#ChatArea .inner").empty();
            FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].logs=[];
        } else if(msg.substring(0,6)=="/help ") {
            var command=msg.substring(6).toLowerCase();
            if(command in helpdata){

                var syntaxhelp="";
                for(var i in helpdata[command].syntax){
                    syntaxhelp+=" &lt;<i>" + helpdata[command].syntax[i] + "</i>&gt; ";
                }
                if(syntaxhelp!=="") syntaxhelp=" <i>" + syntaxhelp + "</i>";
                var cmdinfo="/" + command + syntaxhelp;
                FList.FChat_printMessage(cmdinfo + " - " + helpdata[command].description, "ChatTypeInfo","",'all');
            } else {
                FList.FChat_printMessage("No such command was found.", "ChatTypeError","",'all');
            }


        } else if(msg=="/help"){
            var cmdinfo="";
            for(var key in helpdata){
                if(jQuery.inArray("all",helpdata[key].rights)>-1 || (jQuery.inArray("admin",helpdata[key].rights)>-1 && FList.Rights.has("admin")) || (jQuery.inArray("debug",helpdata[key].rights)>-1 && WEB_SOCKET_DEBUG) ||  (jQuery.inArray("chatop",helpdata[key].rights)>-1 && FList.Chat_ischanop()) ||  (jQuery.inArray("chanop",helpdata[key].rights)>-1 && FList.Chat_ischanop()) ||  (jQuery.inArray("owner",helpdata[key].rights)>-1 && FList.Chat_ischanowner())){

                    var syntaxhelp="";
                    for(var i in helpdata[key].syntax){
                        syntaxhelp+=" &lt;<i>" + helpdata[key].syntax[i] + "</i>&gt; ";
                    }
                    if(syntaxhelp!=="") syntaxhelp=" <i>" + syntaxhelp + "</i>";
                   cmdinfo+="/<b>" + key + "</b>" + syntaxhelp + "\n";

                }

            }
            FList.FChat_printMessage(FList.ChatParser.parseContent(cmdinfo), "ChatTypeInfo","",'all');

        } else if(msg.substring(0,6)=="/users"){
            if (msg.substring(7) != "") {
                var filter = {gender: msg.substring(7).toLowerCase()};
                FList.Chat_users.printGlobal(filter);
            } else FList.Chat_users.printGlobal();
        } else if(msg=="/who"){
            FList.Chat_users.printCurrent();
        } else if(msg=="/forceop"){
            if(FList.Rights.has("developer"))
                FList.ForceOp();
        } else if(msg=="/debugop"){
            if(FList.Rights.has("developer"))
                FList.DebugOp();
        } else if(msg=="/debugopoff"){
            if(FList.Rights.has("developer"))
                FList.DebugOpOff();
        } else if(msg=="/logout"){
            FList.Chat_ws.close();
        } else if(msg.substring(0,7)=="/gkick " && FList.Rights.has("chat-chatop")){
            var person=msg.substring(7);
            person=FList.Chat_users.getInstance(person);
            if(person!=-1){
                FList.Chat_send("KIK " + JSON.stringify({character: person}));
            }
        } else if(msg.substring(0,16)=="/setdescription " && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel"){
                var description=msg.substring(16);
                var channel = FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).name;
                if(channel!=-1){
                    FList.Chat_send("CDS " + JSON.stringify({channel: channel, description: description}));
                }
            } else {
                error=true;
                FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
            }
        } else if(msg == "/getdescription"){
            if(FList.Chat_tabs.currentType=="channel"){
                var description = nl2br(FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).description);
                FList.FChat_printMessage(description, "ChatTypeSystem","",'all');
            } else {
                error=true;
                FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,9)=="/setmode " && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel"){
                var mode=msg.substring(9);
                if(mode=="both" || mode=="chat" || mode=="ads"){
                    var channel = FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).name;
                    if(channel!=-1){
                        FList.Chat_send("RMO " + JSON.stringify({channel: channel, mode: mode}));
                    }
                 } else {
                    error=true;
                    FList.FChat_printMessage("Invalid mode.", "ChatTypeError","",'all');
                 }
            } else {
                error=true;
                FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
            }
        } else if(msg=="/channels"){
            FList.Chat_requestList=true;
            FList.Chat_send("CHA");
        } else if(msg=="/prooms"){
            FList.Chat_requestList=true;
            FList.Chat_send("ORS");
        } else if(msg.substring(0,11)=="/broadcast " && FList.Rights.has("admin")){
            var message=msg.substring(11);
            FList.Chat_send("BRO " + JSON.stringify({message: message}));
        } else if(msg.substring(0,7)=="/ipban " && FList.Rights.has("chat-chatop")){
            var person=msg.substring(7);
            person=FList.Chat_users.getInstance(person);
            if(person!=-1){
                FList.Chat_send("IPB " + JSON.stringify({character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,12)=="/accountban " && FList.Rights.has("chat-chatop")){
            var person=msg.substring(12);
            person=FList.Chat_users.getInstance(person);
            if(person!=-1){
                FList.Chat_send("ACB " + JSON.stringify({character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,9)=="/profile "){
            var person=msg.substring(9);
            person = FList.Chat_users.getInstance(person);
            if(person!=-1){
                FList.Chat_RequestProfile(person);
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,7)=="/kinks "){
            var person=msg.substring(7);
            person=FList.Chat_users.getInstance(person);
            if(person!=-1){
                FList.Chat_RequestKinks(person);
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg=="/soundoff"){
            FList.Chat_muteSound=true;
            FList.FChat_printMessage("Sound is now disabled. /soundon to enable it.", "ChatTypeInfo","",'all');
        } else if (msg.substring(0,6)=="/join "){
            var channel=msg.substring(6);
            FList.Chat_channels.requestJoin(channel);
        } else if (msg=="/close"){
            if(FList.Chat_tabs.currentType=="channel"){
                FList.Chat_send("LCH " + JSON.stringify({channel: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id}));
            } else if(FList.Chat_tabs.currentType=="person"){
                FList.Chat_tabs.closeTab(FList.Chat_tabs.currentIndex);
            } else {
                FList.FChat_printMessage("You cannot close the console.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,6)=="/leave"){
            if(msg.length>6 && msg.indexOf(' ')!==-1){
                var channel=msg.substring(7);
                channel=FList.Chat_channels.getInstance(channel);
                if(channel!=-1){
                    FList.Chat_send("LCH " + JSON.stringify({channel: channel.name}));
                } else {
                    error=true;
                    FList.FChat_printMessage("No such channel is open.", "ChatTypeError","",'all');
                }
            } else {
                if(FList.Chat_tabs.currentType=="channel"){
                    FList.Chat_send("LCH " + JSON.stringify({channel: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id}));
                } else {
                    error=true;
                    FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
                }
            }
        } else if(msg.substring(0,15)=="/createchannel " && FList.Rights.has("chat-chatop")){
            var channel=msg.substring(15);
            FList.Chat_send("CRC " + JSON.stringify({channel: channel}));
        } else if(msg.substring(0,13)=="/killchannel " && FList.Rights.has("chat-chatop")){
            var channel=msg.substring(13);
            FList.Chat_send("KIC " + JSON.stringify({channel: channel}));
        } else if(msg=="/soundon"){
            FList.Chat_muteSound=false;
            FList.FChat_printMessage("Sound is now enabled. /soundoff to disable it.", "ChatTypeInfo","",'all');
        } else if(msg.substring(0,6)=="/priv "){
            $("#MessageBox").val("");
            var person=msg.substring(6);
            FList.Chat_openPrivateChat(person,true);
        } else if(msg.substring(0,7)=="/status"){
            var sta = msg.split(" ")[1] || "";
            if (sta.toLowerCase() == "looking") sta = "Looking";
            else if (sta.toLowerCase() == "busy") sta = "Busy";
            else if (sta.toLowerCase() == "idle") sta = "Idle";
            else if (sta.toLowerCase() == "away") sta = "Away";
            else if (sta.toLowerCase() == "dnd") sta = "DND";
            else sta = "Online";
            var sobj = {status: sta};
            if (msg.split(" ").length > 2) {
                var statusmsg = msg.split(" ").slice(2).join(" ");
                sobj.statusmsg = statusmsg;
            }
            FList.Chat_lastStatus = sobj;
            if (typeof(sobj.statusmsg) != "undefined" && sobj.statusmsg.length > 255)
            {
                FList.FChat_printMessage("That status message is too long; the max is 255 characters.", "ChatTypeInfo","",'all');
            }
            else
            {
                FList.Chat_send("STA " + JSON.stringify(sobj));
                FList.FChat_printMessage("You set your status to " + sta + ".", "ChatTypeInfo","",'all');
            }
            // TODO: take this back out sometime.
            if (typeof(sobj.statusmsg) == "undefined" && FList.Chat_statusInfoSeen != true) {
                FList.FChat_printMessage("New: you can also set an optional status message with /status &lt;status&gt; &lt;message&gt;, which will show up when you're clicked, and in kinks searches if you're Looking.", "ChatTypeInfo","",'all');
                FList.Chat_statusInfoSeen = true;
            }
        } else if(msg.substring(0,7)=="/reward"){
            person=FList.Chat_users.getInstance(msg.substr(8));
            if(person!=-1){
                FList.Chat_send("RWD " + JSON.stringify({character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,8)=="/timeout"){
            var bits = msg.substr(9).split(",");
            if (bits.length > 2) {
                var username = FList.Chat_users.getInstance(bits[0].trim());
                var minutes = parseInt(bits[1]);
                var reason = bits.slice(2).join(",").trim();
                if(username!=-1){
                    FList.Chat_send("TMO " + JSON.stringify({time: minutes, character: username, reason: reason}));
                } else {
                    error=true;
                    FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                }
            } else {
                error=true;
                FList.FChat_printMessage("Syntax error. Timeout command format: /timeout [name], [minutes], [reason].", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,9)=="/ctimeout"){
            var bits = msg.substr(10).split(",");
            if (bits.length > 1) {
                var username = FList.Chat_users.getInstance(bits[0].trim());
                var minutes = parseInt(bits[1]);
                var channel = FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).name;
                if(username!=-1){
                    FList.Chat_send("CTU " + JSON.stringify({length: minutes, channel: channel, character: username}));
                } else {
                    error=true;
                    FList.FChat_printMessage("No such user in the chat.", "ChatTypeError", "", 'all');
                }
            } else {
                error=true;
                FList.FChat_printMessage("Syntax error. Timeout command format: /ctimeout [name], [minutes]", "ChatTypeError", "", 'all');
            }
        } else if(msg.substring(0,7)=="/gunban"){
            var username = msg.substring(8);
            if(username != ""){
                FList.Chat_send("UNB " + JSON.stringify({character: username}));
            } else {
                error=true;
                FList.FChat_printMessage("Give an username to unban. Unbanning is case sensitive! ", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,9)=="/altwatch"){
            var username = msg.substring(10);
            if(username != ""){
                FList.Chat_send("AWC " + JSON.stringify({character: username}));
            } else {
                error=true;
                FList.FChat_printMessage("Give an username so set the alt watch.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,5)=="/roll"){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                var dice=msg.substr(6);
                dice = dice.replace(/ /g, "");
                if (dice == "") dice = "1d10";
                var diceok = true;
                var rolls = dice.split(/[+-]/);
                for (var i = 0; i<rolls.length; i++) {
                    if (/^[0-9]d[0-9]+$/.test(rolls[i])) {
                        var dt = rolls[i].split("d");
                        var r = parseInt(dt[0]);
                        var d = parseInt(dt[1]);
                        if (r > 9 || d < 2 || d > 500) {
                            diceok = false;
                            break;
                        }
                    } else if (/^[0-9]+$/.test(rolls[i])) {
                        if (parseInt(rolls[i]) > 10000) {
                            diceok = false;
                            break;
                        }
                    } else {
                        diceok = false;
                        break;
                    }
                }
                if (diceok == true) {
                    FList.Chat_send("RLL " + JSON.stringify({channel: channel, dice: dice}));
                } else {
                    error = true;
                    FList.FChat_printMessage("Wrong dice format. Dice format is throw+throw+throw+..., where a throw is either [1-9]d[2-100] or just a number to be added.", "ChatTypeError","",'all');
                }
            } else {
                error = true;
                FList.FChat_printMessage("You can only roll dice in a channel.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,7)=="/bottle"){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                FList.Chat_send("RLL " + JSON.stringify({channel: channel, dice: "bottle"}));
            } else {
                error = true;
                FList.FChat_printMessage("You can only roll dice in a channel.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,8)=="/ignore "){
            var person=msg.substring(8);
            //if(FList.Chat_users.getIndex(person)!==-1){
                FList.Chat_users.addIgnore(person);
            //} else {
            //  error=true;
            //  FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            //}
        } else if(msg.substring(0,10)=="/unignore "){
            var person=msg.substring(10);
            FList.Chat_users.delIgnore(person);
        } else if(msg.substring(0,11) == "/ignorelist") {
            $("#MessageBox").val("");
            FList.Chat_send("IGN " + JSON.stringify({"action": "list"}));
            return;
        } else if(msg.substring(0,9)=="/makeroom"){
            var title = msg.substring(10);
            if (title.length > 0) {
                FList.Chat_send("CCR " + JSON.stringify({channel: title}));
            } else {
                error=true;
                FList.FChat_printMessage("Please give your room a name: /makeroom name.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,4)=="/op " && FList.Rights.has("admin")){
            var person=msg.substring(4);
            if(FList.Chat_users.getIndex(person)!==-1){
                FList.Chat_send("AOP " + JSON.stringify({character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,6)=="/deop " && FList.Rights.has("admin")){
            var person=msg.substring(6);
            if(FList.Chat_users.getIndex(person)!==-1){
                FList.Chat_send("DOP " + JSON.stringify({character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,7)=="/reload" && FList.Rights.has("admin")){
            var word = msg.substring(8);
            var o = {};
            if (word == "save") o.save = "yes";
            FList.Chat_send("RLD " + JSON.stringify(o));
        } else if(msg.substring(0,8)=="/opstats" && FList.Rights.has("admin")){
            FList.Chat_opStatsCommand = msg.substring(9);
            FList.Chat_send("OPP");
        } else if(msg.substring(0,5)=="/cop " && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                var person=msg.substring(5);
                if(FList.Chat_users.getIndex(person)!==-1){
                    FList.Chat_send("COA " + JSON.stringify({channel: channel, character: person}));
                } else {
                    error=true;
                    FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                }
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,7)=="/cdeop " && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                var person=msg.substring(7);
                FList.Chat_send("COR " + JSON.stringify({channel: channel, character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,9)=="/openroom" && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                FList.Chat_send("RST " + JSON.stringify({channel: channel, status: "public"}));
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,10)=="/closeroom" && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                FList.Chat_send("RST " + JSON.stringify({channel: channel, status: "private"}));
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,10)=="/inviteall"){
            // /inviteall is deprecated now, because /code was added, which allows users to post a direct link with [session] tags.
            // I'll leave the code here, in case somebody comes up with a good reason why /inviteall is better.
            /*
            if(FList.Chat_tabs.currentType=="channel"){
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                FList.Chat_send("RAN " + JSON.stringify({ channel: channel }));
            } else {
                error=true;
                FList.FChat_printMessage("You are not in a channel.", "ChatTypeError","",'all');
            }
            */
            // Error message to tell them about /code:
            FList.FChat_printMessage("This command does not work any more. Instead, you can include a link to your private room in your post with [session] tags. Go to your room and type /code for the exact code needed!", "ChatTypeError","",'all');
        } else if(msg.substring(0,8)=="/coplist" && FList.Chat_ischanop() == true){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                FList.Chat_send("COL " + JSON.stringify({channel: channel}));
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,6)=="/kick " && FList.Chat_ischanop() == true){
            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
            var person=msg.substring(6);
            if(FList.Chat_users.getIndex(person)!==-1){
                FList.Chat_send("CKU " + JSON.stringify({channel: channel, character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,10)=="/setowner " && FList.Chat_ischanop()){
            if(FList.Chat_tabs.currentType=="channel") {
                var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                var person=msg.substring(10);
                if(FList.Chat_users.getIndex(person)!==-1){
                    FList.Chat_send("CSO " + JSON.stringify({channel: channel, character: person}));
                } else {
                    error=true;
                    FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
                }
            } else {
                error=true;
                FList.FChat_printMessage("You must be in a channel to use this command.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,7)=="/uptime"){
            FList.Chat_send("UPT");
        } else if(msg.substring(0,5)=="/ban " && FList.Chat_ischanop() == true){
            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
            var person=msg.substring(5);
            FList.Chat_send("CBU " + JSON.stringify({channel: channel, character: person}));
        } else if(msg == "/code"){
            if (FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id.substr(0,3) !== "ADH") {
                FList.FChat_printMessage("This command is only for private channels.", "ChatTypeError","",'all');
            } else {
                var channelname = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                var pubname = FList.Chat_channels.getInstance(FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id).title;
                var outputmsg = "Copy this text into your post: <b>[session=" + pubname + "]" + channelname + "[/session]</b>";
                FList.FChat_printMessage(outputmsg, "ChatTypeInfo","",'all');
            }
        } else if(msg.substring(0,7)=="/unban " && FList.Chat_ischanop() == true){
            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
            var person=msg.substring(7);
            FList.Chat_send("CUB " + JSON.stringify({channel: channel, character: person}));
        } else if(msg.substring(0,7)=="/invite" && FList.Chat_ischanop() == true){
            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
            var person=msg.substring(8);
            if(FList.Chat_users.getIndex(person)!==-1){
                FList.Chat_send("CIU " + JSON.stringify({channel: channel, character: person}));
            } else {
                error=true;
                FList.FChat_printMessage("No such user in the chat.", "ChatTypeError","",'all');
            }
        } else if(msg.substring(0,8)=="/banlist" && FList.Chat_ischanop() == true){
            var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
            FList.Chat_send("CBL " + JSON.stringify({channel: channel}));
        } else {
            error=true;
            FList.FChat_printMessage("You either mistyped your command, or it doesn't work here.", "ChatTypeError","",'all');
        }
        if(error==false){
            $("#MessageBox").val("");
            FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].textfield="";
        }

    } else {
        if(FList.Chat_tabs.currentType == "channel" || FList.Chat_tabs.currentType == "person"){
            if(last_msg<FList.Common_unixTimestamp()){
                last_msg=FList.Common_unixTimestamp();
                var message=$("#MessageBox").val();
                if(FList.Chat_disableIcons) {message=message.replace(/\[icon\]/g, "[user]");message=message.replace(/\[\/icon\]/g, "[/user]");}
                if (message.substr(0,4) == "http" && message.indexOf(" ") == -1 && message.length > 100) {
                    message = "([url=" + message + "]Long link[/url] spam-protected for your convenience.)";
                }
                if(FList.Chat_tabs.currentType=="channel"){
                    var channel = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                    if(FList.Chat_channels.getInstance(channel).mode=="ads"){
                        FList.Chat_looking.sendAd();
                        //FList.Common_displayError("This channel is set to only allow ads. Use the 'Post as RP ad' feature instead.");
                        return;
                    } else {
                        if (FList.Chat_autoTranslate && FList.Chat_languages[FList.Chat_autoTranslate].channel != channel) {
                            FList.Chat_translation.translate(FList.ChatParser.parseContent(message), FList.Chat_autoTranslate, 'en', function(result) {
                                FList.Chat_send("MSG " + JSON.stringify({channel: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id, message: result.translation}));
                            });
                        } else FList.Chat_send("MSG " + JSON.stringify({channel: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id, message: message}));
                    }
                } else {
                    var recipient = FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                    // PRI sent = stopped typing
                    FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].metyping = false;
                    FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].mewaiting = true;
                    if(jQuery.inArray( FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id.toLowerCase(),FList.Chat_ignorelist)==-1){
                        if (FList.Chat_autoTranslate) {
                            FList.Chat_translation.translate(FList.ChatParser.parseContent(message), FList.Chat_autoTranslate, 'en', function(result) {
                            FList.Chat_send("PRI " + JSON.stringify({recipient: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id, message: result.translation}));
                            });
                        } else FList.Chat_send("PRI " + JSON.stringify({recipient: FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id, message: message}));
                    }
                }
                // TAKE OUT EVERY ZIG
                message = message.replace(/</g, "&lt;");
                message = message.replace(/>/g, "&gt;");
                // autoparsing after sending, or we will be forcing parsed urls on everyone if it's on!
                if (FList.Chat_autoparseURLs == true) message = message.replace(/(?:[^=\]]|^)((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g, "[url]$1[/url]");
                var addclass = "";
                if (FList.Chat_highlightMyMessages == true) addclass = "ChatMyMessage";
                    FList.ChatParser._cutLongWords=false;
                    if(message.substring(0,4)=="/me "){
                        FList.FChat_printMessage(FList.ChatParser.parseContent(message.substring(4)), "ChatTypeAction", FList.Chat_identity,FList.Chat_tabs.currentIndex, addclass);
                    } else if(message.substring(0,5)=="/me's"){
                        FList.FChat_printMessage(FList.ChatParser.parseContent(message.substring(5)), "ChatTypeAction", FList.Chat_identity,FList.Chat_tabs.currentIndex, addclass);
                    } else if(message.substring(0,6)=="/warn " && FList.Chat_ischanop()){
                        FList.FChat_printMessage(FList.ChatParser.parseContent(message.substring(6)), "ChatTypeWarn", FList.Chat_identity,FList.Chat_tabs.currentIndex);
                    } else {
                        FList.FChat_printMessage(FList.ChatParser.parseContent(message), "ChatTypeChat", FList.Chat_identity, FList.Chat_tabs.currentIndex, addclass);
                    }
                    FList.ChatParser._cutLongWords=true;

                $("#MessageBox").val("");
                FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].textfield="";
            } else {
                FList.Common_displayError("Flood control; please wait one seconds.");
            }
        }
    }
};

FList.Chat_RequestProfile = function(user){
    FList.Chat_send("PRO " + JSON.stringify({character: user}));
};

FList.Chat_RequestKinks = function(user){
    FList.Chat_send("KIN " + JSON.stringify({character: user}));
};



FList.Chat_DisplayInfoBar = function(name){
    var activetab=FList.Chat_tabs.list[FList.Chat_tabs.currentIndex];
    $("#CharBox").html("");
    if(FList.Chat_tabs.currentType=="person"){
        $("#CharBox").append("<img class='CharInfoAvatar' src='" + staticdomain + "images/avatar/" + name.toLowerCase() + ".png'/>");
        $("#CharBox").append("<div id='charboxactions'><button id='CharInfoFlist' onclick='window.open(\"" + domain + "c/" + name.toLowerCase() + "\");'>F-List</button></div>");
        if(FList.isSubscribed){
            $("#charboxactions").append("<button id='CharMemoLink'>Memo</button>");

        }
        if(FList.Chat_logging) {
            $("#charboxactions").append("<button id='CharLogsLink'>Logs</button>");
            $("#CharLogsLink").click(function(){
                FList.Chat_logs.getUser(name);
            });
        }
       $("#CharInfoFlist").button({
                text: false,
                    icons: {
                        primary: "ui-icon-person"
                    }
                });
                if($("#CharMemoLink").length>0){
                    $("#CharMemoLink").button({
                    text: false,
                        icons: {
                            primary: "ui-icon-document-b"
                        }
                    }).click(function(){FList.Memo.prepareData(name);});
                }
                $("#CharLogsLink").button({
                text: false,
                    icons: {
                        primary: "ui-icon-comment"
                    }
                });
                $("#charboxactions").buttonset();

        $("#CharBox").append("<a id='charboxname' class='AvatarLink'>" + name + "</a>");
//      FList.Chat_contextMenu.bindTo($("#charboxname"));
        $("#CharBox").append("<br/>");
        var sm="";var stat="";
        if (FList.Chat_users.getInstance(name) !== -1) {
        sm = FList.Chat_users.getData(name).statusmsg;
        stat = FList.Chat_users.getData(name).status;
        } else {
            stat="offline";
            sm="";
        }
        if (stat.toLowerCase() == "looking") $("#charboxname").addClass("StatusLooking");
        else if (stat.toLowerCase() == "offline") $("#charboxname").addClass("StatusOffline");
        else if (stat.toLowerCase() == "busy") $("#charboxname").addClass("StatusBusy");
        else if (stat.toLowerCase() == "dnd") $("#charboxname").addClass("StatusDND");
        else if (stat.toLowerCase() == "idle") $("#charboxname").addClass("StatusIdle");
        else if (stat.toLowerCase() == "away") $("#charboxname").addClass("StatusAway");
        else if (stat.toLowerCase() == "crown") $("#charboxname").addClass("StatusCrown");
        if (typeof(sm) == "string" && sm != "") $("#CharBox").append('<span style="display: block; padding-top: 5px;">' + FList.ChatParser.parseContent(sm) + '</span>');
    } else if(FList.Chat_tabs.currentType=="channel"){
        var chan=FList.Chat_channels.getInstance(name);
        if (name.substr(0,3) == "ADH") var title = chan.title;
        else var title = "#" + name;
        if(chan!=-1) $("#CharBox").append("<h2>" + title + "</h2>" + FList.ChatParser.parseContent(chan.description));
    } else if(FList.Chat_tabs.currentType=="console"){
        $("#CharBox").html("<i>Console</i>");
    }
    $("#CharBox").fadeIn("fast");
};//show f-list profile, contact info, private chat, close

FList.Chat_truncateMessage = function(text, maxchars) {
    if (text.length <= maxchars && text.indexOf("<br") == -1 && text.indexOf("\n") == -1) return text;
    var position = 0;
    var htmlcheck = text.indexOf("<");
    if (htmlcheck >= 0 && htmlcheck <= maxchars) {
        position = htmlcheck;
    } else {
        while (position < maxchars) {
            var send = text.substr(position).search(/[\n!\?]|\.[^\.]/);
            if (send == -1) break;
            if (send + position < maxchars) {
                position = position + send + 1;
            } else break;
        }
        if (position == 0) position = text.substr(0, maxchars).lastIndexOf(" ");
        if (position == 0 || position == 1) position = maxchars;
    }
    var visible = text.substring(0, position);
    var hidden = text.substring(position);
    var result = visible
         + " <a href=\"javascript:void(0)\" onclick=\"$(this).css('display', 'none');$(this).next('span').css('display', ''); return false;\">[Click to read more.]</a>"
         + "<span style=\"display: none;\">"
         + hidden
         + "</span>";
    return result;
};

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

FList.Chat_autoCompleteName = function(skipspaces){
    var text=$("#MessageBox").val();
    var endpos=$("#MessageBox").caret().start;
    var startpos=0;
    var scount=0;
    for(var i=endpos;i>=0;i--){
        var character=text.substr(i,1);
        startpos=i;
        if(character==" ") {
            if(skipspaces){
                break;
            } else {
                scount=scount+1;
                if(scount==2) break;//allow one space.
            }
        }
        if(character=="\""){
            break;
        }
    }
    var completetext=text.substring(startpos, endpos).toLowerCase();
    if(completetext.substring(0,1)==" " || completetext.substring(0,1)=="\"")
        completetext=completetext.substring(1);
    if(completetext.length<=1){
        return -1;
    } else {
        var list=FList.Chat_users.list;
        var match=new Array();
        var matches=0;
        for(var i in list){
            if(list[i].toLowerCase().substring(0,completetext.length)==completetext){
                match.push({"name": list[i], "start": startpos, "search": completetext});
                matches++;
            }
        }
        if(matches==0){
            return [];
        } else {
            return match;
        }
    }
};


function completeName(startpos, name, fulltext){
    if(startpos==0){name=name + " ";}
    if(fulltext.substr(startpos, 1)==" " || fulltext.substr(startpos, 1)=="\""){startpos++;}
    var endpos=startpos+name.length;
    fulltext=fulltext.substring(0, startpos) + name + fulltext.substring(endpos);
    $("#MessageBox").val(fulltext);
}


FList.Chat_looking = {

    sendAd: function(){
        if(FList.Chat_tabs.currentType=="channel"){
             //if(last_lfrp<FList.Common_unixTimestamp()-600){

                var text=$("#msgfieldarea textarea").val();
                if(text==""){
                    FList.Common_displayError("You need to enter text for your RP ad.");
                    return;
                }
                var chan=FList.Chat_tabs.list[FList.Chat_tabs.currentIndex].id;
                if(FList.Chat_channels.getInstance(chan).mode=="chat"){
                    FList.Common_displayError("This channel has roleplay ads disabled.");
                    return;
                }
                last_lfrp=FList.Common_unixTimestamp();
                $("#msgfieldarea textarea").val("");
                FList.Chat_send("LRP " + JSON.stringify({message: text, channel: chan}));
                text=text.replace(/\[icon/g, "[user");
                text=text.replace(/\[\/icon/g, "[/user");
                FList.FChat_printMessage(FList.ChatParser.parseContent(text), "ChatTypeAd", FList.Chat_identity,FList.Chat_tabs.currentIndex);
           // } else {
            //  FList.Common_displayError("Flood control; please wait ten minutes between posting roleplay ads.");
           // }
        } else {
            FList.Common_displayError("You can't send ads if you are not in a channel.");
        }
    },

    setFilter: function(){
        var mode=$("#msgfieldarea .filterbox").val();
        FList.Chat_filtermode=mode;
        $(".ChatMessage").show();
        if(FList.Chat_filtermode=="hideads")
            $(".ChatTypeAd").hide();
        if(FList.Chat_filtermode=="hidechats")
            $(".ChatTypeChat, .ChatTypeAction").hide();
    },

    getPanel: function(){
        var panel = "<div class='StyledForm'><p><b>Send a roleplay ad</b><br/>This sends out a roleplay ad in the currently open channel. You can only send out an ad once every five minutes.</p><p><textarea id='ChatLookingAdText'></textarea></p><p><input type='button' value='Post ad' onclick='FList.Chat_looking.sendAd();'/></p></div>";
        return panel;
    },

    getOverviewPanel: function(){
    var panel="";
    var userlist = FList.Chat_users.list;
    for(var i in userlist){
        if(userlist[i] in FList.Chat_users.userdata) {
            if(FList.Chat_users.userdata[userlist[i]].status=="Looking"){
                panel+=userlist[i] + "<br/>" + FList.ChatParser.parseContent(FList.Chat_users.userdata[userlist[i]].statusmsg) + "<hr/>";
            }
        }
    }
    return panel;
    }
};

function CommandHelp(syntax, description, rights){
    this.syntax=syntax;
    this.description=description;
    this.rights=rights;//admin, debug, chatop, chanop, owner.
}

var helpdata = [];
helpdata["setdescription"]=new CommandHelp(["channel description"],"Sets the description in a channel.",["chatop","chanop"]);
helpdata["me"]=new CommandHelp(["chatmessage"],"Use this command to make your message appear in-character.",["all"]);
helpdata["clear"]=new CommandHelp([],"Clears the active tab's history.",["all"]);
helpdata["channels"]=new CommandHelp([],"Prints a list of all channels.",["all"]);
helpdata["join"]=new CommandHelp(["channel"],"Joins a channel.",["all"]);
helpdata["getdescription"]=new CommandHelp([],"Get the raw, unparsed channel description of the active channel.",["chanop","chatop"]);
helpdata["users"]=new CommandHelp([],"Displays a list of all users connected to F-Chat.",["all"]);
helpdata["close"]=new CommandHelp([],"Closes the active tab.",["all"]);
helpdata["who"]=new CommandHelp([],"Get a list of who is in the active channel.",["all"]);
helpdata["priv"]=new CommandHelp(["character"],"Opens a private conversation with a user.",["all"]);
helpdata["ignore"]=new CommandHelp(["character"],"Adds someone to your ignore-list.",["all"]);
helpdata["unignore"]=new CommandHelp(["character"],"Removes someone from your ignore-list.",["all"]);
helpdata["ignorelist"]=new CommandHelp([],"Displays your ignore-list.",["all"]);
helpdata["code"]=new CommandHelp([],"Displays the linking code for a private channel.",["all"]);
helpdata["logout"]=new CommandHelp([],"Logs out of the chat.",["all"]);
helpdata["profile "]=new CommandHelp(["character"],"Displays basic profile info about a character.",["all"]);
helpdata["soundon"]=new CommandHelp([],"Turns HTML5 audio effects on.",["all"]);
helpdata["soundoff"]=new CommandHelp([],"Turns HTML5 audio effects off.",["all"]);
helpdata["roll"]=new CommandHelp(["1d10"],"Roll a dice. Generate a random number between two given numbers.",["all"]);
helpdata["kinks"]=new CommandHelp(["character"],"Return kink data about a character.",["all"]);
helpdata["status"]=new CommandHelp(["Online|Looking|Busy|DND","message"],"Change your status light, and set your status message.",["all"]);
helpdata["makeroom"]=new CommandHelp(["name"],"Create a new private channel.",["all"]);
helpdata["invite"]=new CommandHelp(["character"],"Invite a user to your last created private channel.",["chanop"]);
helpdata["openroom"]=new CommandHelp([],"Opens a private room for public access.",["owner"]);
helpdata["closeroom"]=new CommandHelp([],"Close the active room off for public access, making it invitation-only.",["owner"]);
helpdata["setmode"]=new CommandHelp(["ads|chat|both"],"Set the message mode for a channel to only show ads, chats, or both.",["chanop","owner"]);
helpdata["forceop"]=new CommandHelp([],"What is this, then?",["debug"]);
helpdata["bottle"]=new CommandHelp([],"Spins the bottle and lands it on a random person in the active channel.",["all"]);
helpdata["reload"]=new CommandHelp([],"I dunno what this does.",["debug"]);
helpdata["slots"]=new CommandHelp([],"Displays the number of available login slots.",["debug"]);
helpdata["debugop"]=new CommandHelp([],"Turn yourself into an op for debugging purposes. (Won't do anything on the server, just the visual effects.)",["debug"]);
helpdata["debugoff"]=new CommandHelp([],"Disable fake-op mode. :U",["debug"]);
helpdata["prooms"]=new CommandHelp([],"Display a list of all private channels.",["all"]);
helpdata["reward"]=new CommandHelp(["character"],"Sets someone's status light to a cookie. Playful silly little thing.",["admin","chatop"]);
helpdata["broadcast"]=new CommandHelp(["message"],"Broadcasts a message to all users, in all tabs.",["admin"]);
helpdata["op"]=new CommandHelp(["character"],"Promotes a character to chatop.",["admin"]);
helpdata["deop"]=new CommandHelp(["character"],"Removes chatop status from a character.",["admin"]);
helpdata["gkick"]=new CommandHelp(["character"],"Kick someone from F-Chat.",["chatop"]);
helpdata["timeout"]=new CommandHelp(["character"],"Times someone out from the chat.",["chatop"]);
helpdata["ipban"]=new CommandHelp(["character"],"Kicks someone from F-Chat and permanently bans their IP address from entering again.",["chatop"]);
helpdata["accountban"]=new CommandHelp(["character"],"Kicks someone from F-Chat and permanently bans their account from entering again.",["chatop"]);
helpdata["gunban"]=new CommandHelp(["character"],"Removes an IP/accountban from a given character.",["chatop"]);
helpdata["createchannel"]=new CommandHelp(["channelname"],"Create a new public channel.",["admin"]);
helpdata["killchannel"]=new CommandHelp(["channel"],"Destructinates a channel. Does not properly destructinate private channels.",["admin"]);
helpdata["altwatch"]=new CommandHelp(["character"],"Some kind of chatop thing that watches alts?",["chatop"]);
helpdata["warn"]=new CommandHelp(["chatmessage"],"Displays a message in a scary red color for extra attentions.",["chatop","chanop"]);
helpdata["kick"]=new CommandHelp(["character"],"Kick someone from a channel.",["chanop","chatop"]);
helpdata["ban"]=new CommandHelp(["character"],"Bans a character from a private channel.",["chanop","chatop"]);
helpdata["unban"]=new CommandHelp(["character"],"Unbans a character from a private channel.",["chanop","chatop"]);
helpdata["banlist"]=new CommandHelp([],"Display the list of characters banned in the active channel.",["chanop","chatop"]);
helpdata["coplist"]=new CommandHelp([],"Display list of chan-ops of the active channel.",["chanop"]);
helpdata["cop"]=new CommandHelp(["character"],"Promote someone to chan-op.",["chanop","owner"]);
helpdata["cdeop"]=new CommandHelp(["character"],"Remove chan-op status from someone.",["chanop","owner"]);
helpdata["help"]=new CommandHelp(["command"],"Get help about commands, or get a list of all commands.",["all"]);

FList.Chat_logs = {
    currentUser: "",
    currentOffset: 0,
    logCount: 0,
    getUser: function(user){
        if(typeof(FList.Chat_history)=="undefined" || FList.Chat_history==null) {
            FList.Chat_logs.createDialog();
        }
        FList.Chat_logs.openDialog();
        if(!FList.Chat_logging) {alert("This functionality is disabled.");return;}
        $("#LogItemList").html("Loading...");
        this.currentUser=user;
        this.currentOffset=0;
        FList.Chat_send("LOG " + JSON.stringify({action: "count", type: "user", id: user}));
        FList.Chat_send("LOG " + JSON.stringify({action: "get", amount: 100, type: "user", id: user}));
    },
    previous: function(){
        this.currentOffset+=100;
        FList.Chat_send("LOG " + JSON.stringify({action: "get", type: "user", id: this.currentUser, offset: this.currentOffset}));
    },
    next: function(){
        this.currentOffset-=100;
        FList.Chat_send("LOG " + JSON.stringify({action: "get", type: "user", id: this.currentUser, offset: this.currentOffset}));
    },
    last: function(){
        this.currentOffset=0;
        FList.Chat_send("LOG " + JSON.stringify({action: "get", type: "user", id: this.currentUser, offset: this.currentOffset}));
    },
    first: function(){
        this.currentOffset=(Math.floor(FList.Chat_logs.logCount / 50))*50;
        FList.Chat_send("LOG " + JSON.stringify({action: "get", type: "user", id: this.currentUser, offset: this.currentOffset}));
    },
    deleteLog: function(name){
        if(confirm("Are you sure?")){
            FList.Chat_send("LOG " + JSON.stringify({action: "remove", key: name.toLowerCase()}));
        }
    },
    resize: function(){
        var height=FList.Chat_history.closest('.ui-dialog').height()-100;
        $("#LogItemList").css("height", height-20 + "px");
        $("#LogEntryList").css("height", height+5 + "px");
    },
    createDialog: function(){
        FList.Chat_history = $('<div></div>');
        FList.Chat_history.dialog({
            autoOpen: false,
            title: 'Chat History',
            width: '600',
            height:'500',
            modal: true,
            resize: function(event, ui) {
                FList.Chat_logs.resize();
            },
            buttons: {
                "Delete All": function(){
                    if(confirm("Are you sure? This can't be undone.")){
                        FList.Chat_send("LOG " + JSON.stringify({action: "delete"}));
                        FList.Common_displayNotice("Your chatlogs were deleted.");
                        FList.Chat_history.dialog("close");
                    }
                },
                "Close": function(){
                FList.Chat_history.dialog("close");
                }
            }
        });
    },
    openDialog:function(){
        if(typeof(FList.Chat_history)=="undefined" || FList.Chat_history==null) FList.Chat_logs.createDialog();
        FList.Chat_send("LOG " + JSON.stringify({action: "list"}));
        FList.Chat_history.dialog("open");
        FList.Chat_history.html("Loading...");
    }

};




FList.Memo = {
    dlg: 0,

    prepareData: function(_name){
        $.ajax({
            type: "GET",
            url: domain + "json/character-memo-get.json",
            dataType: "json",
            timeout: timeoutsec * 1000,
            data: {
                target: _name
            },
            success: function (data) {
                if (data.error == "") {
                    FList.Memo.showEditDialog(data.id, data.note, _name);
                } else {
                    FList.Common_displayError("Load failed: " + data.error);
                }
            },
            error: function (objAJAXRequest, strError, errorThrown) {
                FList.Common_displayError("An error occured. " + strError + ":" + errorThrown);
            }
        });
    },

    showEditDialog: function(_id, _note, name){
        if(FList.Memo.dlg!==0){
            FList.Memo.dlg.dialog("destroy");
            FList.Memo.dlg=0;
        }
        FList.Memo.dlg = $("<div>A memo is a note you store on a profile for something you want to write down about this person. Only you can see it.<br/><textarea class='ui-current-memo' style='width:300px;height:150px;' maxlength='255'>" + _note + "</textarea></div>");
        FList.Memo.dlg.dialog({
            autoOpen: true,
            title: 'Edit memo for ' + name,
            width: '350',
            height:'315',
            modal: true,
            buttons: {
                "Save": function(){
                    var newtext=FList.Memo.dlg.find(".ui-current-memo").val();
                    $.ajax({
                        type: "POST",
                        url: domain + "json/character-memo-save.json",
                        dataType: "json",
                        timeout: timeoutsec * 1000,
                        data: {
                            target: _id,
                            note: newtext
                        },
                        success: function (data) {
                            if (data.error == "") {
                                FList.Memo.dlg.dialog("close");
                                FList.Common_displayNotice("Your memo was saved.");
                            } else {
                                FList.Common_displayError("Save failed: " + data.error);
                            }
                        },
                        error: function (objAJAXRequest, strError, errorThrown) {
                            FList.Common_displayError("An error occured. " + strError + ":" + errorThrown);
                        }
                    });
                },
                "Close": function(){
                    FList.Memo.dlg.dialog("close");
                }
            }
        });
    }
};

FList.Chat= {};

FList.Chat.Logs = {
    Draw: function(tab_index){
        var lsArray,uid,acct,acctStr;
        if( ($("#ChatTab" + tab_index).hasClass("ChatPersonTab")) && FList.Chat_tabs.list[tab_index].hasDrawn===undefined && (typeof(Storage)!=="undefined") && FList.Chat_prefs.currentPrefs.logPM != true ){
            uid = FList.Chat_tabs.list[tab_index].id;
            acct = FList.Chat_identity;
            acctStr = acct+"_"+uid;
            if(localStorage[acctStr] !== undefined){
                lsArray = localStorage[acctStr].split(",");
                for(i=0;i<lsArray.length;i++){
                    lsArray[i] = unescape(lsArray[i]);
                    lsArray[i]=$(lsArray[i]);
                }
                if(FList.Chat_tabs.list[tab_index].localLogsOffset === undefined){
                    FList.Chat_tabs.list[tab_index].localLogsOffset = 0;
                }
                for(i=(0+FList.Chat_tabs.list[tab_index].localLogsOffset);i<lsArray.length;i++){
                    FList.Chat_tabs.list[tab_index].logs.push(lsArray[i]);
                }
            }
            FList.Chat_tabs.list[tab_index].hasDrawn=true;
        }
    },
    Delete: function(){
        if(typeof(Storage)!==undefined){
            for(i in localStorage){
                if(i.match(/_last/gi)){
                    delete localStorage[i];
                    delete localStorage[(i.replace("_last",""))];
                }
            }
        }
    },
    Store: function(tab_index){
        if( $("#ChatTab"+tab_index).hasClass("ChatPersonTab") && typeof(Storage)!==undefined && FList.Chat_prefs.currentPrefs.logPM != true){
            var lsArray,uid,acct,acctStr,time,x,y,m;
            acct = FList.Chat_identity;
            x = new Date();
            y = (x.getDate()<10) ? "0"+x.getDate(): x.getDate();
            m = ((x.getMonth()+1)<10) ? "0"+(x.getMonth()+1): (x.getMonth()+1);
            time = Math.floor((new Date()).getTime()/1000);
            uid = FList.Chat_tabs.list[tab_index].id;
            acctStr = acct+"_"+uid;
            if(FList.Chat_tabs.list[tab_index].logs[0][0].outerHTML.match(/^<span class=\"ChatMessage (ChatTypeDisconnect|ChatTypeConnect)\".+/gi)){return;}
            if(localStorage[acctStr] !== undefined){
                var lsArray = localStorage[acctStr].split(",");
                if (lsArray.length > 100){
                    lsArray.pop();
                }
                if(FList.Chat_tabs.list[tab_index].hasDrawn===undefined){
                    if(FList.Chat_tabs.list[tab_index].localLogsOffset != undefined){
                        FList.Chat_tabs.list[tab_index].localLogsOffset = FList.Chat_tabs.list[tab_index].localLogsOffset+1;
                    }else{
                        FList.Chat_tabs.list[tab_index].localLogsOffset = 1;
                    }
                }
                localStorage[acctStr+"_last"] = time;
                localStorage[acctStr] = (escape(FList.Chat_tabs.list[tab_index].logs[0][0].outerHTML.replace(/(.+\>\[)([0-9]{1,2}:[0-9]{1,2}\s[A-Z]{1,2})(\]\<.+)/gi,("$1"+new Date().getFullYear()+"/"+m+"/"+y+"$3"))) +","+ lsArray.join());
            } else {
                if(FList.Chat_tabs.list[tab_index].hasDrawn===undefined){
                    if(FList.Chat_tabs.list[tab_index].localLogsOffset != undefined){
                        FList.Chat_tabs.list[tab_index].localLogsOffset = FList.Chat_tabs.list[tab_index].localLogsOffset+1;
                    }else{
                        FList.Chat_tabs.list[tab_index].localLogsOffset = 1;
                    }
                }
                localStorage[acctStr+"_last"] = time;
                localStorage[acctStr] = escape(FList.Chat_tabs.list[tab_index].logs[0][0].outerHTML.replace(/(.+\>\[)([0-9]{1,2}:[0-9]{1,2}\s[A-Z]{1,2})(\]\<.+)/gi,("$1"+new Date().getFullYear()+"/"+m+"/"+y+"$3")));
            }
            if(localStorage["nextPreen"]===undefined){localStorage["nextPreen"] = time+86400;}
            if(parseInt(localStorage["nextPreen"])<time){
                for(prop in localStorage){
                    if(prop.match(/_last/gi)){
                        if((parseInt(localStorage[prop])+604800)<=time){
                            delete localStorage[prop];
                            delete localStorage[(prop.replace("_last",""))];
                        }
                    }
                }
                localStorage.nextPreen = time+86400;
            }
        }
    }
};

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
