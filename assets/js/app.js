// firebase info
const firebaseConfig = {
    apiKey: "AIzaSyC04jRed-fylSuo6kfm3DU40fw8qYuw1FU",
    authDomain: "supernachoninja.firebaseapp.com",
    databaseURL: "https://supernachoninja.firebaseio.com",
    projectId: "supernachoninja",
    storageBucket: "supernachoninja.appspot.com",
    messagingSenderId: "3050108225",
    appId: "1:3050108225:web:0356566449ac56821a9dc0"
};
// this is required - throws console errors if not in place 
firebase.initializeApp(firebaseConfig);
// this is not the actual data - pointer to data location
let db = firebase.database();

// *************************************************** //

$(document).ready(function () {

    // grabs data - listens for changes to data
    db.ref("chat/").on("child_added", function (snapshot) {
        let dataOutput = "<div class='return'><hr>" +
            "<p class='name' style='color:" + snapshot.child("uColor").val() + "'>" + 
                snapshot.child("name").val() + "</p>" +
            "<p class='message' style='color:" + snapshot.child("tColor").val() + "'>" + 
                snapshot.child("message").val() + "</p>" +
            "</div>";
        $(".chat-output").html($(".chat-output").html() + dataOutput);
    });

    let username = "";
    // click to get username
    $(".username-button").on("click", function (event) {
        if ($(".username-input").val().trim() === "") {
            $(".name-enter-prompt").text("Please enter a valid username");
        } else {
            username = $(".username-input").val().trim();
            $(".screen").toggleClass("hide unhide");
            $(".greeting").html("<h3>Greetings " + username + "!</h3>");
        }
    });

    // click to send a chat
    $(".enter-chat-button").on("click", function (event) {
        if ($(".chat-input").val().trim() === "") {
            $(".enter-chat-button").text("error");
            setTimeout(function () {
                $(".enter-chat-button").text("Submit");
            }, 400);
        } else {
            sendChatter();
        }
    });

    // listen for enterkey - send chat
    $(document).on("keydown", function (event) {
        let primed = $(".chat-input").val().trim();
        if (event.keyCode === 13 && primed !== "") {
            sendChatter();
        }
    });

    function sendChatter() {
        let chatOut = $(".chat-input").val().trim();
        // sent chat to db
        db.ref("chat/" + Date.now()).set({
            name: username,
            message: chatOut,
            uColor: uColorValue,
            tColor: tColorValue
        });
        $(".chat-input").val("");
    }

    // clear out all chat content - user/server
    $(".clear-button").on("click", function () {
        // server side clear
        db.ref("chat/").remove();
        // client side clear
        $(".chat-output").html("");
    });


    let uColorValue = "lightgray";
    // process username color selection
    $(".u-color").on("click", function (event) {
        // clears currently selected
        $(".u-color").removeClass("color-selected");
        // selects new 
        $(this).addClass("color-selected");
        // preps for db
        uColorValue = $(this).attr("value");
    });

    let tColorValue = "lightgray";
    // process text color selection
    $(".t-color").on("click", function (event) {
        // clears currently selected
        $(".t-color").removeClass("color-selected");
        // selects new 
        $(this).addClass("color-selected");
        // preps for db
        tColorValue = $(this).attr("value");
    });
});