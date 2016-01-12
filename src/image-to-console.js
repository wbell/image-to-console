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

/**
 * ImageToConsole class function
 * @param {Array} imgPaths  array of image paths
 * @param {Object} options  options map passed to plugin
 * @return {Promise}
 */
function ImageToConsole(imgPaths, options) {
  if(!this instanceof ImageToConsole){
    return new ImageToConsole(imgPaths, options, defaults);
  }

  this.paths = imgPaths;
  this.options = _.extend({}, defaults, options);

  log = new Logger(this.options);

  return this.collectImages()
    .then(this.transformImages);
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

  _.forEach(paths, function(path, i) {
    var requestOptions = null;
    var filename = _.last(path.split('/'));
    var localPath = path.resolve(options.temp, filename);

    /**
     * if web image, use request to GET
     * if local image, pipe to temp
     */
    if (_.startsWith(path.toLowerCase(), 'http')) {
      requestOptions = {
        url: path,
        agentOptions: {
          secureProtocol: 'SSLv3_method'
        }
      };

      request(requestOptions)
        .pipe(fs.createWriteStream(localPath))
        .on('finish', function(err){
          _writeSuccess(err, localPath, i);
        })
        .on('error', _writeError);

    } else {
      fs.createReadStream(path)
        .pipe(fs.createWriteStream(localPath))
        .on('finish', function(err) {
          _writeSuccess(err, localPath, i);
        })
        .on('error', _writeError);
    }
  });

  /**
   * callback for successful write
   * @param  {Object} err error object
   */
  function _writeSuccess(err) {
    if (err) {
      log.error(err);
      deferred.reject(err);
    }

    localPaths[i] = localPath;
    _checkLengths();
  }

  /**
   * once all images are saved, the promise resolves
   */
  function _checkLengths() {
    if (_.compact(localPaths).length === paths.length) {
      deferred.resolve(localPaths);
    }
  }

  /**
   * callback for write error
   * @param  {Object} err error object
   */
  function _writeError(err) {
    log.error(err);
    deferred.reject(err);
  }

  return deferred.promise;
};

/**
 * resizes images to correct dimensions, saves as png
 * @param  {Array} localPaths list of locally saved image paths
 * @return {Promise}
 */
ImageToConsole.prototype.transformImages = function TransformImages(localPaths){
  log.log(localPaths);
  log.warn(localPaths);
  log.error(localPaths);
};

module.exports = ImageToConsole;
