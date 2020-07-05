//var socket = io.connect('http://localhost:8080');

// let socket = io();

const socket = io({transports: ["websocket"], upgrade: false});

let ersterzug = true; //notwendig um die Spielerreihenfolgetauschfunktion zu deaktivieren
let teamcreator = false; //nur der Teamcreator kann die Anzahl der Teams festlegen
let spielerbeigetreten = false; //nach dem ersten Schritt im Spiel erstellen wird Freeze aktiviert


function playCard(Karte, id){
    let showmycardsdiv = $('#showmycards')[0];
    let backendbefehl = "";

    if (showmycardsdiv.dataset.action === "play"){
        backendbefehl = "play- " + Karte;
        socket.emit('command_message', backendbefehl);

    } else if (showmycardsdiv.dataset.action === "teufel"){  //Teufelspielaktion und anschließend Handkartenreset
        backendbefehl = "teufel- " + Karte;
        socket.emit('command_message', backendbefehl);
        showmycardsdiv.dataset.action = "play";
        if(Karte !== "Narr"){
            resethandcards();
        }

    } else if (showmycardsdiv.dataset.action === "exchange"){ //Karte tauschen
        backendbefehl = "exchange- " + Karte;
        socket.emit('command_message', backendbefehl);
        showmycardsdiv.dataset.action = "play";
        $('#spieleranzeige')[0].innerText = "Warte auf die Anderen";
        resethandcards();
    }

    deletecard(id);

}

/*Backendkommunikation: Masterkommunikation*/
function jscommando(befehl){
    socket.emit('command_message', befehl);
}

//Bestätigen der Teamanzahl
$( "#confirmnumberofteams" ).click(function() {
    let anzahlTeams = $('#inputGroupSelectTeams')[0].value;
    socket.emit('command_message', "game teams- " + anzahlTeams);
    socket.emit('command_message', "game start");
    $('#exampleModalCenterTitle')[0].innerHTML = "Spielhistorie";
    $('#staticBackdrop').modal('toggle');
});

function spielreset(){
    let spieler = $(".spielerbereich");
    spieler.popover('hide'); // löscht die Anzeige ob Spieler rausgehen können
    $('#kartenstapel').empty();
    $('#messages').empty();
    $('#playerorder').empty();
    $('#cards').empty();
}

//Einstellungen - starten eines neuen Spiels
$( "#neuesSpiel" ).click(function() {
    spielreset();
    $('#exampleModalCenter2').modal('toggle');
    $('#staticBackdrop').modal('toggle');
    $("#gamestartfirststep")[0].classList.remove("d-none");
    $("#closeinfofenster")[0].classList.add("d-none"); //lässt das Linkteilen etc bei dem spielersteller auftauchen
    $('#exampleModalCenterTitle')[0].innerHTML = "Los geht's!";
    $('#einladungslink')[0].value = window.location.href;
    $("#linkcontrol")[0].classList.remove("d-none");
    teamcreator = true;
    ersterzug = true;
    spielerbeigetreten = false;
    socket.emit('command_message', "game new");

});



$("#gamestartfirststep").click(function() {
    neueSpielerReihenfolgeAnBackend(".spielernamestart");
    socket.emit('command_message', "game teams possible");
    spielerbeigetreten = true;
});


$("#showstats").click(function() {
    $("#statscontainer")[0].classList.toggle("d-none");
});

$("#settingbutton").click(function() {
    socket.emit('command_message', "game stats");
});



$("#desktopview").click(function(){
   $('#spieleranzeigedesktop')[0].classList.toggle("d-none");
});

/*Updated die Handkarten mit dem Backenddaten*/
function resethandcards(){
    socket.emit('command_message', "cards mine");
}

/*löscht Karte aus der Hand*/
function deletecard(id){
    $('#' + id).remove();
}

/*erstellt die Handkarten im Frontend*/
function createOptions(value){
    let element = document.createElement("li");
    let bild = document.createElement("img");
    let position = $('#cards li').length;
    if (position === undefined){
        position = 0;
    }

    element.dataset.card = value;
    element.id = "card" + position;
    element.setAttribute( "onClick", "playCard(this.dataset.card, this.id);" );

    bild.srcset = "../assets/" + value + ".png";
    element.appendChild(bild);
    $('#cards').append(element);
}


//legt die Handkarte in die Mitte
function legeKarte(karte){
    let element = document.createElement("li");
    let bild = document.createElement("img");
    let position = $('#kartenstapel li').length;
    if (position === undefined){
        position = 0;
    }
    let nachrechts = Math.floor(Math.random() * 16) + 35;
    let drehen = Math.floor(Math.random() * 21) - 10;

    if (screen.width <= 576){ //kleinerer Bildschirm -> kleinere Varianz
        nachrechts = nachrechts - 15;
    }

    element.id = "gespielteKarte" + position;
    element.style.marginLeft = nachrechts + "%";
    element.style.transform = "rotate(" + drehen + "deg)";
    element.style.zIndex = position;

    bild.srcset = "../assets/" + karte + ".png";
    element.appendChild(bild);
    $('#kartenstapel').append(element);
}

