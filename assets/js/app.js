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
// battle card states object used for user-feedback on the battelground
let battleCard = {
    waiting: "<div class='card-text'>waiting for selection</div>",
    ready: "<div class='card-text'>Ready for Battle</div>",
    rock: "<i class='fas fa-hand-rock t-orange b-card'></i>",
    paper: "<i class='fas fa-hand-paper t-blue b-card'></i>",
    scissors: "<i class='fas fa-hand-scissors t-pink b-card'></i>"
};

// runs js after document loads
$(document).ready(function () {

    // set battle card status
    db.ref("playerSlotLeft/battleCardStatus").on("value", function (snapshot) {
        let update = snapshot.val();
        $(".b-left").html(update);
    });
    db.ref("playerSlotRight/battleCardStatus").on("value", function (snapshot) {
        let update = snapshot.val();
        $(".b-right").html(update);
    });

    // grabs chat data - listens for changes to data
    db.ref("chat/").on("child_added", function (snapshot) {
        let dataOutput = "<div class='return'><hr>" +
            "<p class='name' style='color:" + snapshot.child("uColor").val() + "'>" +
            snapshot.child("name").val() + "</p>" +
            "<p class='message' style='color:" + snapshot.child("tColor").val() + "'>" +
            snapshot.child("message").val() + "</p>" +
            "</div>";
        $(".chat-output").html($(".chat-output").html() + dataOutput);
    });

    // grabs player slot status data - updates screen
    db.ref("playerSlotLeft/isTaken").on("value", function (snapshot) {
        if (snapshot.val() === true) {
            $(".left-username-input").prop("disabled", true);
            $(".left-status").text("Occupied");
            $(".left-username-button").removeClass("btn").addClass("btn-o");
            $(".left-username-button").text("-----");
        } else {
            $(".left-username-input").prop("disabled", false);
            $(".left-status").text("slot-open");
            $(".left-username-button").removeClass("btn-o").addClass("btn");
            $(".left-username-button").text("Submit");
        }
    });
    // grabs player slot status data - updates screen
    db.ref("playerSlotRight/isTaken").on("value", function (snapshot) {
        if (snapshot.val() === true) {
            $(".right-username-input").prop("disabled", true);
            $(".right-status").text("Occupied");
            $(".right-username-button").removeClass("btn").addClass("btn-o");
            $(".right-username-button").text("-----");
        } else {
            $(".right-username-input").prop("disabled", false);
            $(".right-status").text("slot-open");
            $(".right-username-button").removeClass("btn-o").addClass("btn");
            $(".right-username-button").text("Submit");
        }
    });

    let _username = "";
    // l and r side used for playAgain
    let l_side = false;
    let r_side = false;

    // visitor login
    $(".visitor-username-button").on("click", function (event) {
        if ($(".visitor-username-input").val().trim() === "") {
            $(".visitor-enter-prompt").html(
                "<div class='t-orange'>Visitor Slot: Please enter a valid username</div>");
        } else {
            // sets username in game area
            setNamesInGameArea();

            _username = $(".visitor-username-input").val().trim();
            $(".screen").toggleClass("hide unhide");
            $(".user-login-status").html(
                _username + "(visitor) :: <span class='t-pink exit'>Exit</span>");
            $(".rps-icon").removeClass("pl-btn pr-btn t-orange t-blue t-pink");
            $(".rps-icon").addClass("t-gray");
        }
    });

    // left-side player login
    $(".left-username-button").on("click", function (event) {
        // checks for valid input
        if ($(".left-username-input").val().trim() === "") {
            $(".left-enter-prompt").html(
                "<div class='t-orange'>Player Slot - Left: Please enter a valid username</div>");
        } else {
            // sets username
            _username = $(".left-username-input").val().trim();
            // update db with player login info
            db.ref().child("playerSlotLeft").update({
                isTaken: true,
                username: _username
            });
            // moves user to screen 2 (game / chat)
            $(".screen").toggleClass("hide unhide");
            // sets username in game area
            setNamesInGameArea();
            // set username on chat area
            $(".user-login-status").html(
                _username + "(PL Slot) :: <span class='t-pink exit'>Exit</span>");
            // grays and disables right side player buttons 
            $(".r-btn").removeClass("pr-btn t-orange t-blue t-pink");
            $(".r-btn").addClass("t-gray");
            l_side = true;
        }
        // reset data on disconnect
        db.ref("playerSlotLeft").onDisconnect().update({
            isTaken: false,
            battleCardStatus: battleCard.waiting,
            rpsChoice: "",
            username: "",
            wins: 0
        });
    });

    // reset RPScount and remaining player wins, if a player disconnects
    db.ref("playerSlotLeft/isTaken").on("value", function (snapshot) {
        let l_isTaken = snapshot;
        let l_ = l_isTaken.val();
        if (l_ === false) {
            db.ref().update({
                RPScount: 0
            });
            db.ref("playerSlotRight").update({
                wins: 0
            });
        }
    });
    
    // reset RPScount and remaining player wins, if a player disconnects
    db.ref("playerSlotRight/isTaken").on("value", function (snapshot) {
        let r_isTaken = snapshot;
        let r_ = r_isTaken.val();
        if (r_ === false) {
            db.ref().update({
                RPScount: 0
            });
            db.ref("playerSlotLeft").update({
                wins: 0
            });
        }
    });

    // right-side player login
    $(".right-username-button").on("click", function (event) {
        // checks for valid input
        if ($(".right-username-input").val().trim() === "") {
            $(".right-enter-prompt").html(
                "<div class='t-orange'>Player Slot - Right: Please enter a valid username</div>");
        } else {
            // sets username
            _username = $(".right-username-input").val().trim();
            // update db with player login info
            db.ref().child("playerSlotRight").update({
                isTaken: true,
                username: _username
            });
            // moves user to screen 2 (game / chat)
            $(".screen").toggleClass("hide unhide");
            // sets username in game area
            setNamesInGameArea();
            // set username on chat area
            $(".user-login-status").html(
                _username + "(PR Slot) :: <span class='t-pink exit'>Exit</span>");
            // grays and disables right side player buttons 
            $(".l-btn").removeClass("pl-btn t-orange t-blue t-pink");
            $(".l-btn").addClass("t-gray");
            r_side = true;
        }

        // reset data on disconnect
        db.ref("playerSlotRight").onDisconnect().update({
            isTaken: false,
            battleCardStatus: battleCard.waiting,
            rpsChoice: "",
            username: "",
            wins: 0
        });
    });

    // displays names for right and left side players from the db 
    function setNamesInGameArea() {
        db.ref("playerSlotLeft").on("value", function (snapshot) {
            let db_username = snapshot.child("username").val();
            $(".player-l-username").text(db_username);
        });
        db.ref("playerSlotRight").on("value", function (snapshot) {
            let db_username = snapshot.child("username").val();
            $(".player-r-username").text(db_username);
        });
    }

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
            name: _username,
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

    // user program exit
    $(document).on("click", ".exit", function () {
        location.reload();
    });

    // battle logic //
    // keeps only the selected color, grays the others
    function isolateSelection(vOf, iClass) {
        $(iClass).each(function () {
            if ($(this).attr("value") !== vOf) {
                $(this).removeClass("t-orange t-blue t-pink");
                $(this).addClass("t-gray");
            }
        });
    }

    // left side player selection
    let l_selectionMade = false;
    $(".l-btn").on("click", function (event) {
        if (l_selectionMade === false && l_side === true) {
            // get the value of the clicked button
            let valueOf = $(this).attr("value");
            let sClass = ".l-btn";
            // update db with player selection
            db.ref().child("playerSlotLeft").update({
                rpsChoice: valueOf
            });
            isolateSelection(valueOf, sClass);
            l_selectionMade = true;
            // update card status in db
            db.ref().child("playerSlotLeft").update({
                battleCardStatus: battleCard.ready
            });
        }
    });

    // right side player selection
    let r_selectionMade = false;
    $(".r-btn").on("click", function (event) {
        if (r_selectionMade === false && r_side === true) {
            // get the value of the clicked button
            let valueOf = $(this).attr("value");
            let sClass = ".r-btn";
            // update db with player selection
            db.ref().child("playerSlotRight").update({
                rpsChoice: valueOf
            });
            isolateSelection(valueOf, sClass);
            r_selectionMade = true;
            // update card status in db
            db.ref().child("playerSlotRight").update({
                battleCardStatus: battleCard.ready
            });
        }
    });

    // run battle sequence 
    let l_status;
    let r_status;
    db.ref("playerSlotLeft/rpsChoice").on("value", function (snapshot) {
        l_status = snapshot.val();
        battleSequence();
    });
    db.ref("playerSlotRight/rpsChoice").on("value", function (snapshot) {
        r_status = snapshot.val();
        battleSequence();
    });

    function battleSequence() {
        if (l_status !== "" && r_status !== "") {
            let i = 3;
            let sInt = setInterval(function () {
                $(".countdown-timer").text(i);
                updateBattleCards(i, sInt);
                processWin(i);
                if (i > 0) {
                    i--;
                }
            }, 1000);
        }
    }

    function updateBattleCards(iValue, interval) {
        if (iValue <= 0) {
            clearInterval(interval);
            switch (l_status) {
                case "rock":
                    $(".b-left").html(battleCard.rock);
                    break;
                case "paper":
                    $(".b-left").html(battleCard.paper);
                    break;
                case "scissors":
                    $(".b-left").html(battleCard.scissors);
            }
            switch (r_status) {
                case "rock":
                    $(".b-right").html(battleCard.rock);
                    break;
                case "paper":
                    $(".b-right").html(battleCard.paper);
                    break;
                case "scissors":
                    $(".b-right").html(battleCard.scissors);
            }
        }
    }

    function processWin(iValue) {
        if (iValue <= 0) {
            if (l_status === "rock" && r_status === "rock" ||
                l_status === "paper" && r_status === "paper" ||
                l_status === "scissors" && r_status === "scissors"
            ) {
                $(".battle-feedback").text("It was a tie!");
                updateATTGames();

                playAgain();
            }
            if (l_status === "rock" && r_status === "paper") {
                $(".battle-feedback").text("paper covers rock");
                $(".b-right").addClass("b-win");
                awardPointRight();
            }
            if (l_status === "rock" && r_status === "scissors") {
                $(".battle-feedback").text("rock breaks scissors");
                $(".b-left").addClass("b-win");
                awardPointLeft();
            }
            if (l_status === "paper" && r_status === "rock") {
                $(".battle-feedback").text("paper covers rock");
                $(".b-left").addClass("b-win");
                awardPointLeft();
            }
            if (l_status === "paper" && r_status === "scissors") {
                $(".battle-feedback").text("scissors cut paper");
                $(".b-right").addClass("b-win");
                awardPointRight();
            }
            if (l_status === "scissors" && r_status === "rock") {
                $(".battle-feedback").text("rock breaks scissors");
                $(".b-right").addClass("b-win");
                awardPointRight();
            }
            if (l_status === "scissors" && r_status === "paper") {
                $(".battle-feedback").text("scissors cut paper");
                $(".b-left").addClass("b-win");
                awardPointLeft();
            }
        }
    }

    function awardPointLeft() {
        let cLeftWins;
        // get current wins value
        db.ref("playerSlotLeft/wins").once("value", function (snapshot) {
            cLeftWins = snapshot.val();
        });
        // set new wins value
        if (l_side === true) {
            db.ref("playerSlotLeft").update({
                wins: (cLeftWins += 1)
            });
        }
        updateATTGames();
        // deplay - ensures db updates before displaying point
        setTimeout(function () {
            // get new wins value
            db.ref("playerSlotLeft/wins").once("value", function (snapshot) {
                cLeftWins = snapshot.val();
            });
            $(".wins-output-left").text(cLeftWins);
            playAgain();
        }, 2000);
    }

    function awardPointRight() {
        let cRightWins;
        // get current wins value
        db.ref("playerSlotRight/wins").once("value", function (snapshot) {
            cRightWins = snapshot.val();
        });
        // set new wins value
        if (r_side === true) {
            db.ref("playerSlotRight").update({
                wins: (cRightWins += 1)
            });
        }
        updateATTGames();
        // deplay - ensures db updates before displaying point
        setTimeout(function () {
            // get new wins value
            db.ref("playerSlotRight/wins").once("value", function (snapshot) {
                cRightWins = snapshot.val();
            });
            $(".wins-output-right").text(cRightWins);
            playAgain();
        }, 2000);
    }

    // updates total games - really should be a backend function
    // this is a horrible workround
    function updateATTGames() {
        let attGames;
        let tGames;
        // get total game value
        db.ref("allTimeRPScount").once("value", function (snapshot) {
            attGames = snapshot.val();
        });
        db.ref("RPScount").once("value", function (snapshot) {
            tGames = snapshot.val();
        });
        // the delay ensures db is updated
        setTimeout(function () {
            attGames += 1;
            tGames += 1;
            db.ref().update({
                allTimeRPScount: attGames
            });
            db.ref().update({
                RPScount: tGames
            });
            setTimeout(function () {
                // get total game value
                db.ref("allTimeRPScount").once("value", function (snapshot) {
                    attGames = snapshot.val();
                });
                db.ref("RPScount").once("value", function (snapshot) {
                    tGames = snapshot.val();
                });
                setTimeout(function () {
                    $(".all-time-game-count").text("Total Games Ever Played: " + attGames);
                    $(".total-games-output").text(tGames);
                }, 1500);
            }, 1500);
        }, 1500);
    }

    // generates the playAgain button
    function playAgain() {
        $(".countdown-timer").html("<div class='countdown-timer-button'>PLAY AGAIN</div>");
    }

    // starts a new round
    $(document).on("click", ".countdown-timer-button", function () {
        db.ref().update({
            playAgain: true
        });
    });
    db.ref("playAgain").on("value", function (snapshot) {
        if (snapshot.val() === true) {
            $(".countdown-timer").html("VS");
            $(".b-left").removeClass("b-win");
            $(".b-right").removeClass("b-win");
            db.ref("playerSlotLeft").update({
                battleCardStatus: battleCard.waiting,
                rpsChoice: ""
            });
            db.ref("playerSlotRight").update({
                battleCardStatus: battleCard.waiting,
                rpsChoice: ""
            });
            l_selectionMade = false;
            r_selectionMade = false;
            db.ref().update({
                playAgain: false
            });
        }
        if (l_side === true) {
            $(".t-o-l").removeClass("t-gray").addClass("t-orange");
            $(".t-b-l").removeClass("t-gray").addClass("t-blue");
            $(".t-p-l").removeClass("t-gray").addClass("t-pink");
        }
        if (r_side === true) {
            $(".t-o-r").removeClass("t-gray").addClass("t-orange");
            $(".t-b-r").removeClass("t-gray").addClass("t-blue");
            $(".t-p-r").removeClass("t-gray").addClass("t-pink");
        }
        // verifies game count in case a user has left
        db.ref("RPScount").once("value", function (snapshot) {
            vUpdate = snapshot.val();
        });
        setTimeout(function () {
            $(".total-games-output").text(vUpdate);
        }, 1500);
    });
});