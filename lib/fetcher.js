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
  var fetchReq, self = this;

  task = task || {};
  dbgTrace('fetch task: %j', task);

  /* create fetch request */
  fetchReq = {
    url: task.url,
    proxy: task.proxy || this._opts.proxy,
    timeout: task.fetchTimeout || this._opts.fetchTimeout,
    headers: {
      'User-Agent': task.httpHdrUsrAgent || this._opts.httpHdrUsrAgent
    }
  };

  if (task.delay) {
    setTimeout(function () {
      self._sndFetchReq({ task: task, fetchReq: fetchReq}, callback);
    }, task.delay);
  }
  else {
    this._sndFetchReq({ task: task, fetchReq: fetchReq}, callback);
  }

  return this;
};

Fetcher.prototype._sndFetchReq = function (data, callback) {
  var tmSpan, self = this;

  data = data || {};
  callback = callback || function () {};
  dbgTrace('fetchReq: %j', data.fetchReq);

  tmSpan = misc.timeSpan();
  request(data.fetchReq, function (err, response, body) {
    var detail, repErr, repErrMsg;

    tmSpan.end();
    if (err) {
      detail = { err: err, task: data.task, tmSpanFetch: tmSpan.getData() };
      logger.warn('Fetch (%j) err: %s', data.task, err.toString());
      callback(err, detail);
      self.emit('fetchError', err, detail);
      return;
    }

    if (response.statusCode !== 200) {
      logger.warn('Fetch (%j) error: statusCode %d',
        data.task, response.statusCode);
      repErrMsg = util.format('Fetch error: response == %d',
        response.statusCode);
      repErr = new Error(repErrMsg);
      detail = { err: err, task: data.task, tmSpanFetch: tmSpan.getData() };
      callback(err, detail);
      self.emit('fetchError', err, detail);
      return;
    }

    self._onFetchCompleted({
      task: data.task,
      response: response,
      body: body,
      tmSpanFetch: tmSpan.getData()      
    }, callback);
  });
};

Fetcher.prototype._onFetchCompleted = function (data, callback) {
  var dom, contentType, tmSpan, detail;

  callback = callback || function () {};
  /* parse server response */
  tmSpan = misc.timeSpan();
  contentType = misc.parseMediaType(data.response.headers['content-type']);
  dom = (contentType.type === 'text') ? cheerio.load(data.body) : {};
  tmSpan.end();

  detail = {
    task: data.task,
    url: data.task.url,
    $: dom,
    dom: dom,
    content: data.body,
    contentType: contentType,
    response: data.response,
    tmSpanFetch: data.tmSpanFetch,
    tmSpanParse: tmSpan.getData()
  };

  callback(undefined, detail);
  this.emit('fetchCompleted', detail);
};

