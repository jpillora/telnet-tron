
//directions enum
exports.dirs = {
  UP: 1,
  DOWN: 2,
  RIGHT: 3,
  LEFT: 4
};
//opposites map
exports.ops = {
  1: 2,
  2: 1,
  3: 4,
  4: 3
};

exports.arrows = {
  1: '◿◺',
  2: '◹◸',
  3: '▒▷',
  4: '◁▒'
};

exports.colors = [
  "yellow",
  "cyan",
  "green",
  "blue"
];

exports.increment = function(pos, dir) {
  switch(dir) {
  case exports.dirs.UP:
    pos.y--;
    break;
  case exports.dirs.DOWN:
    pos.y++;
    break;
  case exports.dirs.LEFT:
    pos.x--;
    break;
  case exports.dirs.RIGHT:
    pos.x++;
    break;
  }  
};

exports.getWalls = function(game) {
  var walls = [];
  for(var id in game.players) {
    var player = game.players[id];
    var pos = {
      x: player.sx,
      y: player.sy
    };
    for(var m = 0; m < player.moves.length; m++) {
      var move = player.moves[m];
      for(var v = 0; v < move.v; v++) {
        exports.increment(pos, move.d);
        if(!walls[pos.x])
          walls[pos.x] = [];
        walls[pos.x][pos.y] = player;
      }
    }

    if(player.x !== pos.x || player.y !== pos.y)
      throw new Error("Invalid game state");
  }
  for(var x = 0; x < game.w; x++) {
    if(!walls[x])
      walls[x] = [];
    walls[x][0] = true;
    walls[x][game.h-1] = true;
  }
  for(var y = 0; y < game.h; y++) {
    walls[0][y] = true;
    walls[game.w-1][y] = true;
  }
  return walls;
};
