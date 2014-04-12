var net = require('net');

var socket;

//write input to server
process.stdin.setRawMode(true);
process.stdin.on('data', function(data) {
  //allow ctrl+c to exit 
  if(data[0] === 0x03)
    return process.exit(0);

  //up down left right
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
  console.log(game.players);
}

function disconnected(err) {
  if(err && err.code === 'ECONNREFUSED')
    console.log('tron server down');
  else
    console.log('disconnected');

  socket = null;

  setTimeout(connect, 1000);
}

function connect() {
  socket = net.connect(3000);
  socket.setNoDelay(true);
  socket.on('data', receivedState);
  socket.on('error', disconnected);
  socket.on('end', disconnected);
}

connect();
