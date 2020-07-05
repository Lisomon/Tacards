const fs = require( 'fs' );
const express = require('express');
const app = express();
let server = null;
const https = require('https');

/*
* Unterscheidung zwischen prod und dev Umgebung (dev kein https) */
if(process.env.npm_config_env === 'dev') {
    server = require('http').Server(app);
    server.listen(8080, function () {
        console.log("local dev env");
        console.log("listening on port 8080");
    });
} else {
    server = https.createServer({
            key: fs.readFileSync('../privkey.pem'),
            cert: fs.readFileSync('../fullchain.pem')
        },
        app);
    server.listen(8080, function () {
        console.log("ssl prod env");
        console.log("Listening on port 8080");
    });
}
const io = require('socket.io')(server);

app.use(express.static('static'));

/*
* Überprüft ob Game-Instanz zum Pfad existiert und regelt 404 */
app.get('/*', function(req, res, next) {

    if(checkGameId(req.originalUrl.replace("/", "").split("?")[0])) {
        next();
    }else{
        res.redirect("/404.html");
    }
});

/*
 diese Variable wird an die Spiel-Instanzen weitergeben, damit diese mit dieser Funktion das Socket-Modul nutzen können

 visibility: Spielername oder Spiel-Id an die der Inhalt gesendet werden soll
 bGameId: Ob es eine Game-Id ist
 command: von welchem Command das die Rückmeldung ist
 content: Inhalt
 */
let stc = function sendToClients(visibillity, command , content, bGameId){
    if (!bGameId){
        visibillity = getSocketIDByUsername(visibillity);
    }
        io.to(visibillity).emit('command_message', [command , content]);
}

//Dieses Modul ist für die Reaktion auf Commands zuständig und enthält die komplette Spiel-Logik und Daten
//Jedes Spiel hat seine eigene Instanz
const CH = require("./modules/commandHandler");

//Beschränkt die Kommunikation auf das Websocket-Protokoll
io.set("transports", ["websocket"]);
io.sockets.on('connection', function(socket) {

    //launches initial username-entering
    socket.emit('enterUserName', false);

    socket.on('username', function(loginData) {
        let username = loginData[0];
        let gameID = loginData[1];
        if (!checkUsername(username) && joinGame(username, loginData[1])){
            socket.username = username;
            socket.gameID = gameID;
            socket.join('' + gameID); //gameid room
            //liste um global zu checken welche namen schon vergeben sind
            nameList.push([username, socket.id]);
            io.to(gameID).emit('is_online', socket.username);
            //Für den Fall, dass ein Spieler mit verlorener Verbindung zurück kommt
            handlingSendGameStateToUser(username,gameID);
            unFreezeCheck(gameID);
        }
        else {
            //repeats username-entering if already exits or game couldn't be joined
            socket.emit('enterUserName', true);
        }
        
    });

    socket.on('create_game', function(gameID) {
        if(checkGameId(gameID)){
            socket.emit('game_exits', gameID);
        }else{
            //generiert Pfad
            app.get('/' + gameID + '/', function(req, res) {
                res.render('game.ejs');
            });

            //liste um global zu checken welche namen schon vergeben sind
            gameList.push([gameID, new CH(stc, gameID)]);
            setTimeout(() => killGame(gameID), 21600000); // Killt Game-Instanz nach 6 Stunden Laufzeit
            socket.emit('game_created', gameID);
            //Macht einen Eintrag für jedes erstellte Spiel, um die Nutzung messen zu können
            fs.appendFileSync('gameIdLog.txt', 'ID: ' + gameID + " Timestamp: " + getTimeStamp() + "\n");
        }
    });

    socket.on('disconnect', function(username) {
        if (socket.username !== 'undefined'){
            removeUser(socket.username);
        }
        if (!bGameRunning(socket.gameID)){
            kickPlayer(socket.username, socket.gameID);
            stc(socket.gameID, "kick", socket.username, true);
        }else{
            disconnectUserIngame(socket.username, socket.gameID);
        }
    });

    socket.on('command_message', function(message) {
        sendCommand(socket.gameID, socket.username, message);
    });

});

