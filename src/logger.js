'use strict';

var chalk = require('chalk');
var prefix = '[itc]';

function Logger(options){
  this.logLevel = options.log;
}

Logger.prototype.info = function Log(msg) {
  if(this.logLevel < 2) return false;

  console.log(chalk.cyan(prefix), chalk.gray(JSON.stringify(msg)));
};

Logger.prototype.success = function Success(msg) {
  if(this.logLevel < 1) return false;

  console.log(chalk.green(prefix), chalk.gray(JSON.stringify(msg)));
};

Logger.prototype.warn = function Warn(msg) {
  if(this.logLevel < 1) return false;

  console.log(chalk.yellow(prefix), chalk.gray(JSON.stringify(msg)));
};

Logger.prototype.error = function Error(msg) {

  console.log(chalk.red(prefix), chalk.gray(JSON.stringify(msg)));
};

module.exports = Logger;
