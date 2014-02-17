FList.Chat.Input = {

	getParaList: function(parastring, num_parameters){
		var paralist=[];
		var seperator="\"";
		if(parastring.indexOf("\"")==-1) seperator=" ";
		var curchar="";var lastchar;var parastart=-1;
		for(var i =0;i<parastring.length;i++){
            lastchar=curchar;
            curchar=parastring[i];
            if(lastchar!=="\\"){
                if(curchar==seperator){
                    if(parastart==-1) {
                        parastart=i;
                    } else {
                        paralist.push(parastring.substring(parastart+1,i));
                        parastart=-1;
                    }

                }
            }
        }
        if(parastart==-1 && paralist.length==0 && parastring.length>0){
            paralist.push(parastring);
        }
		if(num_parameters==1 && seperator==" ") {
			paralist=[];
			paralist.push(parastring);
		}
		return paralist;
	},

    parseCommand: function(line){
        line=line.substring(1);
        var command=line.split(" ")[0];
		var num_parameters=FList.Chat.helpData[command].syntax.length;
        var paralist=FList.Chat.Input.getParaList(line.substring(command.length+1), num_parameters);
        return {"name":command,"parameters":paralist};
    },

    handleCommand: function(command, message){
        var error=false;
        FList.Chat.printMessage(FList.Chat.Input.sanitize(message), FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, FList.Chat.identity, "exact", "system", true);
        switch(command.name){
            case "uptime":
                FList.Connection.send("UPT");
            break;
            case "close":
                if(FList.Chat.TabBar.activeTab.type!=="console"){
                    FList.Chat.TabBar.closeTab(FList.Chat.TabBar.activeTab.tab);
                }
            break;
            case "priv":
                if(command.parameters.length==1){
                    var data=FList.Chat.users.getData(command.parameters[0]);
                    if(data.status=="Offline"){
                        error=true;
                        FList.Common_displayError("This user is currently offline, or doesn't exist.");
                    } else {
                        FList.Chat.openPrivateChat(data.name, false);
                    }
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "join":
                if(command.parameters.length==1){
                    FList.Chat.openChannelChat(command.parameters[0], false);
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
			case "listops":
				var opstring="";
				$.each(FList.Chat.opList, function(i, some_op){
					opstring=opstring+"[user]"+some_op+"[/user], ";
				});
				opstring=opstring.substring(0,opstring.length-2);
                FList.Chat.printMessage("Ops: " + opstring, FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
            break;
            case "coplist":
                if(FList.Chat.TabBar.activeTab.type=="channel"){
                    FList.Connection.send("COL " + JSON.stringify({channel: FList.Chat.TabBar.activeTab.id}));
                } else {
                    error=true;
                    FList.Chat.printMessage("You must be in a channel to use this command.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            
            break;
            case "status":
                if(command.parameters.length==2){
                    if (typeof(command.parameters[1]) != "undefined" && command.parameters[1].length > 255) {
                        error=true;
                        FList.Chat.printMessage("The status message cannot be more than 255 characters long.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                    else {
                        FList.Connection.send("STA " + JSON.stringify({ status: command.parameters[0], statusmsg: command.parameters[1] }));
                        }
                } else if(command.parameters.length==1) {
                        FList.Connection.send("STA " + JSON.stringify({ status: command.parameters[0], statusmsg: FList.Chat.Status.lastStatus.statusMessage }));
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires two parameters. Status, and status message.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "reward":
                if(command.parameters.length==1){
                    var data=FList.Chat.users.getData(command.parameters[0]);
                    if(data.status=="Offline"){
                        error=true;
                        FList.Common_displayError("This user is currently offline, or doesn't exist.");
                    } else {
                        FList.Connection.send("RWD " + JSON.stringify({ character: data.name }));
                    }
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "timeout":
                if(command.parameters.length==3){
                    FList.Connection.send("TMO " + JSON.stringify({ time: command.parameters[1], character: command.parameters[0], reason: command.parameters[2] }));
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires three parameters, name, minutes, reason.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "ctimeout":
                if(command.parameters.length==2){
                    if(FList.Chat.TabBar.activeTab.type=="channel") {
                        var channel = FList.Chat.TabBar.activeTab.id;
                        FList.Connection.send("CTU " + JSON.stringify({ channel: channel, character: command.parameters[0], length: command.parameters[1] }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("You can only time people out in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires two parameters, name, length(minutes).", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "kick":
                if(command.parameters.length==2){//kick name channel
                    FList.Chat_send("CKU " + JSON.stringify({channel: command.parameters[0], character: command.parameters[1]}));
                } else {//kick name
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Chat_send("CKU " + JSON.stringify({channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0]}));
                    }
                }
            
            break;
            case "unban":
                if(command.parameters.length==2){
                    FList.Connection.send("CUB " + JSON.stringify({ channel: command.parameters[0], character: command.parameters[1] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("CUB " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0] }));
                    }
                }
            break;
            case "gunban":
                if(command.parameters.length==1){
                    FList.Connection.send("UNB " + JSON.stringify({ character: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("UNB " + JSON.stringify({ character: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "altwatch":
                if(command.parameters.length==1){
                    FList.Connection.send("AWC " + JSON.stringify({ character: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("AWC " + JSON.stringify({ character: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "roll":
                if(command.parameters.length==1){
                    if(FList.Chat.TabBar.activeTab.type=="channel") {
                        var channel = FList.Chat.TabBar.activeTab.id;
                        //var dice=command.parameters[0].substr(6); // This vestigial line screwed up /roll. Delete it once it's tested and /roll works fine.
                        var dice = command.parameters[0].replace(/ /g, "");
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
                            FList.Connection.send("RLL " + JSON.stringify({ channel: channel, dice: dice }));
                        } else {
                            error = true;
                            FList.Chat.printMessage("Wrong dice format. Dice format is throw+throw+throw+..., where a throw is either [1-9]d[2-100] or just a number to be added.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                        }
                    } else {
                        error=true;
                        FList.Chat.printMessage("You can only roll dice in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "bottle":
                if(FList.Chat.TabBar.activeTab.type=="channel") {
                    FList.Connection.send("RLL " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, dice: "bottle" }));
                } else {
                    error = true;
                    FList.Chat.printMessage("You can only roll dice in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "setowner":
                if(command.parameters.length==2){
                    FList.Connection.send("CSO " + JSON.stringify({ channel: command.parameters[0], character: command.parameters[1] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("CSO " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0] }));
                    }
                }
            break;
            case "ignore":
                if(command.parameters.length==1){
                    FList.Connection.send("IGN " + JSON.stringify({ "action": "add", "character": command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("IGN " + JSON.stringify({ "action": "add", "character": FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "ignorelist":
                if(FList.Chat.ignoreList.length>0){
                    var userstring="";
                    $.each(FList.Chat.ignoreList, function(i,item){
                        userstring+="[user]" + item + "[/user], ";
                    });
                    FList.Chat.printMessage("You are ignoring: " + userstring.substring(0,userstring.length-2), FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                } else {
                    FList.Chat.printMessage("You aren't ignoring anyone.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                }
            break;
            case "unignore":
                if(command.parameters.length==1){
                    FList.Connection.send("IGN " + JSON.stringify({ "action": "delete", "character": command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("IGN " + JSON.stringify({ "action": "delete", "character": FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "makeroom":
                if(command.parameters.length==1){
                    FList.Connection.send("CCR " + JSON.stringify({ channel: command.parameters[0] }));
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "op":
                if(command.parameters.length==1){
                    FList.Connection.send("AOP " + JSON.stringify({ character: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                         FList.Connection.send("AOP " + JSON.stringify({ character: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "deop":
                if(command.parameters.length==1){
                    FList.Connection.send("DOP " + JSON.stringify({ character: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                         FList.Connection.send("DOP " + JSON.stringify({ character: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "reload":
                if(command.parameters.length==1){
                    var word = command.parameters[0];
                    var o = {};
                    if (word == "save") o.save = "yes";
                    FList.Connection.send("RLD " + JSON.stringify(o));
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "cop":
                if(command.parameters.length==2){
                    FList.Connection.send("COA " + JSON.stringify({ channel: command.parameters[0], character: command.parameters[1] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                         FList.Connection.send("COA " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0] }));
                    }
                }
            break;
            case "cdeop":
                if(command.parameters.length==2){
                    FList.Connection.send("COR " + JSON.stringify({ channel: command.parameters[0], character: command.parameters[1] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                         FList.Connection.send("COR " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0] }));
                    }
                }
            break;
            case "closeroom":
                if(command.parameters.length==1){
                    FList.Connection.send("RST " + JSON.stringify({ channel: command.parameters[0], status: "private" }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type=="channel") {
                        FList.Connection.send("RST " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, status: "private" }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
                break;
            case "openroom":
                if(command.parameters.length==1){
                    FList.Connection.send("RST " + JSON.stringify({ channel: command.parameters[0], status: "public" }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type=="channel") {
                        FList.Connection.send("RST " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, status: "public" }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
            break;
            case "banlist":
                if(command.parameters.length==1){
                    FList.Connection.send("CBL " + JSON.stringify({ channel: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type=="channel") {
                        FList.Connection.send("CBL " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
            break;
            case "killchannel":
                if(command.parameters.length==1){
                    FList.Connection.send("KIC " + JSON.stringify({ channel: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("KIC " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "createchannel":
                if(command.parameters.length==1){
                    FList.Connection.send("CRC " + JSON.stringify({ channel: command.parameters[0] }));
                } else {
                    error=true;
                    FList.Chat.printMessage("This command requires one parameter.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "soundon":
                FList.Chat.Settings.current.html5Audio=true;
                FList.Chat.Settings.save();
                FList.Chat.printMessage("HTML5 audio sound effects are now [b]on[/b].", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
            break;
            case "soundoff":
                FList.Chat.Settings.current.html5Audio=false;
                FList.Chat.Settings.save();
                FList.Chat.printMessage("HTML5 audio sound effects are now [b]off[/b].", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
            break;
            case "leave":
                if(command.parameters.length==1){
                    FList.Connection.send("LCH " + JSON.stringify({ channel: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="channel"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("LCH " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "kinks":
                if(command.parameters.length==1){
                    FList.Connection.send("KIN " + JSON.stringify({ "character": command.parameters[0]  }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("KIN " + JSON.stringify({ "character": FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "profile":
                if(command.parameters.length==1){
                    FList.Connection.send("PRO " + JSON.stringify({ "character": command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type!=="user"){
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    } else {
                        FList.Connection.send("PRO " + JSON.stringify({ "character": FList.Chat.TabBar.activeTab.id }));
                    }
                }
            break;
            case "accountban":
                FList.Connection.send("ACB " + JSON.stringify({ character: command.parameters[0] }));
            break;
            case "prooms":
                FList.Chat.getORS=true;
                FList.Connection.send("ORS");
            break;
            case "channels":
                FList.Chat.getCHA=true;
                FList.Connection.send("CHA");
            break;
            case "broadcast":
                FList.Connection.send("BRO " + JSON.stringify({ message: command.parameters[0] }));
            break;
            case "setmode":
                if(command.parameters.length==1){
                    if(FList.Chat.TabBar.activeTab.type=="channel"){
                        FList.Connection.send("RMO " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, mode: command.parameters[0] }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
                if(command.parameters.length==2){
                    FList.Connection.send("RMO " + JSON.stringify({ channel: command.parameters[0], mode: command.parameters[1] }));
                }
            break;
            case "getdescription":
            if(FList.Chat.TabBar.activeTab.type=="channel"){
				var description = nl2br(FList.Chat.channels.getData(FList.Chat.TabBar.activeTab.id).description);
                FList.Chat.printMessage("[noparse]" + description + "[/noparse]", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
			} else {
				error=true;
                FList.Chat.printMessage("You are not in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
			}
            break;
            case "setdescription":
                if(command.parameters.length==1){
                    if(FList.Chat.TabBar.activeTab.type=="channel"){
                        FList.Connection.send("CDS " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, description: command.parameters[0] }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
                if(command.parameters.length==2){
                    FList.Connection.send("CDS " + JSON.stringify({ channel: command.parameters[0], description: command.parameters[1] }));
                }
            break;
            case "gkick":
                if(command.parameters.length==1){
                    FList.Connection.send("KIK " + JSON.stringify({ character: command.parameters[0] }));
                } else {
                    if(FList.Chat.TabBar.activeTab.type=="user") {
                        FList.Connection.send("KIK " + JSON.stringify({ character: FList.Chat.TabBar.activeTab.id }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command without a parameter only works if you are in a private chat tab.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
            break;
            case "logout":
                FList.Connection.ws.close();
            break;
            case "invite":
                if(command.parameters.length==1){
                    if(FList.Chat.TabBar.activeTab.type=="channel"){
                        FList.Connection.send("CIU " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, character: command.parameters[0] }));
                    } else {
                        error=true;
                        FList.Chat.printMessage("Using this command with one parameter only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                    }
                }
                if(command.parameters.length==2){
                    FList.Connection.send("CIU " + JSON.stringify({ channel: command.parameters[0], character: command.parameters[1] }));
                }
            break;
            case "code":
                if(FList.Chat.TabBar.activeTab.type=="channel") {
                    var channeldata=FList.Chat.channels.getData(FList.Chat.TabBar.activeTab.id);
                    var bbcode = "";
                    if(FList.Chat.TabBar.activeTab.id.toLowerCase().substring(0,4)=="adh-"){
                        bbcode="[session=" + channeldata.title + "]" + FList.Chat.TabBar.activeTab.id + "[/session]";
                    } else {
                        bbcode="[channel]" + FList.Chat.TabBar.activeTab.id + "[/channel]";
                    }
                    FList.Chat.printMessage("BBCode: [noparse]" +  bbcode + "[/noparse]", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                } else {
                    error=true;
                    FList.Chat.printMessage("You have to be in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "who":
                 if(FList.Chat.TabBar.activeTab.type=="channel"){
                    //todo
                    var namestring="";
                    $.each(FList.Chat.channels.getData(FList.Chat.TabBar.activeTab.id).userlist, function(i,user){
                        namestring=namestring + "[user]" + user + "[/user], ";
                    });
                    FList.Chat.printMessage(namestring.substring(0,namestring.length-2), FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                } else {
                    error=true;
                    FList.Chat.printMessage("Using this command only works if you are in a channel.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                }
            break;
            case "users":
                var namestring="";
                $.each(FList.Chat.users.list, function(i,user){
                    namestring=namestring + "[user]" + user + "[/user], ";
                });
                FList.Chat.printMessage("Users in the chat: " + namestring.substring(0,namestring.length-2), FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
            break;
            case "help":
                if(command.parameters.length==1){
                    if(command.parameters[0].toLowerCase() in FList.Chat.helpData){
                        var helpcmd=command.parameters[0].toLowerCase();
                        var syntaxhelp="";
                        for(var i in FList.Chat.helpData[helpcmd].syntax){
                            syntaxhelp+=" &lt;<i>" + FList.Chat.helpData[helpcmd].syntax[i] + "</i>&gt; ";
                        }
                        var helpstring="[b]/" + helpcmd + "[/b] " + syntaxhelp + "\n" + FList.Chat.helpData[helpcmd].description + "\n";
                        FList.Chat.printMessage(helpstring, FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                    } else {
                        error=true;
                        FList.Chat.printMessage("No such command was found in the help data.", FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "error", true);
                     }
                } else {
                    var helpstring="";
                    for(var command in FList.Chat.helpData){
                        if(jQuery.inArray("all",FList.Chat.helpData[command].rights)>-1 || (jQuery.inArray("admin",FList.Chat.helpData[command].rights)>-1 && FList.Rights.has("admin")) || (jQuery.inArray("chatop",FList.Chat.helpData[command].rights)>-1 && FList.Rights.has("chat-chatop")) ||  (jQuery.inArray("chanop",FList.Chat.helpData[command].rights)>-1 && (FList.Chat.isChanop(FList.Chat.TabBar.activeTab.id) && FList.Chat.TabBar.activeTab.type=="channel")) ||  (jQuery.inArray("owner",FList.Chat.helpData[command].rights)>-1 && FList.Chat.isChanOwner())){

                            var syntaxhelp="";
                            for(var i in FList.Chat.helpData[command].syntax){
                                syntaxhelp+=" &lt;<i>" + FList.Chat.helpData[command].syntax[i] + "</i>&gt; ";
                            }
                            if(syntaxhelp!=="") syntaxhelp=" <i>" + syntaxhelp + "</i>";

                            helpstring+="[b]/" + command + "[/b] " + syntaxhelp + "\n";
                        }
                    }
                    FList.Chat.printMessage(helpstring, FList.Chat.TabBar.activeTab.type, FList.Chat.TabBar.activeTab.id, "System", "exact", "system", true);
                }
                //unimplemented
            break;
            case "clear":
                FList.Chat.TabBar.activeTab.logs=[];
                FList.Chat.TabBar.printLogs(FList.Chat.TabBar.activeTab, FList.Chat.TabBar.activeTab.type =="channel" ? FList.Chat.channels.getData(FList.Chat.TabBar.activeTab.id).userMode : "both");
            break;
            default:
                error=true;
                FList.Common_displayError("Unimplemented command.");
            break;
        }
        if(!error){
            $("#message-field").val("");
        }
    },

    handle: function(message){
        switch(FList.Chat.TabBar.activeTab.type){
            case "console":
                if(message.substring(0,1)=="/" && !FList.Chat.Roleplay.isRoleplay(message)){
                    this.handleCommand(this.parseCommand(message),message);
                } else {
                    FList.Common_displayError("You cannot chat in the console.");
                }
            break;
            case "channel":
                if(message.substring(0,1)=="/" && !FList.Chat.Roleplay.isRoleplay(message) && message.substring(0,6)!=="/warn "){
                    this.handleCommand(this.parseCommand(message),message);
                } else {
                    var channeldata=FList.Chat.channels.getData(FList.Chat.TabBar.activeTab.id);
                    if(channeldata.mode=="ads"){
                        FList.Chat.Roleplay.sendAd(FList.Chat.TabBar.activeTab.id, message);
                    } else {
                        if(jQuery.trim(message).length>0){
                            if(FList.Chat.Settings.current.html5Audio) FList.Chat.Sound.playSound("chat");
                            FList.Connection.send("MSG " + JSON.stringify({ channel: FList.Chat.TabBar.activeTab.id, message: message }));
                            FList.Chat.printMessage(FList.Chat.Input.sanitize(FList.Chat.Roleplay.isRoleplay(message) ? message.substring(3) : message), "channel", FList.Chat.TabBar.activeTab.id, FList.Chat.identity, "exact", FList.Chat.Roleplay.isRoleplay(message) ? "rp" : "chat", true);
                            $("#message-field").val("");
                        }
                    }
                }
            break;
            case "user":
                if(message.substring(0,1)=="/" && !FList.Chat.Roleplay.isRoleplay(message)){
                    this.handleCommand(this.parseCommand(message),message);
                } else {
                    if(jQuery.trim(message).length>0){
                        if(FList.Chat.Settings.current.html5Audio)  FList.Chat.Sound.playSound("chat");
                        FList.Connection.send("PRI " + JSON.stringify({ recipient: FList.Chat.TabBar.activeTab.id, "message": message }));
                        FList.Chat.printMessage(FList.Chat.Input.sanitize(FList.Chat.Roleplay.isRoleplay(message) ? message.substring(3) : message), "user", FList.Chat.TabBar.activeTab.id, FList.Chat.identity, "exact", FList.Chat.Roleplay.isRoleplay(message) ? "rp" : "chat", true);
                        $("#message-field").val("");
                        FList.Chat.TabBar.activeTab.metyping = false;
                        FList.Chat.TabBar.activeTab.mewaiting = true;
                    }
                }
            break;
        }
    },

    sanitize: function(line)//used for messages FROM yourself, printed to yourself.
    {
        return line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    truncate: function(text, maxchars) {
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
    }

};
