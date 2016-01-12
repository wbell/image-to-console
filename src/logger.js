'use strict';

var chalk = require('chalk');
var prefix = '[itc]';
var separator = '';

function Logger(options){
  this.logLevel = options.log;
}

Logger.prototype.log = function Log(msg) {
  if(this.logLevel < 2) return false;

  console.log(chalk.cyan(prefix), chalk.white(separator), chalk.gray(JSON.stringify(msg)));
};

Logger.prototype.warn = function Warn(msg) {
  if(this.logLevel < 1) return false;

  console.log(chalk.yellow(prefix), chalk.white(separator), chalk.gray(JSON.stringify(msg)));
};

Logger.prototype.error = function Error(msg) {

  console.log(chalk.red(prefix), chalk.white(separator), chalk.gray(JSON.stringify(msg)));
};

module.exports = Logger;
