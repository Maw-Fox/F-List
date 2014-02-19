# Adds a notification in the browser tab title that you have unread private messages.
# If you wish to use this feature prior to it being pushed onto the 2.0 client live
# just copy this code and paste it into your browser's console within the F-Chat tab.
# Just keep in mind there could be minor bugs. Let me know if you find any.
# If you encounter any issues using this feature, you can remove it manually or
# refresh your page to get rid of it. To manually remove this feature, open your browser's
# console and delete the namespace associated with it by typing 'delete Kali' and pressing enter.
# Enjoy, and as always, have fun!
# @author Kali/Maw

FList.tNotice = tabTally: {}

focus = true # @define {Boolean} focus Global window focus variable

# Title draw function.
FList.tNotice.draw = ->
    document.title = "(#{@tabTally.sum}) F-list - Chat"

# Title tally function.
# @param {string} tab Current tab ID
FList.tNotice.newMsg = (tab) ->
    if tab in @tabTally
        @tabTally.tab++
    else
        @tabTally.tab = 1

    if sum in @tabTally
        @tabtally.sum++
    else
        @tabTally.sum = 1

    @draw()

# On focus, subtract total unread messages from newly viewed tab from the title, then draw.
# @param {string} tab Current tab ID
FList.tNotice.readMsg = (tab) ->
    @tabTally.sum -= @tabTally.tab
    delete this.tabTally.tab

    if @tabTally.sum
        @draw()
    else
        delete @tabTally.sum
        document.title = "F-list - Chat"

# Sets a global 'focus' variable, which sets a true/false value to check if the user is currently focused on this window.
# Checks if on focus will allow the person to read backlogged notifications.
window.onfocus = ->
    focus = true

    if FList.Chat.TabBar.activeTab.id.toLowerCase in FList.tNotice.tabTally
        FList.tNotice.readMsg FList.Chat.TabBar.activeTab.id.toLowerCase

# Sets the global focus variable to false
window.onblur = ->
    focus = false

# Hooks
FList.Chat.printMessage = (args) ->
    # Variable declaration
    scrollDown = false
    highlight  = false
    isDefault  = not args.to or args.to is {} or
                 args.to.id.toLowerCase() is @TabBar.activeTab.id.toLowerCase()
    classList  = "chat-message chat-type-#{args.type}"
    tabFocus   = @TabBar.activeTab.id.toLowerCase()
    time       = "#{new Date().getHours()}:#{new Date().getMinutes()}"
    regx       = new RegExp
    avClasses  = ""
    html       = ""
    tab        = {}
    showMode   = ""
    display    = ""

    # Argument defaulting/checking
    args.to  = if isDefault then @TabBar.activeTab else args.to

    args.log = if args.log then true else false

    if not args.from or not args.msg or not args.type
        throw "Mandatory arguments missing on printMessage call."

    # Let's do stuff!
    if args.from is @identity
        classList += " chat-type-own"

    if $("#chat-content-chatarea > div").prop("scrollTop") >=
       ($("#chat-content-chatarea > div").prop("scrollHeight") -
       $('#chat-content-chatarea > div').height() - 50)
            scrollDown = true

    if args.msg.substring(0, 6) is "/warn " and args.to.type is "channel"
        if @opList.indexOf(args.from) isnt -1 or
           @channels.getData(args.to.id).oplist.indexOf(args.from) isnt -1
                args.msg = args.msg.substring(6)
                classList += " chat-type-warn"

    args.msg = @processMessage(args.to.type, args.type, args.msg)

    if @Settings.current.highlightMentions and
       args.type is "chat" or args.type isnt "ad" or args.type isnt "rp"
            for highlighted in @Settings.current.highlightWords
                regx = new RegExp "\\b#{highlighted}('s)?\\b", "i"
                if regx.test(args.msg) and args.from isnt @identity and args.to.type is "channel"
                    highlight = true
                    break

                regx = new RegExp "\\b#{@identity}('s)?\\b", "i"
                if regx.test(args.msg) and args.from isnt @identity and args.to.type is "channel"
                    highlight = true
                    break

    if highlight
        classList += " chat-type-mention"

    avatarClasses = @getPrintClasses args.from, if args.to.type is channel then args.to.id else false

    if args.type isnt "chat" and args.type isnt "ad" and args.type isnt "rp"
        avatarClasses = ""

    if args.type is "rp"
        html = "<div class=\"#{classList}\"><span class='timestamp'>[#{time}]</span> " +
               "<i><span class=\"#{avClasses}\"><span class='rank'></span>" +
               "#{args.from}</span>#{args.msg}</i></div>"

    if args.type is "chat" or args.type is "error" or args.type is "system" or ars.type is "ad"
        html = "<div class=\"#{classList}\"><span class=\"timestamp\">[#{time}]" +
               "</span> <span class=\"#{avCLasses}\"><span class='rank'></span>" +
               "#{args.from}</span>: #{args.msg}</div>"

    tab = @TabBar.getTabFromId args.to.type, args.to.id

    showmode = if args.to.type is "channel" then @channels.getData(args.to.id).userMode else "both"

    display = if (showmode is "ads" and (args.type is "chat" or args.type is "rp")) or
                 (showmode is "chat" and args.type is "ad") then false else true;

    if isDefault and display
        if not tab.logs.length
            $("#chat-content-chatarea > div").html("")

        $("#chat-content-chatarea > div").append(html);
        if not scrollDown
            @scrollDown()

        @truncateVisible()
    if not isDefault or not @focused
        if args.to.type is "channel" and display
            tab.pending++
            if highlight
                tab.mentions++
                if @Settings.current.html5Audio
                    @Sound.playSound "attention"

                if @Settings.current.html5Notifications
                    @Notifications.message(
                        "A word/name was highlighted, by #{args.from} in #{args.to.id}",
                        args.msg.substring(0,100),
                        "#{staticdomain}images/avatar/#{args.from.toLowerCase()}.png",
                        -> @TabBar.setActive args.to.type, args.to.id
                    )

            if args.to.type is "user"
                if args.type is "chat" or args.type is "rp"
                    tab.mentions++
                    if @Settings.current.html5Audio
                        this.Sound.playSound "attention"

                    if @Settings.current.html5Notifications
                        @Notifications.message(
                            "You received a private message from #{args.from}",
                            args.msg.substring(0,100),
                            "#{staticdomain}images/avatar/#{args.from.toLowerCase()}.png",
                            -> @TabBar.setActive(args.to.type, args.to.id);
                        )

                else
                    tab.pending++

    if args.log
        tab.logs.push {"type": args.type, "by": args.from, "html": html}
        if not @Settings.current.enableLogging
            if tab.logs.length > @Settings.current.visibleLines
                tab.logs.shift();

    @Logs.Store tab

    if args.from.toLowerCase() isnt "system" and
       (args.type is "user" or highlight) and
       (not focus or tabFocus isnt args.to.id.toLowerCase())
            FList.tNotice.newMsg(args.to.id.toLowerCase())