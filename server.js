var net = require("net");
var crypto = require("crypto");
var common = require("./common");

//game state
var game = {
  w: 60,
  h: 20,
  players: {}
};
//open sockets list
var socks = {};

var pushUpdate = function() {
  var buff = new Buffer(JSON.stringify(game));
  for(var id in socks)
    socks[id].write(buff);
};

var resetPlayer = function(game, walls, player) {

  do {
    player.x = player.sx = Math.floor(Math.random()*(game.w-1)+1);
    player.y = player.sy = Math.floor(Math.random()*(game.h-1)+1);
  } while(walls[player.x] && walls[player.x][player.y]);

  player.dead = false;
  player.timeout = 5;
  if('lives' in player)
    player.lives--;
  else
    player.lives = 20;
  player.moves = [{
    v: 0,
    d: Math.floor(Math.random()*4)+1
  }];
};

var onConnection = function(sock) {

  var id = crypto.randomBytes(2).toString('hex');
  //create player
  var walls = common.getWalls(game);
  var player = {};
  resetPlayer(game, walls, player);

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

  var walls = common.getWalls(game);

  //every tick, advance all players 1 unit
  for(var id in game.players) {
    var player = game.players[id];

    if(player.dead) {
      if(player.lives > 0)
        if(player.timeout === 0)
          resetPlayer(game, walls, player);
        else
          player.timeout--;
      continue;
    }

    var move = player.moves[player.moves.length-1];
    if(player.nextd && common.ops[player.nextd] !== move.d) { 
      move = {
        v: 0,
        d: player.nextd
      };
      player.nextd = undefined;
      player.moves.push(move);
    }
    common.increment(player, move.d);
    move.v++;
    //did player just move into a wall?
    if(walls[player.x] && walls[player.x][player.y]) {
      player.dead = true;
    }
  }
  pushUpdate();
}, 100);

var server = net.createServer(onConnection);

server.listen(3000, function() {
  console.log('listening on 3000');
});