/*
* Sendet eine Command-Message von einem angegeben Nutzer an den Commandhandler der angegebenen Spiel-Id
*/
function sendCommand(gameID, username, message){
    for (let i = 0; i < gameList.length; i++) {
        if (gameList[i][0] === gameID && !gameList[i][1].bFreeze()) { //bFreeze blockiert das Weiterspielen solange ein Spieler keine Verbindung hat
            gameList[i][1].commandhandler(message, username);
            break;
        }
    }
}

//Liste mit aktuellen Nutzern
let nameList = [];
/*
* Überprüft ob ein Nutzername bereits vorhanden ist oder aus anderen Gründen nicht gewählt werden kann.
* Gibt false zurück falls dieser noch gewählt werd en darf.
*/
function checkUsername(name){
    //blocks errors with empty or only-spaces names
    name += "";
    if(name.trim() === ""){
        return true;
    }

    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i][0] === name) {
            return true;
        }
    }
    /*
    Kein Spielername darf mit der Game-Id eines Spieles übereinstimmen
    * deswegen wird hier dies noch als letzter Schritt überprüft
    */
    return checkGameId(name);
}

function getSocketIDByUsername(username){
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i][0] === username) {
            return nameList[i][1];
        }
    }
}
/*
* Entfernt den Nutzernamen aus der Liste der aktuellen Nutzer
*/
function removeUser(username){
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i][0] === username) {
            nameList.splice(i,1);
            break;
        }
    }
}

//Liste mit akzuellen Spiel-Ids
let gameList = [];
/*
* Überprüft ob eine Spiel-Id bereits vorhanden ist oder aus anderen Gründen nicht gewählt werden kann.
* Gibt false zurück falls diese noch gewählt werd en darf.
*/
function checkGameId(ID){
    //blocks errors with empty or only-spaces IDs
    ID += "";
    if(ID.trim() === ""){
        return true;
    }

    for (let i = 0; i < gameList.length; i++) {
        if (gameList[i][0] === ID) {
            return true;
        }
    }
    return false;
}

//Entfernt eine Spiel-Id aus der Liste der aktuellen Spiele und gibt eine Meldung an alle noch verbundenen Clients
function killGame(gameId) {
    for (let i = 0; i < gameList.length; i++) {
        if (gameList[i][0] === gameId) {
            gameList.splice(i,1);
            break;
        }
    }
    io.to(gameId).emit('game_killed', true);
}

function getTimeStamp(){
    let date = new Date();
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
}

function joinGame(playername, gameId){
    let gCH = getCHByGameId(gameId);
    if (gCH !== false && gCH.joinGame(playername)){
        return true;
    }
    return false;
}

function disconnectUserIngame(username, gameId){
    let gCH = getCHByGameId(gameId);
    gCH.disconnected(username);
}

//gibt einem Client, der die Verbindung neu aufbaut, alle aktuellen Spielinformationen
function handlingSendGameStateToUser(username, gameId){
    let gCH = getCHByGameId(gameId);
    gCH.sendGameStateToUser(username);
}

//Überprüft ob alle Spieler eine Verbindung haben und stoppt das Blockieren
function unFreezeCheck(gameId){
    let gCH = getCHByGameId(gameId);
    if (!gCH.bFreeze()){
        stc(gameId, "freeze", false, true);
    }
}

//überprüft ob ein Spiel im Gange ist
function bGameRunning(gameId){
    let gCH = getCHByGameId(gameId);
    if (gCH !== false && gCH.gameRunning){
        return true;
    }
    return false;
}

function kickPlayer(username, gameId){
    let gCH = getCHByGameId(gameId);
    if (gCH !== false){
        gCH.kickPlayer(username);
    }
}

//um sich redundanten Code zu sparen
function getCHByGameId(gameId){
    for (let i = 0; i < gameList.length; i++) {
        if (gameList[i][0] === gameId) {
            return gameList[i][1];
        }
    }
    return false;
}