let sondermessage = false; //Variable um den Text in der Topbar anzupassen (z.B. Kartentausch)

//füllt die Spielerbar unter dem Topmenü
function spielerleistefüllen(array){
    array.forEach(function(player){

        let spieler = document.createElement("li");
        let position = $('#spielerliste li').length;

        if (position === undefined){
            position = 0;
        }

        spieler.classList.add("col");
        spieler.classList.add("spielerbereich");

        spieler.id = "spieler" + position;
        spieler.setAttribute('data-container',"body");
        spieler.setAttribute('data-toggle',"popover");
        spieler.setAttribute('data-placement',"bottom");
        spieler.setAttribute('data-content',"Servus"); //Hier soll in Zukunft angezeigt werden, ob der Spieler rausgehen kann

        spieler.innerHTML = player;
        $("#spielerliste").append(spieler);
    });
}



//Einstellungen Spielerreihenfolge - Aktion um den Spieler nach oben in der Liste zu bewegen
function spielernachoben(position, liste){
    let obererSpieler = $(liste)[position - 1].innerText;
    $(liste)[position - 1].innerText = $(liste)[position].innerText;
    $(liste)[position].innerText = obererSpieler;

}
//Einstellungen Spielerreihenfolge - Aktion um den Spieler nach unten in der Liste zu bewegen
function spielernachunten(position, liste){
    let untererSpieler = $(liste)[position + 1].innerText;
    $(liste)[position + 1].innerText = $(liste)[position].innerText;
    $(liste)[position].innerText = untererSpieler;

}
//Einstellungen Spielerreihenfolge - Schickt die neue Reihenfolge an das Backend

function neueSpielerReihenfolgeAnBackend(liste){
    let neueReihenfolge = "";
    for ( i = 0; i < $(liste).length; i++ ) {
        neueReihenfolge = neueReihenfolge + " " + $(liste)[i].innerText;
    }
    socket.emit('command_message', "game order-" + neueReihenfolge);
}

