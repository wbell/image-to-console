#!/usr/bin/env node

'use strict';

var pkg = require('../package.json');
var program = require('commander');
var coercion = require('./coercion');
var itc = require('./image-to-console');

program
  .version(pkg.version)
  .arguments('<imgPaths...>')
  .option('-w, --width <width>', 'width (in characters) of rendered ascii image, default: 40', coercion.parseInt)
  .option('-H, --height <height>', 'height (in characters) of rendered ascii image, default: null (maintains aspect ratio)', coercion.parseInt)
  .option('-i, --index <index>', 'index to start rendering at, default: 0', coercion.parseInt)
  .option('-c, --cycle', 'cycle through the images, animated gif style')
  .option('-l, --loop [loop]', 'loop infinitely or specify number of times to loop through the images (automatically enables cycle)', coercion.parseInt)
  .option('-s, --speed <speed>', 'cycle speed, in milliseconds, default: 100', coercion.parseInt)
  .option('-S, --shuffle', 'shuffle the image order')
  .option('-L, --log <log>', 'log verbosity, default: 0 (errors only); 1 (also warnings and successes); 2 (also info)', coercion.parseInt)
  .option('-C, --cleanup [bool]', 'remove temp files upon process completion', coercion.boolean)
  .option('-d, --debug', 'returns the ImageToConsole instance (vs the promise chain) for testing and advanced usage')
  .action(itc)
  .parse(process.argv);
