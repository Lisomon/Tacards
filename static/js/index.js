// let socket = io();
const socket = io({transports: ["websocket"], upgrade: false, secure: true});
let linkzumneuenspiel = "";

$('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    $("#spielstartbutton").popover("hide");
    let gameId = $('#gameID').val();
    socket.emit('create_game', gameId.replace(/[\W_]+/g,"").toLowerCase());
    return false;
});

socket.on('game_exits', function(gameID) {
    $('#gameID').val('');
    $("#spielstartbutton").popover("show");
});

socket.on('game_created', function(gameID) {
    linkzumneuenspiel = window.location + gameID;
    window.location.href = linkzumneuenspiel + "?master=true";
});
