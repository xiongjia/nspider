'use strict';

var util = require('util'),
  events = require('events'),
  _ = require('underscore'),
  Fetcher = require('./fetcher.js'),
  misc = require('./misc.js'),
  logger = misc.logger,
  dbgTrace = misc.dbgTrace('fetcher');

function Spider(opts) {
  var self = this;

  logger.debug('Creating Spider');
  if (!(this instanceof Spider)) {
    return new Spider(opts);
  }
  events.EventEmitter.call(this);

  opts = opts || {};
  misc.defaultOpts.checkOpts(opts);
  this._opts = opts;
  dbgTrace('Creating Spider: %j', this._opts);

  this._fetcher = new Fetcher({
    proxy: self._opts.proxy,
    httpHdrUsrAgent: self._opts.httpHdrUsrAgent,
    fetchTimeout: self._opts.fetchTimeout,
    dataEncoding: self._opts.dataEncoding
  });

  this._fetcher.on('fetchError', function (err, detail) {
    logger.error('Fetch error: %s', err.toString());
    self.emit('fetchError', err, detail);
  }).on('fetchCompleted', function (data) {
    self.emit('fetchCompleted', data);
  });
}

util.inherits(Spider, events.EventEmitter);
exports = module.exports = Spider;

Spider.prototype.fetch = function (task, callback) {
  dbgTrace('fetch task: %j', task);
  callback = callback || function () {};

  if (_.isString(task)) {
    /* 'task' is a string object. */
    dbgTrace('fetch url: %s', task);
    this._fetcher.fetch({ url: task }, callback);
    return this;
  }

  /* Check the 'output' field in task */
  if (task.output) {
    task._stream = task.output;
  }

  this._fetcher.fetch(task, callback);
  return this;
};

