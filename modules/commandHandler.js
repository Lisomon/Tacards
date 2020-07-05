const Game = require("./Game");
const Stats = require("./stats");

class CommandHandler {

    constructor(stc, gameID) {
        //diese Variable enthält die Funktion um mit den Clients zu kommunizieren
        this.sendToClients = stc;
        this.stats = null;
        this.gameID = gameID;
        this.disconnectedOnes = [];
        this.gameRunning = false;
        this.GG = new Game();
    }

    /*
    * Steuert alles in Reaktion auf die empfangenen Commands der Clients*/
    commandhandler(command, paramUsername){
        let commandLine = command;
        let commandSplit = command.split("- "); //trennt Command von Parametern
        command = commandSplit[0].toLowerCase();
        if (commandSplit.length > 1) {
            commandSplit = commandSplit[1].split(" "); //trennt die einzelnen Paramenter
        }

        switch(command) {
            case "game start":
                if (this.GG.playership.length === 0) {
                    this.sendToClients(paramUsername, "game start" , "no players", false);
                    break;
                }
                this.gameRunning = true;
                this.GG.resetStack();
                this.stats = new Stats(this.GG.getPlayernames());
                this.GG.giveCards(this.stats);
                this.GG.whoIsNext = 0; // damit der erste startet
                this.sendToClients(this.gameID, "game start" , "game started", true);
                this.sendToClients(this.gameID, "game players" ,  this.GG.getPlayernames(), true);
                this.sendToClients(this.gameID, "game teams show" ,  this.GG.showTeams(), true);
                this.showEverybodyHisHand();
                if (this.GG.teams !== 0 && this.GG.teams !== this.GG.playership.length) {
                    this.whoComesOut();
                    for (const playername of this.GG.getPlayernames()) {
                        this.sendToClients(playername , "exchange start" , this.GG.playership.getNameByPosition(this.GG.getExchangePartner(playername)), false);
                    }
                }
                this.commandhandler("game turn who", paramUsername);
                break;
            case "game new":
                this.disconnectedOnes = [];
                this.gameRunning = false;
                for (const playername of this.GG.getPlayernames()) {
                    this.sendToClients(this.gameID , "is_online" , playername, true);
                }
                break;
            case "game players":
                this.sendToClients(this.gameID, "game players" ,  this.GG.getPlayernames(), true);
                break;
            case "game order": //um die Reihenfolge zu ändern
                this.GG.changeOrder(commandSplit);
                this.sendToClients(this.gameID, "game order" ,  this.GG.getPlayernames(), true);
                break;
            case "game teams": //Teamanzahl festlegen
                let teamnumber = parseInt(commandSplit[0], 10);
                if (this.GG.teamsPossible(teamnumber)) {
                    this.GG.teams = teamnumber;
                    this.commandhandler("game teams show" , paramUsername);
                } else {
                    this.sendToClients(this.gameID, "game teams" ,  "number not possible", true);
                }
                break;
            case "game teams show": //teams anzeigen lassen
                this.sendToClients(this.gameID, "game teams show" ,  this.GG.showTeams(), true);
                break;
            case "game teams possible": //mögliche Teamsanzahlen
                this.sendToClients(paramUsername , "game teams possible" ,  this.GG.possibleTeams(this.GG.playership.length), false);
                break;
            case "game turn who":
                this.sendToClients(this.gameID, "game turn who" , this.GG.whosTurn(), true);
                break;
            case "game stats":
                this.sendToClients(paramUsername, "game stats" , this.stats.generateStats(paramUsername), false);
                break;
            case "cards show":
                this.showEverybodyHisHand();
                break;
            case "cards mine": //zeigt dem Sender seine Hand
                this.sendToClients(paramUsername, "cards mine" , this.GG.getHandOf(paramUsername), false);
                break;
            case "exchange": //Kartentausch am Anfang einer Runde
                this.exchange(paramUsername, commandSplit[0]);
                break;
            case "play":
                this.play(paramUsername, commandSplit[0]);
                break;
            case "teufel": //Statt "play" wenn man durch den Teufel eine Karte vom Gegner spielt
                this.teufel(paramUsername, commandSplit[0]);
                break;

            default:
                this.sendToClients(paramUsername, 'command unknown', commandLine, false);
        }

    }

    showEverybodyHisHand(){
        for (let i = 0; i < this.GG.playership.length; i++) {
            this.commandhandler("cards mine", this.GG.playership.getNameByPosition(i));
        }
    }

    whoComesOut(){
        this.sendToClients(this.gameID, "comes out", this.GG.playership.getComesoutData(), true);
    }


    /*
    * Beim Tauschen wird die zu tauschen gewählte Karte aus der eigenen hand entfernt und beim Empfänger in den Platzhalter ReceivingCard gesetzt
    * Sobald alle getauscht haben erhält jeder die Karte aus seinem Platzhalterslot auf die Hand*/
    exchange(name, cardname){

        this.GG.playership.setReceivingCardByPosition(this.GG.spliceCardFromPlayer(cardname, name), this.GG.getExchangePartner(name));
        this.stats.savePlayerData(name,"didExchange", this.GG.playership.getReceivingCardByPosition(this.GG.getExchangePartner(name)));

        if (this.GG.playership.allHaveReceivingCards()) {
            for (let i = 0; i < this.GG.playership.length; i++) {
                this.stats.savePlayerData(this.GG.playership.getNameByPosition(i),"getExchanged", this.GG.playership.getReceivingCardByPosition(i));
                this.sendToClients(this.GG.playership.getNameByPosition(i), 'exchange received', this.GG.playership.getReceivingCardByPosition(i), false);
                this.commandhandler("game turn who", name);
            }
            this.GG.playership.addReceivingCards();
            this.GG.exchangeMode = false;
        }
    }


