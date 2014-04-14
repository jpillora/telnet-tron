var net = require('net');
var common = require("./common");
var clear = require('clear');
require('colors');
clear();

var socket;

//write input to server
process.stdin.setRawMode(true);
process.stdin.on('data', function(data) {
  //allow ctrl+c to exit 
  if(data[0] === 0x03)
    return process.exit(0);
  //up 1 down 2 right 3 left 4
  if(socket &&
     data.length === 3 &&
     data[0] === 0x1b &&
     data[1] === 0x5b &&
     data[2] >= 0x41 &&
     data[2] <= 0x44) {
    var buff = new Buffer(1);
    buff[0] = data[2]-0x40;
    socket.write(buff);
  }
});

function receivedState(buff) {
  var game;
  try {
    game = JSON.parse(buff.toString());
  } catch(err) {
    return;
  }
  // console.log('GET WALLS')
  var walls = common.getWalls(game);
  // console.log(JSON.stringify(game, null, 2));
  // return;
  process.stdout.write('\n');
  clear(false);
  //draw header
  process.stdout.write('['+'LUMA'.red+' TRON]');
  var c = 0;
  for(var id in game.players) {
    var p = game.players[id];
    p.color = common.colors[c++];
    var status = ' ['+id+' ♥'+p.lives+']';
    process.stdout.write(status[p.color]);
  }
  process.stdout.write('             \n');
  //draw game
  for(var y = 0; y < game.h; y++) {
    for(var x = 0; x < game.w; x++) {
      var char;
      //boundary wall
      if(walls[x][y] === true) {
        char = '▒▒';
      //player wall
      } else if(walls[x][y]) {
        var player = walls[x][y];
        var move = player.moves[player.moves.length-1];
        if(player.x === x &&
           player.y === y) {
          char = player.dead ? '☠☠' : common.arrows[move.d];
        } else {
          char = '▒▒';
        }
        char = char[player.color];
      //no wall!
      } else {
        char = '  ';
      }
      process.stdout.write(char);
    }
    process.stdout.write('\n');
  }
}

function disconnected(err) {
  if(err && err.code === 'ECONNREFUSED')
    console.log('tron server down');
  else if(err)
    console.log('tron server error: %s', err.message);
  else
    console.log('disconnected');
  socket = null;
  setTimeout(connect, 1000);
}

function connect() {
  socket = net.connect(process.env.PORT || 3000, process.env.HOST || 'localhost');
  socket.setNoDelay(true);
  socket.on('data', receivedState);
  socket.on('error', disconnected);
  socket.on('end', disconnected);
}

connect();
