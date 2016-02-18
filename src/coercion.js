'use strict';

exports.boolean = function Boolean(bool) {
  if (typeof bool !== 'string') return false;

  return bool.toLowerCase() === 'true';
};

exports.parseInt = function ParseInt(numString){
  return parseInt(numString, 10);
};