    play(name, cardname){

        if(this.GG.whosTurn() !== name || this.GG.teufelPlayed || this.GG.exchangeMode){
            this.sendToClients(name, "play", 'not your turn', false);
            return;
        }

        let playedCard = this.GG.spliceCardFromPlayer(cardname, name);
        if (playedCard === "TAC"){
            this.stats.saveGameData("cardWasTact", this.GG.lastPlayedCard);
            this.stats.saveGameData("playerWasTact", this.GG.lastPlayer);
        }
        this.GG.rememberLastTurn(name, playedCard);
        this.stats.savePlayerData(name,"played", playedCard);
        this.sendToClients(this.gameID, "play", [name, playedCard], true);

        this.afterPlayedCard(name, playedCard);
    }

    teufel(name, cardname){
        let playedCard = this.GG.spliceCardFromPlayer(cardname, this.GG.whosTurn());
        this.GG.rememberLastTurn(this.GG.whosTurn(), playedCard);
        this.stats.saveGameData("wasPlayedByTeufel", playedCard);
        this.sendToClients(this.gameID, "teufel", [name, this.GG.whosTurn(), playedCard], true);
        this.commandhandler("cards mine", name);
        this.commandhandler("cards mine", this.GG.whosTurn());
        /*für den Fall dass Tac gewählt wurde muss nochmal der Command "teufel" statt "play" ausgeführt werden
        Außerdem muss auch gefakt wrden dass die letztes Karte keine Tac sondern ein Teufel war
        und der Teufel-Spieler muss gewechselt werden
         */
        if (playedCard === "TAC"){
            playedCard = "Teufel";
            this.GG.teufelPlayer = this.GG.whosTurn();
            this.afterPlayedCard(this.GG.whosTurn(), playedCard);
        }
        /* Da durch den Narr durchgetact wird muss die Information des Teufelszuges gemerkt werden*/
        else if (playedCard === "Narr"){
            playedCard = "TeufelNarr";
            this.afterPlayedCard(name, playedCard);
        } else {
            this.GG.teufelPlayer = "";
            this.GG.teufelPlayed = false;
            this.afterPlayedCard(name, playedCard);
        }
    }

    /* Der Teil der gleich ist unabhängig ob Teufel gespielt wurde oder nicht*/
    afterPlayedCard(name, playedCard){
        if(playedCard === "Narr" || playedCard === "TeufelNarr"){
            this.GG.playedNarr(this.stats);
            this.showEverybodyHisHand();
            if (playedCard === "TeufelNarr"){
                playedCard = "Teufel";
            }
        }else{
            this.GG.nextPlayer();
        }

        if (!this.GG.hasCurrentPlayerCards()) {
            if (this.GG.giveCards(this.stats)){
                this.sendToClients(this.gameID, "new stack" , "", true);
            }
            this.showEverybodyHisHand();
            if (this.GG.teams !== 0 && this.GG.teams !== this.GG.playership.length) {
                this.whoComesOut();
                for (const playername of this.GG.getPlayernames()) {
                    this.sendToClients(playername , "exchange start" , this.GG.playership.getNameByPosition(this.GG.getExchangePartner(playername)), false);
                }
            }
        }
        //Abfrage ob der "teufel" Command statt "play" gestartet wird
        if( playedCard === "Teufel" && this.GG.hasCurrentPlayerCards()){
            this.GG.playedTeufel(name);
            this.sendToClients(name , "cards teufel" , this.GG.getHandOf(this.GG.whosTurn()), false);
            this.sendToClients(this.gameID, "game turn who", name, true);
        }else{
            this.commandhandler("game turn who", name);
        }
    }

    //Blockiert alles sobald Jemand die verbindung verliert
    disconnected(playername){
        this.sendToClients(this.gameID, "freeze", true, true);
        this.disconnectedOnes.push(playername);
    }

    //überprüft ob Jemand fehlt und alle Handlungen blockiert werden sollen
    bFreeze(){
        return this.disconnectedOnes.length > 0;
    }

    joinGame(playername){
        if (this.gameRunning) {
            if (this.bFreeze()) {
                for (let i = 0; i < this.disconnectedOnes.length; i++) {
                    if (this.disconnectedOnes[i] === playername) {
                        this.disconnectedOnes.splice(i, 1);
                        return true;
                    }
                }
            }
        } else {
            this.GG.addNewPlayer(playername);
            return true;
        }
        return false;
    }

    /* Sendet alle Information zum Spiel einem Spieler der nach Verbindungsverlust wieder zurückkommt*/
    sendGameStateToUser(username){
        if (this.gameRunning) {
            this.commandhandler("game players", username);
            this.commandhandler("game teams show", username);
            if (this.GG.exchangeMode) {
                if (!(this.GG.playership.getReceivingCardByPosition(this.GG.getExchangePartner(username)) !== "")) {
                    this.commandhandler("cards mine", username);
                    this.sendToClients(username, "exchange start", this.GG.playership.getNameByPosition(this.GG.getExchangePartner(username)), false);
                }
            } else {
                if (this.GG.teufelPlayer === username && this.GG.hasCurrentPlayerCards()) {
                    this.sendToClients(username, "cards teufel", this.GG.getHandOf(this.GG.whosTurn()), false);
                    this.sendToClients(this.gameID, "game turn who", username, true);
                } else {
                    this.commandhandler("game turn who", username);
                    this.commandhandler("cards mine", username);
                }
            }
        }
    }

    kickPlayer(playername){
        this.GG.kickPlayer(playername);
    }


}


module.exports = CommandHandler;
