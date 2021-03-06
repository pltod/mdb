#!/usr/bin/env node

var config = require('./config.json');
var debug = require('debug')('mdb');
var args = require('minimist')(process.argv.slice(2));
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var log = require('util').log;
var path = require('path');
var fs = require('fs');
var async = require('async');


((args._[0] === 'help') || args.help || args.h) && help();
(args._[0] === 'start') && start();
(args._[0] === 'started') && isStarted();
(args._[0] === 'init') && (args._[1] === 'collection') && initCollection(false);
(args._[0] === 'reinit') && (args._[1] === 'collection') && initCollection(true);
(args._[0] === 'init') && (args._[1] === 'db') && initDb(false);
(args._[0] === 'reinit') && (args._[1] === 'db') && initDb(true);


function start() {
  validLocation(args.in) ? startDb(path.resolve(args.in)) : startInDefault()
}

function isStarted() {
  exec('ps -Aef | grep mongo', function(err, stdout, stderr) {
    if (err) {
      throw err
    } else {
      console.log(stdout)
    }
  })
}

function initCollection(mustDrop) {
  if (!fs.existsSync(config.defaultDataSingleFile)) {
    log('Please create json file with data named "' + config.defaultDataSingleFile + '" in ' + process.cwd());
    return;
  }
  
  initSingle(config.defaultDataSingleFile, config.defaultDatabase, (args.name || config.defaultCollection), mustDrop);
}

function initDb(mustDrop) {
  initMultiple((args.name || config.defaultDatabase), mustDrop)
}

function help() {
  console.log(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf8'));
}

function validLocation(loc) {
  return loc && typeof loc === 'string' && fs.existsSync(path.resolve(loc))
}

function startInDefault() {
  var loc = config.defaultMongoLocation;
  if (!validLocation(loc)) {
    fs.mkdirSync(loc);
  } 
  startDb(path.resolve(loc));
}

function startDb(loc) {
  log('Starting db in ' + loc + ' ...');
  var pr = spawn('mongod', ['--dbpath', loc]);
  pr.stdout.on('data', function (data) {
    log(data.toString());
  });  
}

function initSingle(file, dbName, collectionName, mustDrop, callback) {
  debug ('About to import file ' + file + ' into ' + dbName);
  var importParams = [
    '--host', config.server, 
    '--port', config.port,
    '--db', dbName, 
    '--collection', collectionName, 
    '--file', file,
    '--jsonArray'
  ];
  
  if (mustDrop) {
    importParams.push('--drop')
  }
  var pr = spawn('mongoimport', importParams);
  pr.stdout.on('data', function (data) {
    log(data.toString());
  });
  pr.stderr.on('data', function (data) {
    log(data.toString());
    if (callback) {
      callback(data)
    }
  });  
  pr.on('close', function (code) {
    if (callback) {
      callback()
    }
  });
}

function initMultiple(dbName, mustDrop) {
  var list;
  try {
    list = fs.readdirSync(config.defaultDataLocation);
    (list.length === 0) ? log('WARNING: There are no files in your data folder') : log('Files found, processing...');    
  } catch(ex) {
    log('Please create folder named "' + config.defaultDataLocation + '" in ' + process.cwd() + ' and put some json files in it.')
    return;
  }
  async.eachSeries(list, function (file, callback) {
    (path.extname(file) === '.json') && initSingle(path.join(config.defaultDataLocation, file), dbName, path.basename(file, '.json'), mustDrop, callback)
  });
}