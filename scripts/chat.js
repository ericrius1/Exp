//
//  chat.js
//
//  Created by David Rowe on 18 Mar 2015.
//  Copyright 2015 David Rowe.
//

var chatWindow = (function () {

    var WINDOW_WIDTH = 300,
        WINDOW_HEIGHT = 496,
        MARGIN = 12,
        FONT = { size: 12 },
        HEADING_COLOR = { red: 180, green: 180, blue: 180 },
        HEADING_ALPHA = 0.9,
        BODY_COLOR = { red: 240, green: 240, blue: 240 },
        BODY_ALPHA = 0.9,
        BACKGROUND_COLOR = { red: 80, green: 80, blue: 80 },
        BACKGROUND_ALPHA = 0.7,
        INPUT_BACKGROUND_COLOR = { red: 240, green: 240, blue: 240 },
        INPUT_BACKGROUND_ALPHA = 0.3,
        TRANSPARENT_ALPHA = 0.0,
        INPUT_LINES = 3,
        WINDOW_OFFSET = 80,                                     // Distance away from top and right of viewport

        isVisible,
        windowPane,
        historyPane,
        historyHeight,
        historyOffset,
        inputPane,
        inputHeight,
        inputOffset,
        viewportDimensions,

        hasFocus = false,
        chatCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+`1234567890-={}|[]\\:\";'<>?,./",
        BACKSLASH_KEY_CODE = 92,
        BACKSPACE_KEY_CODE = 16777219,
        ENTER_KEY_CODE = 16777220,
        ESCAPE_KEY_CODE = 16777216,
        SPACE_KEY_CODE = 32,
        cursorTimer = null,
        cursor,
        chatMessage = "",

        pollID = 0,
        POLL_URL = "http://ctrlaltstudio.com/chat/poll.aspx?",
        HTTP_POLL_TIMEOUT = 30000,                              // ms = 30s
        POLL_INTERVAL_VISIBLE = 5000,                           // ms = 5s
        POLL_INTERVAL_INVISIBLE = 30000,                        // ms = 30s
        pollTimer = null,
        pollRequest,
        pollRequestTimedOut,
        processMessages,
        POST_URL = "http://ctrlaltstudio.com/chat/post.aspx",
        HTTP_POST_TIMEOUT = 10000,                              // ms = 10s
        postMessage,
        postRequest,
        postRequestTimedOut,
        processPost,

        historyLines = [],
        maxHistoryLines,

        MENU_NAME = "Tools",
        MENU_ITEM = "Local Chat...",
        MENU_ITEM_AFTER = "Chat...";

    function captureEnterChatKey() {
        Controller.captureKeyEvents({ key: BACKSLASH_KEY_CODE });
    }

    function releaseEnterChatKey() {
        Controller.releaseKeyEvents({ key: BACKSLASH_KEY_CODE });
    }

    function captureExitChatKey() {
        Controller.captureKeyEvents({ key: ESCAPE_KEY_CODE });
    }

    function releaseExitChatKey() {
        Controller.releaseKeyEvents({ key: ESCAPE_KEY_CODE });
    }

    function captureChatKeys() {
        var i;

        for (i = 0; i < chatCharacters.length; i += 1) {
            Controller.captureKeyEvents({ text: chatCharacters.charAt(i) });
        }

        Controller.captureKeyEvents({ key: SPACE_KEY_CODE });
        Controller.captureKeyEvents({ key: BACKSPACE_KEY_CODE });
        Controller.captureKeyEvents({ key: ENTER_KEY_CODE });
    }

    function releaseChatKeys() {
        var i;

        for (i = 0; i < chatCharacters.length; i += 1) {
            Controller.releaseKeyEvents({ text: chatCharacters.charAt(i) });
        }

        Controller.releaseKeyEvents({ key: SPACE_KEY_CODE });
        Controller.releaseKeyEvents({ key: BACKSPACE_KEY_CODE });
        Controller.releaseKeyEvents({ key: ENTER_KEY_CODE });
    }

    function updateCursor() {
        if (cursor === "") {
            cursor = "|";
        } else {
            cursor = "";
        }
    }

    function setVisible(visible) {
        isVisible = visible;

        Overlays.editOverlay(windowPane, { visible: visible });
        Overlays.editOverlay(historyPane, { visible: visible });
        Overlays.editOverlay(inputPane, { visible: visible });
    }

    function setFocus(focus) {
        if (isVisible) {
            hasFocus = focus;
            if (hasFocus) {
                captureChatKeys();
                captureExitChatKey();
                cursorTimer = Script.setInterval(updateCursor, 500);
                cursor = "|";
            } else {
                releaseChatKeys();
                releaseExitChatKey();
                if (cursorTimer) {
                    Script.clearInterval(cursorTimer);
                }
            }
        }
    }

    function onMousePressEvent(event) {
        var clickedOverlay;

        clickedOverlay = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
        if (clickedOverlay === historyPane || clickedOverlay === inputPane) {
            if (!hasFocus) {
                setFocus(true);
                releaseEnterChatKey();
            }
        } else {
            if (hasFocus) {
                setFocus(false);
                captureEnterChatKey();
            }
        }
    }

    function onKeyPressEvent(key) {

        if ((!isVisible || !hasFocus) && key.key === BACKSLASH_KEY_CODE) {
            releaseEnterChatKey();
            setVisible(true);
            setFocus(true);
            return;
        }

        if (isVisible && key.key === ESCAPE_KEY_CODE) {
            if (hasFocus) {
                setFocus(false);
                captureEnterChatKey();
                setVisible(false);
            }
            return;
        }

        if (!isVisible || !hasFocus) {
            return;
        }

        if (key.text === "\r") {
            postMessage();
            return;
        }

        if (key.text === "BACKSPACE") {
            chatMessage = chatMessage.slice(0, chatMessage.length - 1);
            return;
        }

        if (key.text === "SPACE") {
            chatMessage += " ";
            return;
        }

        if (chatCharacters.indexOf(key.text) !== -1) {
            chatMessage += key.text;
            return;
        }
    }

    function updateOverlayPositions() {
        Overlays.editOverlay(windowPane, {
            x: viewportDimensions.x - WINDOW_WIDTH - WINDOW_OFFSET,
            y: WINDOW_OFFSET
        });
        Overlays.editOverlay(historyPane, {
            x: viewportDimensions.x - WINDOW_WIDTH - WINDOW_OFFSET + MARGIN,
            y: WINDOW_OFFSET + historyOffset
        });
        Overlays.editOverlay(inputPane, {
            x: viewportDimensions.x - WINDOW_WIDTH - WINDOW_OFFSET + MARGIN / 2,
            y: WINDOW_OFFSET + inputOffset
        });
    }

    function wrapText(message, overlay, width) {
        var messageLength,
            lines = [],
            startIndex = 0,
            spaceIndex,
            spaceFound = false,
            i;

        // Wraps at spaces if possible
        for (i = 0, messageLength = message.length; i < messageLength; i += 1) {
            if (message.charAt(i) === " ") {
                spaceIndex = i;
                spaceFound = true;
            } else {
                if (Overlays.textSize(overlay, message.slice(startIndex, i)).width > width) {
                    if (spaceFound) {
                        lines.push(message.slice(startIndex, spaceIndex));
                        startIndex = spaceIndex + 1;
                        spaceFound = false;
                    } else {
                        lines.push(message.slice(startIndex, i));
                        startIndex = i;
                    }
                }
            }
        }

        if (startIndex < message.length) {
            lines.push(message.slice(startIndex, message.length));
        }

        return lines;
    }

    function displayMessages() {
        var historyText,
            numLines,
            i;

        historyText = "";
        for (i = 0, numLines = historyLines.length; i < numLines; i += 1) {
            historyText += historyLines[i] + "\n";
        }

        Overlays.editOverlay(historyPane, { text: historyText });
    }

    function newMessage(user, message) {
        var messageLines,
            i;

        messageLines = wrapText("[" + user + "] " + message, historyPane, WINDOW_WIDTH - 2 * MARGIN);

        for (i = 0; i < messageLines.length; i += 1) {
            if (historyLines.length === maxHistoryLines) {
                historyLines.shift();
            }
            historyLines.push(messageLines[i]);
        }

        displayMessages();
    }

    function pollMessages() {
        var domainName,
            url;

        domainName = Window.location.hostname;

        if (domainName === "") {
            print("ERROR: Domain name is blank");  // HiFi domain name may not be resolved yet
            pollTimer = Script.setTimeout(pollMessages, isVisible ? POLL_INTERVAL_VISIBLE : POLL_INTERVAL_INVISIBLE);
            return;
        }

        if (!/^[a-zA-Z0-9\-]+$/.test(domainName)) {
            print("ERROR: Invalid domain name: " + domainName);  // May be IP address if HiFi domain name not resolved yet
            pollTimer = Script.setTimeout(pollMessages, isVisible ? POLL_INTERVAL_VISIBLE : POLL_INTERVAL_INVISIBLE);
            return;
        }

        if (domainName.toLowerCase() === "localhost") {
            print("ERROR: Can't chat on localhost");
            return;
        }

        pollRequest = new XMLHttpRequest();
        url = POLL_URL + "id=" + pollID + "&domain=" + domainName;
        pollRequest.open("GET", url, true);
        pollRequest.timeout = HTTP_POLL_TIMEOUT;
        pollRequest.ontimeout = pollRequestTimedOut;
        pollRequest.onreadystatechange = processMessages;
        pollRequest.send();
    }

    pollRequestTimedOut = function () {
        print("ERROR: Poll for chat messages timed out");
        pollTimer = Script.setTimeout(pollMessages, HTTP_POLL_TIMEOUT);
    };

    processMessages = function () {
        var response,
            lines,
            i,
            id,
            user,
            message;

        if (pollRequest.readyState === pollRequest.DONE) {
            if (pollRequest.status === 200) {
                response = pollRequest.responseText;
                if (response.length > 0) {
                    lines = response.replace(/\r/g, "").split("\n");
                    if (lines.length % 3 === 0) {
                        i = 0;
                        while (i < lines.length) {
                            id = parseInt(lines[i], 10);
                            user = lines[i + 1];
                            message = lines[i + 2];
                            if (id > pollID) {  // Guard against multiple poll requests repeating messages already received
                                pollID = id;
                                newMessage(lines[i + 1], lines[i + 2]);
                            }
                            i += 3;
                        }
                    } else {
                        print("ERROR: Poll for chat messages returned invalid number of lines: " + lines.length);
                        pollTimer = Script.setTimeout(pollMessages, HTTP_POLL_TIMEOUT);
                        return;
                    }
                }
            } else {
                print("ERROR: Poll for chat messages returned " + pollRequest.status + " " + pollRequest.statusText);
                pollTimer = Script.setTimeout(pollMessages, HTTP_POLL_TIMEOUT);
                return;
            }

            pollTimer = Script.setTimeout(pollMessages, isVisible ? POLL_INTERVAL_VISIBLE : POLL_INTERVAL_INVISIBLE);
        }
    };

    postMessage = function () {
        var domainName,
            userName,
            body;

        domainName = Window.location.hostname.toLowerCase();
        if (domainName === "") {
            print("ERROR: Unknown domain name");
            return;
        }

        if (domainName === "localhost") {
            print("ERROR: Can't chat on localhost");
            return;
        }

        userName = GlobalServices.username;
        if (userName === "") {
            print("ERROR: Unknown user name");
            return;
        }

        body = domainName + "\n" + userName + "\n" + chatMessage;

        postRequest = new XMLHttpRequest();
        postRequest.open("POST", POST_URL, true);
        postRequest.timeout = HTTP_POST_TIMEOUT;
        postRequest.ontimeout = postRequestTimedOut;
        postRequest.onreadystatechange = processPost;
        postRequest.send(body);
    };

    postRequestTimedOut = function () {
        print("ERROR: Post of chat message timed out");
    };

    processPost = function () {
        if (postRequest.readyState === postRequest.DONE) {
            if (postRequest.status === 200) {
                chatMessage = "";
                Script.clearTimeout(pollTimer);
                // A poll might already be in progress but poll again anyway.
                pollMessages();
            } else {
                print("ERROR: Post chat message returned " + postRequest.status + " " + postRequest.statusText);
            }
        }
    };

    function onScriptUpdate() {
        var message,
            oldViewportDimensions;

        if (!isVisible) {
            return;
        }

        // Update chat text
        message = chatMessage;
        if (hasFocus) {
            message += cursor;
        }
        message = wrapText(message, inputPane, WINDOW_WIDTH - 2 * MARGIN).join("\n") + " ";
        Overlays.editOverlay(inputPane, { text: message });

        // Update overlay positions
        oldViewportDimensions = viewportDimensions;
        viewportDimensions = Controller.getViewportDimensions();
        if (viewportDimensions.x !== oldViewportDimensions.x || viewportDimensions.y !== oldViewportDimensions.y) {
            updateOverlayPositions();
        }
    }

    function onDomainChanged() {
        // BUG: Window.domainChanged doesn't fire if you teleport to your own local domain on same PC.
        Script.clearTimeout(pollTimer);
        historyLines = [];
        displayMessages();
        pollID = 0;
        pollMessages();
    }

    function onMenuItemEvent(event) {
        if (event === MENU_ITEM) {
            setVisible(Menu.isOptionChecked(MENU_ITEM));
        }
    }

    function setUp() {
        var textSizeOverlay,
            textHeight,
            lineSpacing,
            lineHeight;

        textSizeOverlay = Overlays.addOverlay("text", { font: FONT, visible: false });
        textHeight = Math.floor(Overlays.textSize(textSizeOverlay, "X").height);
        lineSpacing = Math.floor(Overlays.textSize(textSizeOverlay, "X\nX").height - 2 * textHeight);
        lineHeight = textHeight + lineSpacing;
        Overlays.deleteOverlay(textSizeOverlay);

        inputHeight = INPUT_LINES * lineHeight - lineSpacing + MARGIN;
        historyHeight = WINDOW_HEIGHT - 3 * MARGIN - inputHeight - textHeight;
        historyOffset = textHeight + 2 * MARGIN;
        inputOffset = WINDOW_HEIGHT - inputHeight - 0.5 * MARGIN;

        maxHistoryLines = Math.floor(historyHeight / lineHeight);
        if (maxHistoryLines * lineHeight + textHeight <= historyHeight) {
            maxHistoryLines += 1;
        }

        windowPane = Overlays.addOverlay("text", {
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            topMargin: MARGIN,
            leftMargin: MARGIN,
            color: HEADING_COLOR,
            alpha: HEADING_ALPHA,
            backgroundColor: BACKGROUND_COLOR,
            backgroundAlpha: BACKGROUND_ALPHA,
            font: FONT,
            text: "Local Chat",
            visible: false
        });

        historyPane = Overlays.addOverlay("text", {
            width: WINDOW_WIDTH - 2 * MARGIN,
            height: historyHeight,
            topMargin: 0,
            leftMargin: 0,
            color: BODY_COLOR,
            alpha: BODY_ALPHA,
            backgroundColor: BACKGROUND_COLOR,
            backgroundAlpha: TRANSPARENT_ALPHA,
            font: FONT,
            text: "",
            visible: false
        });

        inputPane = Overlays.addOverlay("text", {
            width: WINDOW_WIDTH - MARGIN,
            height: inputHeight,
            topMargin: MARGIN / 2,
            leftMargin: MARGIN / 2,
            color: BODY_COLOR,
            alpha: BODY_ALPHA,
            backgroundColor: INPUT_BACKGROUND_COLOR,
            backgroundAlpha: INPUT_BACKGROUND_ALPHA,
            font: FONT,
            text: "",
            visible: false
        });

        viewportDimensions = Controller.getViewportDimensions();
        updateOverlayPositions();

        Window.domainChanged.connect(onDomainChanged);

        Controller.keyPressEvent.connect(onKeyPressEvent);
        Controller.mousePressEvent.connect(onMousePressEvent);

        captureEnterChatKey();
        setVisible(true);

        Menu.addMenuItem({
            menuName: MENU_NAME,
            menuItemName: MENU_ITEM,
            afterItem: MENU_ITEM_AFTER,
            isCheckable: true,
            isChecked: isVisible
        });
        Menu.menuItemEvent.connect(onMenuItemEvent);

        Script.update.connect(onScriptUpdate);

        pollMessages();
    }

    function tearDown() {
        Menu.removeMenuItem(MENU_NAME, MENU_ITEM);
        Script.clearTimeout(pollTimer);
        Script.clearInterval(cursorTimer);
        releaseChatKeys();
        releaseEnterChatKey();
        releaseExitChatKey();
        Overlays.deleteOverlay(inputPane);
        Overlays.deleteOverlay(historyPane);
        Overlays.deleteOverlay(windowPane);
    }

    setUp();
    Script.scriptEnding.connect(tearDown);
} ());