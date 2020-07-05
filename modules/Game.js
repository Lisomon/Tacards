const Playership = require("./playership");
const Stack = require("./stack");
class Game {
    get lastPlayer() {
        return this._lastPlayer;
    }

    set lastPlayer(value) {
        this._lastPlayer = value;
    }
    get lastPlayedCard() {
        return this._lastPlayedCard;
    }

    set lastPlayedCard(value) {
        this._lastPlayedCard = value;
    }
    get exchangeMode() {
        return this._exchangeMode;
    }

    set exchangeMode(value) {
        this._exchangeMode = value;
    }
    get teufelPlayer() {
        return this._teufelPlayer;
    }

    set teufelPlayer(value) {
        this._teufelPlayer = value;
    }
    get teufelPlayed() {
        return this._teufelPlayed;
    }

    set teufelPlayed(value) {
        this._teufelPlayed = value;
    }
    get doubleNextPlayerSwitch() {
        return this._doubleNextPlayerSwitch;
    }

    set doubleNextPlayerSwitch(value) {
        this._doubleNextPlayerSwitch = value;
    }
    get whoIsNext() {
        return this._whoIsNext;
    }

    set whoIsNext(value) {
        this._whoIsNext = value;
    }
    get teams() {
        return this._teams;
    }

    set teams(value) {
        this._teams = value;
    }
    get stack() {
        return this._stack;
    }

    set stack(value) {
        this._stack = value;
    }
    get playership() {
        return this._playership;
    }

    set playership(value) {
        this._playership = value;
    }

    constructor() {
        //Dieses Objekt enthält alle Spieler eines Spiels, verwaltet und steuert diese
        this._playership = new Playership();
        this._stack = new Stack();

        this._teams = 0;
        this._whoIsNext = 0;

        this._doubleNextPlayerSwitch = false;
        this._teufelPlayed = false;
        this._teufelPlayer = "";
        this._exchangeMode = false;

        this._lastPlayedCard = "";
        this._lastPlayer = "";
    }

    getPlayers(){
        return this._playership.players;
    }

    getPlayernames(){
        let aRet = [];
        for (let i = 0; i < this._playership.length; i++) {
            aRet.push(this._playership.getNameByPosition(i));
        }
        return aRet;
    }

    addNewPlayer(pName){
        this._playership.addPlayer(pName);
    }

    playedNarr(oStats){
        this._playership.switchCards(oStats);
        this.doubleNextPlayerSwitch = true;
    }

    playedTeufel(name){
        this.teufelPlayed = true;
        this.teufelPlayer = name;
    }

    hasCurrentPlayerCards(){
        return this._playership.getPlayerByPosition(this._whoIsNext).length !== 0;
    }

    howManyCardsWillBeGiven(){
        if ( this._stack.length < this._playership.length * 10 ){
            return (this._stack.length - ( this._stack.length % this._playership.length)) / this._playership.length;
        }
        else{
            return 5;
        }
    }

    //zufällige Karte aus dem Stapel ziehen
    getRandomCard(){
        return this._stack.getCard();
    }

    resetStack(){
        this._stack.reset();
        this.resetHandcards();
    }

    resetHandcards(){
        this.playership.resetAllHands();
    }

    //gibt die Hand eines SPielers als Array zurück
    getHandOf(name){
        return this._playership.getHandByName(name);
    }

    //gibt den namen zurück
    whosTurn(){
        return "" + this._playership.getNameByPosition(this._whoIsNext);
    }

    teamsPossible(teamsnumber){
        return teamsnumber === 0 || this._playership.length % teamsnumber === 0;
    }

    /*
    * gibt alle möglichen Teamanzahlen zurück in einem Array
    * Die einzelnen Elemente sind auch Arrays aus textueller und numerischer Bezeichnung des Falls*/
    possibleTeams(playernumber){
        let aRet = [["keine Teams",0],["Harmonie",1]];

        for (let i = 2; i <= playernumber / 2 ; i++) {
            if (playernumber % i === 0){
                if (i === 2){
                    aRet.push(["zwei Teams", 2]);
                }else if(i === 3){
                    aRet.push(["drei Teams", 3]);
                }else{
                    aRet.push([i + " Teams", i]);
                }
            }
        }

        return aRet;

    }

    showTeams(){
        if (this._teams === 0 || this._teams === this._playership.length) {
            return "no teams";
        }
        let arrRet = [];
        let arrteam = [];
        for (let i = 0; i < this._teams; i++) {
            for (let j = i; j < this._playership.length; j += this._teams) {
                arrteam.push(this._playership.getNameByPosition(j));
            }
            arrRet.push(arrteam);
            arrteam = [];
        }
        return arrRet;

    }

    //setzt den aktuellen Spieler auf den Nächsten bei Rundenwechsel
    nextFirstPlayer(){
        this.nextPlayer();
        if (this._doubleNextPlayerSwitch) {
            this._doubleNextPlayerSwitch = false;
            this.nextPlayer();
        }
    }

    //setzt den aktuellen Spieler auf den Nächsten während einer Runde
    nextPlayer(){
        if (this._whoIsNext === this._playership.length - 1) {
            this._whoIsNext = 0;
        } else {
            this._whoIsNext++;
        }
    }

    //setzt die Spielerreihenfolge gleicht mit dem übergebenen Array
    changeOrder(playerArr){
        this._playership.setPlayerOrder(playerArr);
    }

    //Startet tauschphase
    startExchange(){
        if (this._teams !== 0 && this._teams !== this._playership.length) {
            this._exchangeMode = true;
        }
    }

    //Regelt alles um das Austeilen herum am Anfang einer Runde
    giveCards(oStats){
        if(this._stack.length < this._playership.length * 5){
            this.resetStack();
        }
        let bNewStack = this._stack.isStackNew();
        let howManyCards = this.howManyCardsWillBeGiven();
        for (let i = 0; i < howManyCards; i++) {
            for (let j = 0; j < this._playership.length; j++) {
                this._playership.addCardByPosition(this.getRandomCard(), j);
            }
        }
        oStats.saveGameData("rounds", "")
        for (let j = 0; j < this._playership.length; j++) {
            oStats.savePlayerData(this.playership.getNameByPosition(j),"gotDealt", this._playership.getHandByPosition(j));
        }
        this.startExchange();
        this.nextFirstPlayer();
        return bNewStack;
    }



    getPlayerPosition(pName){
        return this._playership.getPositionByName(pName);
    }

    spliceCardFromPlayer(cardname, playername){
        return this._playership.getPlayerByName(playername).spliceCard(cardname + ""); // '+ ""' is a numeric fix
    }

    getExchangePartner(yourname){
        let position = this.getPlayerPosition(yourname) - this._teams;
        if(position < 0){
            position += this._playership.length;
        }
        return position;
    }

    rememberLastTurn(pName, pCard){
        this.lastPlayedCard = pCard;
        this.lastPlayer = pName;
    }

    kickPlayer(playername){
        this.playership.kickPlayer(playername);
    }

}

module.exports = Game;
