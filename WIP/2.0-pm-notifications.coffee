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
