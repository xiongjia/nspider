'use strict';

var util = require('util'),
  events = require('events'),
  _ = require('underscore'),
  Fetcher = require('./fetcher.js'),
  misc = require('./misc.js'),
  logger = misc.logger,
  dbgTrace = misc.dbgTrace('fetcher');

function Spider(opts) {
  var defOpts, self = this;

  logger.debug('Creating Spider');
  if (!(this instanceof Spider)) {
    return new Spider(opts);
  }
  events.EventEmitter.call(this);

  defOpts = misc.defaultOpts;
  opts = opts || {};
  opts.proxy = opts.proxy || defOpts.proxy;
  opts.fetchTimeout = opts.fetchTimeout || defOpts.fetchTimeout;
  opts.httpHdrUsrAgent = opts.httpHdrUsrAgent || defOpts.httpHdrUsrAgent;
  this._opts = opts;
  dbgTrace('Creating Spider: %j', this._opts);

  this._fetcher = new Fetcher({
    proxy: self._opts.proxy,
    httpHdrUsrAgent: self._opts.httpHdrUsrAgent,
    fetchTimeout: self._opts.fetchTimeout
  });

  this._fetcher.on('fetchError', function (err) {
    logger.error('Fetch error: %s', err.toString());
    self.emit('fetchError', err);
  }).on('fetchCompleted', function (data) {
    self.emit('fetchCompleted', {
      url: data.url,
      repStatusCode: data.response.statusCode,
      dom: data.dom,
      content: data.content
    }, data);
  });
}

util.inherits(Spider, events.EventEmitter);
exports = module.exports = Spider;

Spider.prototype.fetch = function (task, callback) {
  if (_.isString(task)) {
    this._fetcher.fetch({ url: task }, callback);
  }
  else {
    this._fetcher.fetch(task, callback);
  }
};

