var net = require("net");
var crypto = require("crypto");

//directions enum
var dirs = {
  UP: 1,
  DOWN: 2,
  RIGHT: 3,
  LEFT: 4
};
//opposites map
var ops = {
  1: 2,
  2: 1,
  3: 4,
  4: 3
};
//game state
var game = {
  w: 100,
  h: 60,
  players: {}
};
//open sockets list
var socks = {};

var pushUpdate = function() {
  var buff = new Buffer(JSON.stringify(game));
  for(var id in socks)
    socks[id].write(buff);
};

var onConnection = function(sock) {

  var id = crypto.randomBytes(2).toString('hex');
  var player = {
    x: 50,
    y: 30,
    d: dirs.RIGHT
  };

  console.log(id, 'connected');

  sock.setNoDelay(true);

  sock.on("data", function move(buff) {
    var dir = buff[0];
    if(dir >= 1 && dir <= 4)
      player.nextd = dir;
  });

  var disconnected = function(err) {
    if(err)
      console.error(id, 'ERROR', err);
    console.error(id, 'disconnected');
    delete game.players[id];
    delete socks[id];
  };
  sock.on("error", disconnected);
  sock.on("end", disconnected);

  //add player
  game.players[id] = player;
  socks[id] = sock;
  pushUpdate();
};

setInterval(function tick() {
  //every tick, advance all players 1 unit
  for(var id in game.players) {
    var player = game.players[id];

    if(player.nextd && ops[player.nextd] !== player.d) {  
      player.d = player.nextd;
      player.nextd = undefined;
    }

    switch(player.d) {
    case dirs.UP:
      player.y--;
      break;
    case dirs.DOWN:
      player.y++;
      break;
    case dirs.LEFT:
      player.x--;
      break;
    case dirs.RIGHT:
      player.x++;
      break;
    }
  }
  pushUpdate();
}, 1000);

var server = net.createServer(onConnection);

server.listen(3000, function() {
  console.log('listening on 3000');
});