//Empfang von Nachrichten aus dem Backend
socket.on('command_message', function(msg){



    let action = msg[0];
    let content = msg[1];
    let messagetext = undefined;


    /*Messagetexte*/
    let messagetext_newGame = content + " hat ein neues Spiel erstellt.";
    let messagetext_noplayers = "Es haben leider keine Spieler gejoint.";
    let messagetext_Teamsnotpossible = "Teamanzahl nicht möglich";
    let messagetext_noTeams = "Es gibt bei diesem Spiel keine Teams.";
    let messagetext_Teams = "Die Teams sind: " + content;
    let messagetext_Start = "Das Spiel geht los!";
    if (Array.isArray(content)){
        messagetext_play = content[0] + " legt eine(n): " + content[1];
        if (content.length === 3){
            messagetext_teufel = content[0] + " legt für " + content[1] +" eine(n): " + content[2];
        }
    }
    let messagetext_notyourturn = "Du bist leider nicht dran.";
    let messagetext_exchange = "Du hast folgende Karte erhalten: " + content;



    let showmycardsdiv = $('#showmycards')[0];
    let teamwahlformular = $('#teamwahl')[0];





    if(action === "cards mine"){ //Handkarten anzeigen
        let cardsarray = content;
        $('#cards').empty();
        cardsarray.forEach(createOptions);

        }
    /*
    * muss reworked werden
    */
    else if(action === "game new"){ //Game joinen
            showmycardsdiv.classList.add("d-none");
            messagetext = messagetext_newGame;

    } else if(action === "game teams show"){
        if(content === "no teams"){
            messagetext = messagetext_noTeams;
        } else{
            messagetext = messagetext_Teams;
            let anzahlteams = content.length;
            let spieler = $(".spielerbereich");
            let teamnummer = 1;
            for ( i = 0; i < spieler.length; i++ ) {
                if (teamnummer > anzahlteams){
                    teamnummer = 1;
                }
                spieler[i].classList.add("team" + teamnummer);
                teamnummer += 1;
            }
        }
        if(teamcreator){
            teamwahlformular.classList.add("d-none");
            teamcreator = false;
        }
        showmycardsdiv.classList.remove("d-none");
        $("#ladeanzeige")[0].classList.add("d-none"); //lässt die Ladeanzeige verschwinden

    } else if(action === "game start"){
        if(content === "game started"){
            spielreset();
            messagetext = messagetext_Start;
            spielerbeigetreten = true;
            $("#linkcontrol")[0].classList.add("d-none"); //lässt das Linkteilen etc bei nichtspielerstellern verschwinden
            $("#ladeanzeige")[0].classList.add("d-none"); //lässt die Ladeanzeige verschwinden
            $("#gamestartfirststep")[0].classList.add("d-none");
            $("#closeinfofenster")[0].classList.remove("d-none"); //lässt das Linkteilen etc bei nichtspielerstellern verschwinden
        } else{
            messagetext = messagetext_noplayers;
        }

    } else if(action === "play"){
        if (ersterzug === true){  //ggf. löschen wird akutell nicht mehr benötigt
            ersterzug = false;
        }
        if(content === "not your turn"){
            messagetext = messagetext_notyourturn;
            resethandcards();
        } else{
            legeKarte(content[1]);
            messagetext = messagetext_play;
        }


    } else if(action === "cards teufel"){ // Teufel spielen
        let cardsarray = content;
        $('#cards').empty();
        cardsarray.forEach(createOptions);
        showmycardsdiv.dataset.action = "teufel";

    } else if (action === "teufel"){ //aktueller Spieler wird angezeigt
        legeKarte(content[2]);
        messagetext = messagetext_teufel;

    } else if (action === "game turn who"){ //aktueller Spieler wird angezeigt
        if(!(sondermessage)){
            if(content === username){
                $('#spieleranzeige')[0].innerText = "Du bist dran";
            } else {
                $('#spieleranzeige')[0].innerText = content + " ist dran";
            }
        }

    } else if (action === "exchange start"){ // Karten tauschen
        showmycardsdiv.dataset.action = "exchange";
        $('#spieleranzeige')[0].innerText = "Tausche an: " + content;
        sondermessage = true;

    } else if (action === "exchange received"){
        resethandcards();
        sondermessage = false;
        messagetext = messagetext_exchange;
        $(".spielerbereich").popover('hide');

    } else if (action === "game teams"){
        $('#cards').empty();
        $("#spielerliste").empty();
        messagetext = messagetext_Teamsnotpossible;

    } else if (action === "new stack"){ //leert Kartenstapel für eine neue Runde
        let letzteKarte = $('#kartenstapel')[0].lastChild;
        letzteKarte.style.zIndex = 0;
        $('#kartenstapel').empty();
        $('#kartenstapel').append(letzteKarte);


    } else if (action === "game players"){
        $("#spielerliste").empty();
        spielerleistefüllen(content);

    } else if (action === "game order"){
        $("#spielerliste").empty();
        spielerleistefüllen(content);

    } else if (action === "comes out"){ //zeigt an wer dran ist
        let spieler = $(".spielerbereich");
        for ( i = 0; i < spieler.length; i++ ) {
            if (content[i] === true){
                spieler[i].dataset.content = "ja";
            } else{
                spieler[i].dataset.content = "nein";
            }

        }
        spieler.popover('toggle');


    } else if (action === "game teams possible"){
        $('#inputGroupSelectTeams').empty();

        for ( i = 0; i < content.length; i++ ) {
            let teamoption = document.createElement("option");
            teamoption.value = content[i][1];
            teamoption.innerText = content[i][0];
            $('#inputGroupSelectTeams').append(teamoption);
        }

        $("#linkcontrol")[0].classList.toggle("d-none");
        $("#teamwahl")[0].classList.toggle("d-none");
        $("#gamestartfirststep")[0].classList.toggle("d-none");

    } else if (action === "freeze"){
        if(spielerbeigetreten === true){
            if (content === true){
                $("#freeze")[0].classList.remove("d-none");
            } else {
                $("#freeze")[0].classList.add("d-none");
            }
        }
    } else if (action === "game stats"){

        $("#statslist").empty();

        let liste = "<li class='statheadline'>" + "Bei wieviel Runden konnte der Spieler rausgehen?" + "</li>";
        let listenelement = "";
        let progressbar = "<div class=\"progress\">\n" +
            "  <div class=\"progress-bar\" role=\"progressbar\" style=\"width: prozentwert;\" aria-valuenow=\"25\" aria-valuemin=\"0\" aria-valuemax=\"100\">prozentwert</div>\n" +
            "</div>";

        for (let Spieler in content.comesOutPercentages) {
            listenelement = "<li>" + Spieler + "<br>" + progressbar.replace(/prozentwert/g,content.comesOutPercentages[Spieler] + "%") + "</li>";
            liste = liste + listenelement;
        }


        function statsauslesen (datenelement, headline) {

            if (datenelement.length === 2) {
                liste = liste + "<br>" + "<li class='statheadline'>" + headline + "</li>";
                listenelement = "<li>" + datenelement[0] + "x " + datenelement[1] + "</li>";
                liste = liste + listenelement;
            } else if (datenelement.length > 0) {
                liste = liste + "<br>" + "<li class='statheadline'>" + headline + "</li>";
                listenelement = "<li>" + datenelement[0] + "x";
                listenelement = listenelement + " " + datenelement[1];
                for (i = 2; i < datenelement.length; i++) {
                    listenelement = listenelement + ", " + datenelement[i];
                }
                listenelement = listenelement + "</li>";
                liste = liste + listenelement;
            }
        }
        statsauslesen(content.mostPlayedFours, "Wer läuft dauernd rückwärts?");
        statsauslesen(content.mostPlayedTacs, "Wer hat am meisten TACs gespielt?");
        statsauslesen(content.mostOftenTact, "Wer wurde am häufigsten getact?");
        statsauslesen(content.cardWasTact, "Welche Karte wurde am häufigsten getact?");
        statsauslesen(content.mostPlayedTricksers, "Wer hat am häufigsten getrickst?");
        statsauslesen(content.mostPlayedMasters, "Wer hatte am meisten Masterkarten?");
        statsauslesen(content.wasPlayedByTeufel, "Was wurde am häufigsten mit dem Teufel gespielt?");

        statsauslesen(content.playerData.didExchange, "Welche Karte hast du am häufigsten gegeben?");
        statsauslesen(content.playerData.getExchanged, "Welche Karte hast du am häufigsten bekommen?");
        statsauslesen(content.playerData.gotByNarr, "Welche Karte hast du am häufigsten durch den Narr erhalten?");
        statsauslesen(content.playerData.lostByNarr, "Welche Karte hast du am häufigsten durch den Narr verloren?");
        statsauslesen(content.playerData.gotDealt, "Welche Karte hast du am häufigsten ausgesteilt bekommen?");
        statsauslesen(content.playerData.played, "Welche Karte hast du am häufigsten gelegt?");




        $("#statslist")[0].innerHTML = liste;

    } else if (action === "kick"){
        $("#" + content).remove();
    } else if (action === "is_online"){
        zurspielerlistehinzufuegen(content);
    }

    // CSS Klasse für Nachricht links oder rechts ins Frontend ausspielen
    if (messagetext){
        if(messagetext.startsWith(username)) {
            $('#messages').prepend($('<li>').addClass("mymessage").html(messagetext));
        } else {
            $('#messages').prepend($('<li>').addClass("extern").html(messagetext));
        }
        $('#spielschrittedesktop').prepend($('<li>').html(messagetext));
    }

});

