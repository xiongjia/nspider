'use strict';

var util = require('util'),
  events = require('events'),
  misc = require('./misc.js'),
  logger = misc.logger,
  dbgTrace = misc.dbgTrace('fetcher'),
  transport = require('./transport.js');

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

  /* create transport request */
  fetchReq = {
    url: task.url,
    proxy: task.proxy || this._opts.proxy,
    timeout: task.fetchTimeout || this._opts.fetchTimeout,
    httpHdrUsrAgent: task.httpHdrUsrAgent || this._opts.httpHdrUsrAgent,
    needContentBuff: !task.skipContentBuff,
    stream: task._stream
  };

  if (task.delay) {
    setTimeout(function () {
      self._fetchReq({ task: task, fetchReq: fetchReq }, callback);
    }, task.delay);
  }
  else {
    this._fetchReq({ task: task, fetchReq: fetchReq }, callback);
  }
  return this;
};

Fetcher.prototype._fetchReq = function (opts, callback) {
  var self = this;

  opts = opts || {};
  callback = callback || function () {};
  dbgTrace('fetchReq: %j', opts.fetchReq);

  transport.fetch(opts.fetchReq, function (err, response) {
    var detail, repErr, repErrMsg;

    if (err) {
      logger.warn('Fetch (%j) err: %s', opts.task, err.toString());

      detail = { err: err, task: opts.task };
      self.emit('fetchError', err, detail);
      callback(err);
      return;
    }

    if (response.statusCode !== 200) {
      logger.warn('Fetch (%j) error: statusCode %d',
        opts.task, response.statusCode);
      repErrMsg = util.format('Fetch error: statusCode == %d',
        response.statusCode);
      repErr = new Error(repErrMsg);

      detail = { err: repErr, task: opts.task, tmSpanFetch: response.tmSpan };
      self.emit('fetchError', repErr, detail);
      callback(repErr);
      return;
    }

    self._onFetchCompleted({ task: opts.task, response: response }, callback);
  });
};

Fetcher.prototype._onFetchCompleted = function (data, callback) {
  var detail, task, response, contentBuf, html;

  callback = callback || function () {};
  response = data.response;
  task = data.task;

  /* parse html response */
  contentBuf = '';
  if (response.contentType.type === 'text' && response.content) {
    try {
      contentBuf = response.content.toString(task.encoding || this._opts.encoding);
    }
    catch (err) {
      logger.warn('Content convert error: %s', err.toString());
      contentBuf = '';
    }
  }
  html = misc.parseHTML(contentBuf);
  if (html.domErr) {
    logger.warn('HTML parse err: %s', html.domErr.toString());
  }

  detail = {
    task: task,
    url: task.url,
    $: html.dom,
    dom: html.dom,
    content: response.content,
    contentType: response.contentType
  };
  this.emit('fetchCompleted', detail);
  callback(undefined, detail);
};

