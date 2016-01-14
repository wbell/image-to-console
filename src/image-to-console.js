'use strict';

var _ = require('lodash');
var defaults = require('./defaults.json');
var request = require('request');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var Logger = require('./logger');
var log = null;
var q = require('q');
var jimp = require('jimp');
var readimage = require('readimage');

/**
 * ImageToConsole constructor function
 * @param {Array} imgPaths  array of image paths
 * @param {Object} options  options map passed to plugin
 * @return {Promise}
 */
function ImageToConsole(imgPaths, options) {
  if (!(this instanceof ImageToConsole)) {
    return new ImageToConsole(imgPaths, options);
  }

  // set properties
  this.paths = imgPaths;
  this.options = _.extend({}, defaults, options);
  this.queue = [];

  // create logger with options from user
  log = new Logger(this.options);

  log.info('ImageToConsole instance constructed');

  return this.collectImages()
    .then(this.bufferImages)
    .then(this.resizeImages);
}

/**
 * collect images in the temp directory
 * @return {Promise} resolves with array of temp directory paths
 */
ImageToConsole.prototype.collectImages = function CollectImages() {
  var deferred = q.defer();
  var _this = this;
  var paths = this.paths;
  var options = this.options;
  var localPaths = [];

  // create temp directory
  mkdirp.sync(options.temp);
  log.info('temp directory created');

  _.forEach(paths, function(filepath, i) {
    var requestOptions = null;
    var filename = _.last(filepath.split('/'));
    var localPath = path.resolve(options.temp, filename);
    var ws = fs.createWriteStream(localPath)
      .on('error', _writeError)
      .on('finish', function(err) {
        _writeSuccess(err, localPath, i);
      });

    // if web image, request over http
    // if local, pipe to temp location
    if (_.startsWith(filepath.toLowerCase(), 'http')) {

      log.info('requesting "' + filename + '" over http');

      request(filepath)
        .pipe(ws)
        .on('error', _readError);

    } else {

      log.info('writing "' + filename + '" to temp directory');

      fs.createReadStream(filepath)
        .pipe(ws)
        .on('error', _readError);
    }
  });

  /**
   * callback for successful write
   * @param  {Object} err error object
   * @param {String} localPath image path from temp dir
   * @param {Number} i index of image
   */
  function _writeSuccess(err, localPath, i) {
    if (err) {
      log.error(err);
      deferred.reject(err);
    }

    log.info('"' + localPath + '" saved');
    localPaths[i] = localPath;
    _checkLengths();
  }

  /**
   * once all images are saved, the promise resolves
   */
  function _checkLengths() {
    if (_.compact(localPaths).length === paths.length) {
      deferred.resolve(localPaths);
      log.success('all images saved to temp directory');
    }
  }

  /**
   * callback for write error
   * @param  {Object} err error object
   */
  function _writeError(err) {
    log.error('Write error: ' + JSON.stringify(err));
    deferred.reject(err);
  }

  /**
   * callback for read error
   * @param  {Object} err error object
   */
  function _readError(err) {
    log.error('Read error: ' + JSON.stringify(err));
    deferred.reject(err);
  }

  return deferred.promise;
};

/**
 * converts all images and frames into buffers rgba buffers
 * @param  {Array} localPaths list of locally saved image paths
 * @return {Promise}          resolves with array of image buffers
 */
ImageToConsole.prototype.bufferImages = function BufferImages(localPaths) {

  var deferred = q.defer();
  var bufferPrep = [];

  _.forEach(localPaths, function(localPath, i) {

    // get file buffer to pass to "readimage"
    fs.readFile(localPath, function(err, imageBuffer) {

      if (err) {
        log.error('file read error: ' + JSON.stringify(err));
        deferred.reject(err);
      }

      log.info('file read success: '+localPath);
      _readFileCallback(imageBuffer, localPath, i);
    });

  });

  /**
   * called upon 'readFile' success
   * @param  {Buffer} imageBuffer image buffer
   * @param  {String} localPath   temp path
   * @param  {Number} i           index of image
   */
  function _readFileCallback(imageBuffer, localPath, i) {

    // get data from image, pass to parsing method
    readimage(imageBuffer, function(err, imageData) {

      if (err) {
        log.error('"readimage" error: ' + JSON.stringify(err));
        deferred.reject(err);
      }

      log.info('"readimage" success: '+localPath);
      _readImageCallback(imageData, localPath, i);
    });
  }

  /**
   * called upon 'readimage' success
   * @param  {Object} imageData hash of image metadata
   * @param  {String} localPath   temp path
   * @param  {Number} i           index of image
   */
  function _readImageCallback(imageData, localPath, i) {
    console.log(imageData);
    var frames = imageData.frames;
    var myBuffers = [];
    var frame = frames[0];

    if(frame.delay) {
      log.info('native animation speed is "'+frame.delay+'" for "'+localPath+'"');
    }

    // if animated gif, there will be multiple frames
    if(frames.length > 1){
      _.forEach(frames, function(frame){
        myBuffers.push(frame.data);
      });
    } else {
      myBuffers.push(frame.data);
    }

    bufferPrep[i] = myBuffers;

    if(_.compact(bufferPrep).length === localPaths.length){
      deferred.resolve(_.flatten(bufferPrep));
    }

  }

  return deferred.promise;

};

/**
 * resizes image buffers to the specified dimensions
 * @param  {Array} bufferArr array of image buffers
 * @return {Promise}         resolves with array of resized buffers
 */
ImageToConsole.prototype.resizeImages = function ResizeImages(bufferArr){
  console.log(bufferArr);
};

module.exports = ImageToConsole;