socket.on('game_killed', function(p) {
    window.location.href = '/404.html';
});


$("#newgamesharelink").click(function(){
    $('#einladungslink')[0].select();
    document.execCommand("copy");
});

function zurspielerlistehinzufuegen(playername){
    let spieler = document.createElement("li");
    let position = $('#playerorder li').length;
    spieler.setAttribute("id", playername);
    let spielername = "<span class='spielernamestart'>" + playername + "</span>";
    let steuerlemente = "<span>";
    let steuerelementeende = "</span>";
    let arrowup = '<svg onclick="spielernachoben(position,\'.spielernamestart\')" class="bi bi-chevron-up" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
        '                                  <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 01.708 0l6 6a.5.5 0 01-.708.708L8 5.707l-5.646 5.647a.5.5 0 01-.708-.708l6-6z" clip-rule="evenodd"/>\n' +
        '                              </svg>';
    let arrowdown = '<svg onclick="spielernachunten(position,\'.spielernamestart\')" class="bi bi-chevron-down" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
        '                              <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 01.708 0L8 10.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z" clip-rule="evenodd"/>\n' +
        '                              </svg>';

    if (position === undefined){
        position = 0;
    }

    arrowup = arrowup.replace("position", position);
    arrowdown = arrowdown.replace("position", position);


    steuerlemente = steuerlemente + arrowdown + arrowup + steuerelementeende;


    spieler.innerHTML = spielername + steuerlemente;
    $("#playerorder").append(spieler);
}

//join the lobby Message
socket.on('is_online', function(playername) {
    zurspielerlistehinzufuegen(playername);
});

// ask username
let username = "";
socket.on('enterUserName', function(bMessage) {
    if (bMessage) {
        username = prompt("Dieser Name kann dem Spiel nicht beitreten oder existiert bereits. Bitte wähle einen anderen oder versuche es später noch einmal.");
    }
    else if (username === ""){
        username = prompt('Bitte sag mir deinen Namen.');
    }
    username = username.trim();
    $('#spieleranzeige')[0].innerText = "Hallo " + username;

    let spielleiter = window.location.search;
    if (spielleiter === "?master=true"){
        teamcreator = true;
        window.history.replaceState({}, document.title, "/" + window.location.href.split("?")[0].split("/").pop());
        $('#einladungslink')[0].value = window.location.href;
        $('#staticBackdrop').modal('show');
    }

    socket.emit('username', [username, window.location.href.split("/")[3]]);

});

