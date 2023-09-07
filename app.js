let delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)) // Altatja a futást a megadott ideig / == function delay(ms)

let symbols = [ "diamond", "clover", "heart", "pikes" ] // Lapok szimbólumai
let cards = [ // Lapok nevei, és értékei
    { name: "A", value: 1 },
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10 },
    { name: "J", value: 10 },
    { name: "Q", value: 10 },
    { name: "K", value: 10 },
]

let Dealer = { // Dealer alap adatai
    CardsDiv: document.getElementById("dealer-cards"),
    ValueDiv: document.getElementById("dealer-value")
}
let Player = { // Játékos alap adatai
    CardsDiv: document.getElementById("player-cards"),
    ValueDiv: document.getElementById("player-value"),
    Coins: 1000,
    Bet: 50,
    Double: false
}
let e = { // Összes használt HTML Element
    Message: document.getElementById("message"),
    GameButtons: document.getElementById("game-bt"),
    NewButtons: document.getElementById("new-bt"),
    Double: document.getElementById("double"),
    Surrender: document.getElementById("surrender"),
    GameBet: document.getElementById("bet"),
    MenuBet: document.getElementById("set-bet"),
    GameCoins: document.getElementById("coins"),
    MenuCoins: document.getElementById("menu-coins")
}
let panels = [ // Megnyitható panelek HTML Elementjei, és nevei
    { name: "menu", div: document.getElementById("menu") },
    { name: "game", div: document.getElementById("game") },
    { name: "rules", div: document.getElementById("rules") }
]

function Start() { // Játék kezdete
    Player.Cards = []
    Dealer.Cards = []
    Player.Value = 0
    Dealer.Value = 0
    Player.Double = false
    Player.Coins -= Player.Bet

    Dealer.Cards.push(randomCard())
    Player.Cards.push(randomCard())
    Player.Cards.push(randomCard())

    // Message Text tisztítása, gombok megjelenítése / eltüntetése
    e.Message.innerHTML = "&ZeroWidthSpace;"
    e.GameButtons.classList.remove("hide")
    e.NewButtons.classList.add("hide")

    e.Double.classList.remove("hide")
    e.Surrender.classList.remove("hide")
    updateCoins()
    showCards()
    showPanel("game")
}

function Hit() { // Lapkérés
    e.Double.classList.add("hide")
    e.Surrender.classList.add("hide")

    Player.Cards.push(randomCard())
    showCards()

    if (Player.Value > 21 && !Player.Double) // Bust - Játékos "besokall"
        Stand()
}

async function Double() { // Tét duplázása
    e.Double.classList.add("hide")
    Player.Coins -= Player.Bet
    Player.Bet *= 2
    Player.Double = true
    updateCoins()
    await delay(500)

    Hit()
    await delay(500)

    Stand()
    updateCoins()
}

async function Stand() { // Játék vége
    e.Double.classList.add("hide")
    e.Surrender.classList.add("hide")

    if (Player.Value <= 21){ // Dealer lapjainak húzása
        do {
            await delay(500)
            Dealer.Cards.push(randomCard())
            showCards()
        } while (Dealer.Value < 17)
    }

    let winner = "" // Nyertes ellenőrzése
    if (Player.Value > 21)
        winner = "Dealer"
    else
    if (Dealer.Value > 21)
        winner = "Játékos"
    else
    if (Dealer.Value > Player.Value)
        winner = "Dealer"
    else
    if (Player.Value > Dealer.Value)
        winner = "Játékos"
    else
    if (Player.Value == Dealer.Value)
        winner = ""

    if (winner == "Játékos")
        Player.Coins += Player.Bet*2
    if (winner == "")
        Player.Coins += Player.Bet

    if (Player.Double)
        Player.Bet /= 2
    updateCoins()

    // Győztes kiírása, gombok megjelenítése / eltüntetése
    e.Message.textContent = (winner == "" ? `Ez a kört döntetlen lett!` : `Ezt a kört a ${winner} nyerte!`)
    e.GameButtons.classList.add("hide")
    e.NewButtons.classList.remove("hide")
}

function Surrender() { // Játék feladása
    Player.Coins += (Player.Bet/2)
    updateCoins()

    // Győztes kiírása, gombok megjelenítése / eltüntetése
    e.Message.textContent = "Ezt a kört a Dealer nyerte!"
    e.GameButtons.classList.add("hide")
    e.NewButtons.classList.remove("hide")
}

function showCards() { // Lapok kiírása az oldalra
    let dealerCards = playerCards = ""

    // Összes lap 1-1 változóba írása
    Dealer.Cards.forEach(item => { dealerCards += `<div class="card x${item.Symbol} x${item.Card}"></div>` })
    Player.Cards.forEach(item => { playerCards += `<div class="card x${item.Symbol} x${item.Card}"></div>` })

    // Lapok, és összértékük beírása a megfelelő helyre
    Dealer.CardsDiv.innerHTML = dealerCards
    Player.CardsDiv.innerHTML = playerCards

    Dealer.ValueDiv.textContent = Dealer.Value = getCardsValue(Dealer.Cards)
    Player.ValueDiv.textContent = Player.Value = getCardsValue(Player.Cards)
}

function getCardsValue(list) { // Összes kártya értéke
    let value = 0 // Lapok összértéke
    let A = 0 // Ászok száma
    list.forEach(item => {
        if (item.Card == "A") { // Ha "Ász" lekezelés
            if (value < 11) {
                A++
                value += 11
            } else value += 1
        } else {
            value += cards[ cards.findIndex(card => { return card.name == item.Card }) ].value // Megkeresi a lap értékét

            if (value > 21 && A > 0) { // Ha besokallna, de van egy ásza, aminek az értéke még 11, akkor kicseréli azt 1-esre
                A--
                value -= 10
            }
        }
    })
    return value
}

function randomCard() { // Random lap generálása
    let symbol, card
    do {
        symbol = symbols[Math.round(Math.random() * (symbols.length - 1))]
        card = cards[Math.round(Math.random() * (cards.length - 1))].name
    } while (Dealer.Cards.findIndex(item => { return item.Symbol == symbol && item.Card == card }) != -1 || Player.Cards.findIndex(item => { return item.Symbol == symbol && item.Card == card }) != -1)

    return { Symbol: symbol, Card: card }
}

function showPanel(name) { // Az adott oldal, "panel" előhozatala, többi eltüntetése
    panels.forEach(item => {
        if (item.name == name)
            item.div.classList.remove("hide")
        else
            item.div.classList.add("hide")
    })
}

function setBet(value) { // Tét csökkentése / növelése
    Player.Bet += value
    if (Player.Bet < 50) Player.Bet = 50
    if (Player.Bet > 500) Player.Bet = 500

    updateCoins()
}

function setCoins(value) { // Játékos pénzének csökkentése / növelése
    Player.Coins += value
}

function updateCoins() { // Játékos kiírt pénzének frissítése
    e.GameBet.textContent = e.MenuBet.textContent = Player.Bet
    e.GameCoins.textContent = e.MenuCoins.textContent = Player.Coins
}

document.addEventListener("DOMContentLoaded", () => {
    // Kártyák CSS-ének megírása
    let style = ""
    for (let i = 0; i < symbols.length; i++) {
        style += `
            .x${symbols[i]} {
                background-position-y: ${i * -128.5 - 2}px;
            }
        `
    }
    for (let j = 0; j < cards.length; j++) {
        style += `
            .x${cards[j].name} {
                background-position-x: ${j * -88 - 2}px;
            }
        `
    }
    document.head.innerHTML += `<style>${style}</style>`

    updateCoins()
})