#!/usr/bin/env node
var program = require('commander');
var pkg = require('./package.json');

//parse args
program
  .version(pkg.version)
  .usage('[options]')
  .option('-s, --server', 'Server mode', false)
  .option('-c, --client', 'Client mode', true)
  .option('-h, --host [ip]', 'Host [ip] to bind on', "0.0.0.0")
  .option('-p, --port [number]', 'Port [number] to listen on', 3000)
  .parse(process.argv);

process.env.PORT = program.port;
process.env.HOST = program.host;

if(program.server)
  require("./server");
else if(program.client)
  require("./client");