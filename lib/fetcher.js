'use strict';

var util = require('util'),
  events = require('events'),
  request = require('request'),
  cheerio = require('cheerio'),
  misc = require('./misc.js'),
  logger = misc.logger,
  dbgTrace = misc.dbgTrace('fetcher');

function Fetcher(opts) {
  if (!(this instanceof Fetcher)) {
    return new Fetcher(opts);
  }
  events.EventEmitter.call(this);
  this._opts = opts || {};
  dbgTrace('Createing Fetcher: %j', this._opts);
}

util.inherits(Fetcher, events.EventEmitter);
exports = module.exports = Fetcher;

Fetcher.prototype.fetch = function (task, callback) {
  var self = this;

  task = task || {};
  callback = callback || function () {};
  dbgTrace('fetch task: %j', task);

  function sndRequest() {
    var duration, req;

    req = {
      url: task.url,
      proxy: task.proxy || self._opts.proxy,
      timeout: task.timeout || self._opts.fetchTimeout,
      headers: {
        'User-Agent': task.httpHdrUsrAgent || self._opts.httpHdrUsrAgent
      }
    };
    dbgTrace('http req: %j', req);
    duration = {};
    duration.begin = duration.end = Date.now();
    request(req, function (err, response, body) {
      var detail;
      duration.end = Date.now();
      if (err) {
        detail = { err: err, task: task, duration: duration };
        logger.warn('Fetch %j err: %s', task, err.toString());
        callback(err, detail);
        self.emit('fetchError', err, detail);
        return;
      }
      self._onFetchCompleted({
        task: task,
        response: response,
        body: body,
        duration: duration
      }, callback);
    });
  }
  if (task.delay) {
    setTimeout(sndRequest, task.delay);
  }
  else {
    sndRequest();
  }
};

Fetcher.prototype._onFetchCompleted = function (data, callback) {
  var dom, duration, detail;

  callback = callback || function () {};
  /* Load html DOM */
  duration = {};
  duration.begin = duration.end = Date.now();
  dom = cheerio.load(data.body);
  duration.end = Date.now();

  detail = {
    task: data.task,
    url: data.task.url,
    dom: dom,
    content: data.body,
    response: data.response,
    fetchDuration: data.duration,
    parseDuration: duration
  };
  callback(undefined, detail);
  this.emit('fetchCompleted', detail);
};

