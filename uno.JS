var deck = [];
var player = [];
var bot = [];
var discard = [];

var currentColor = "";
var turn = "player";
var waitingForColor = false;
var gameOver = false;

var colors = ["red", "yellow", "green", "blue"];

var values = [
    "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9",
    "skip", "reverse", "draw2"
];

function makeDeck() {
    deck = [];

    for (var c of colors) {

        deck.push({
            color: c,
            value: "0"
        });

        for (var i = 1; i <= 2; i++) {

            for (var v of values.slice(1)) {

                deck.push({
                    color: c,
                    value: v
                });
            }
        }
    }

    for (var i = 0; i < 4; i++) {

        deck.push({
            color: "wild",
            value: "wild"
        });

        deck.push({
            color: "wild",
            value: "draw4"
        });
    }
}

function shuffle(array) {

    for (var i = array.length - 1; i > 0; i--) {

        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function drawCards(hand, amount) {

    for (var i = 0; i < amount; i++) {

        if (deck.length === 0) {

            if (discard.length > 1) {

                var top = discard.pop();

                deck = discard;

                discard = [top];

                shuffle(deck);
            }
        }

        if (deck.length > 0) {
            hand.push(deck.pop());
        }
    }
}

function startUnoGame() {

    makeDeck();

    shuffle(deck);

    player = [];
    bot = [];
    discard = [];

    drawCards(player, 7);
    drawCards(bot, 7);

    var firstCard;

    do {
        firstCard = deck.pop();
    } while (firstCard.color === "wild");

    discard.push(firstCard);

    currentColor = firstCard.color;

    turn = "player";

    waitingForColor = false;
    gameOver = false;

    renderUnoGame();
}

function canPlay(card) {

    var topCard =
        discard[discard.length - 1];

    return (
        card.color === "wild" ||
        card.color === currentColor ||
        card.value === topCard.value
    );
}

function playUnoCard(index) {

    if (
        turn !== "player" ||
        gameOver ||
        waitingForColor
    ) {
        return;
    }

    var card = player[index];

    if (!canPlay(card)) {

        setUnoStatus("You can't play that card!");

        return;
    }

    player.splice(index, 1);

    discard.push(card);

    if (player.length === 0) {

        gameOver = true;

        renderUnoGame();

        setUnoStatus("YOU WIN! 🎉");

        return;
    }

    if (card.color === "wild") {

        waitingForColor = true;

        renderUnoGame();

        return;
    }

    currentColor = card.color;

    applyUnoEffect(card);
}

function chooseUnoColor(color) {

    if (!waitingForColor) {
        return;
    }

    currentColor = color;

    waitingForColor = false;

    var card =
        discard[discard.length - 1];

    if (card.value === "draw4") {
        drawCards(player, 4);
    }

    turn = "bot";

    renderUnoGame();

    setTimeout(botTurn, 700);
}

function applyUnoEffect(card) {

    if (card.value === "draw2") {

        drawCards(bot, 2);
    }

    if (card.value === "draw4") {

        drawCards(bot, 4);
    }

    if (card.value === "skip") {

        renderUnoGame();

        setTimeout(botTurn, 700);

        return;
    }

    turn = "bot";

    renderUnoGame();

    setTimeout(botTurn, 700);
}

function botTurn() {

    if (gameOver) {
        return;
    }

    var playable = [];

    for (var i = 0; i < bot.length; i++) {

        if (canPlay(bot[i])) {
            playable.push(i);
        }
    }

    if (playable.length === 0) {

        drawCards(bot, 1);

        renderUnoGame();

        setTimeout(function () {

            if (
                bot.length > 0 &&
                canPlay(bot[bot.length - 1])
            ) {

                botPlay(bot.length - 1);

            } else {

                turn = "player";

                renderUnoGame();
            }

        }, 600);

        return;
    }

    var bestCard = playable[0];
    var bestScore = -999;

    for (var i = 0; i < playable.length; i++) {

        var index = playable[i];

        var card = bot[index];

        var score = Math.random() * 3;

        if (card.value === "draw4") {
            score += 10;
        }

        if (card.value === "draw2") {
            score += 7;
        }

        if (card.value === "skip") {
            score += 4;
        }

        if (card.color === currentColor) {
            score += 3;
        }

        if (card.color !== "wild") {
            score += 2;
        }

        if (score > bestScore) {

            bestScore = score;
            bestCard = index;
        }
    }

    botPlay(bestCard);
}

function botPlay(index) {

    var card = bot.splice(index, 1)[0];

    discard.push(card);

    if (bot.length === 0) {

        gameOver = true;

        renderUnoGame();

        setUnoStatus("BOT WINS! 🤖");

        return;
    }

    if (card.color === "wild") {

        currentColor = botChooseColor();

    } else {

        currentColor = card.color;
    }

    if (card.value === "draw2") {
        drawCards(player, 2);
    }

    if (card.value === "draw4") {
        drawCards(player, 4);
    }

    if (card.value === "skip") {

        renderUnoGame();

        setTimeout(botTurn, 700);

        return;
    }

    turn = "player";

    renderUnoGame();
}

function botChooseColor() {

    var count = {
        red: 0,
        yellow: 0,
        green: 0,
        blue: 0
    };

    for (var card of bot) {

        if (count[card.color] !== undefined) {
            count[card.color]++;
        }
    }

    var best = "red";

    for (var color of colors) {

        if (count[color] > count[best]) {
            best = color;
        }
    }

    return best;
}

function drawUnoCard() {

    if (
        turn !== "player" ||
        gameOver ||
        waitingForColor
    ) {
        return;
    }

    drawCards(player, 1);

    renderUnoGame();

    var card =
        player[player.length - 1];

    if (
        card &&
        canPlay(card)
    ) {

        setUnoStatus(
            "You drew a playable card!"
        );

    } else {

        turn = "bot";

        setTimeout(botTurn, 700);
    }
}

function cardName(card) {

    if (card.value === "draw2") {
        return "+2";
    }

    if (card.value === "draw4") {
        return "+4";
    }

    if (card.value === "wild") {
        return "WILD";
    }

    if (card.value === "skip") {
        return "SKIP";
    }

    if (card.value === "reverse") {
        return "↻";
    }

    return card.value;
}

function renderUnoGame() {

    var playerHand =
        document.getElementById("unoPlayerHand");

    var botHand =
        document.getElementById("unoBotHand");

    var discardPile =
        document.getElementById("unoDiscard");

    if (!playerHand) {
        return;
    }

    playerHand.innerHTML = "";
    botHand.innerHTML = "";
    discardPile.innerHTML = "";

    for (var i = 0; i < bot.length; i++) {

        var back =
            document.createElement("div");

        back.className =
            "uno-card uno-wild";

        back.innerHTML =
            "<b>UNO</b>";

        botHand.appendChild(back);
    }

    for (var i = 0; i < player.length; i++) {

        var card = player[i];

        var element =
            document.createElement("button");

        element.className =
            "uno-card uno-" + card.color;

        element.innerHTML =
            cardName(card);

        element.onclick =
            (function(index) {

                return function () {
                    playUnoCard(index);
                };

            })(i);

        playerHand.appendChild(element);
    }

    var topCard =
        discard[discard.length - 1];

    if (topCard) {

        var top =
            document.createElement("div");

        top.className =
            "uno-card uno-" + topCard.color;

        top.innerHTML =
            cardName(topCard);

        discardPile.appendChild(top);
    }

    var colorBox =
        document.getElementById("unoColorBox");

    if (waitingForColor) {
        colorBox.style.display = "block";
    } else {
        colorBox.style.display = "none";
    }

    var playerCount =
        document.getElementById("unoPlayerCount");

    var botCount =
        document.getElementById("unoBotCount");

    if (playerCount) {
        playerCount.innerHTML =
            player.length;
    }

    if (botCount) {
        botCount.innerHTML =
            bot.length;
    }

    if (!gameOver) {

        if (waitingForColor) {

            setUnoStatus(
                "Choose a color!"
            );

        } else if (turn === "player") {

            setUnoStatus(
                "Your turn!"
            );

        } else {

            setUnoStatus(
                "Bot's turn..."
            );
        }
    }
}

function setUnoStatus(message) {

    var status =
        document.getElementById(
            "unoStatus"
        );

    if (status) {
        status.innerHTML = message;
    }
}