#!/usr/bin/env node

'use strict';

var pkg = require('../package.json');
var program = require('commander');
var itc = require('./image-to-console');

program
  .version(pkg.version)
  .arguments('<imgPaths...>')
  .option('-w, --width <width>', 'width (in characters) of rendered ascii image, default: 40', parseInt)
  .option('-h --height <height>', 'height (in characters) of rendered ascii image, default: null (maintains aspect ratio)', parseInt)
  .option('-i, --index <index>', 'index to start rendering at, default: 0', parseInt)
  .option('-c, --cycle', 'cycle through the images, animated gif style')
  .option('-lp, --loop [loop]', 'loop infinitely or specify number of times to loop through the images (automatically enables cycle)', parseInt)
  .option('-sp, --speed <speed>', 'cycle speed, in milliseconds', parseInt)
  .option('-sh, --shuffle', 'shuffle the image order')
  .option('-lg, --log <log>', 'specify the log level, default: 0 (errors only); 1 (errors, warnings); 2 (errors, warnings, info)', parseInt)
  .action(itc)
  .parse(process.argv);
