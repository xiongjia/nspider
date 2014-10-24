'use strict';

var should = require('should');

describe('Tests for lib/fetcher.js', function () {
  var Fetcher, nock, misc;

  Fetcher = require('../lib/fetcher.js');
  misc = require('../lib/misc.js');

  nock = require('nock');
  nock('http://fetch.mock')
    .defaultReplyHeaders({
      'Content-Type': 'text/html'
    })
    .get('/testPage')
    .reply(200, '<a href="http://localhost"> Test <a>')
    .get('/errPage')
    .reply(404)
    .get('/delayTask')
    .reply(200, '');
 
  it('Interface Testing', function (done) {
    should.exist(Fetcher);
    done();
  });

  it('fetch test page', function (done) {
    var fetcher, task, rcvEvts, testStream;

    function checkFetchData(data) {
      var htmlTxt;

      should.exist(data);
      should.exist(data.task);
      data.url.should.equal('http://fetch.mock/testPage');
      data.task.url.should.equal(data.url);

      data.contentType.type.should.equal('text');
      data.contentType.subtype.should.equal('html');

      should.exist(data.content);
      htmlTxt = data.content.toString();
      htmlTxt.should.equal('<a href="http://localhost"> Test <a>');

      data.$.should.equal(data.dom);
      data.$('a').attr('href').should.equal('http://localhost');
    }

    rcvEvts = [];
    fetcher = new Fetcher();
    fetcher.on('fetchCompleted', function (data) {
      checkFetchData(data);
      rcvEvts.push('fetchCompleted');
    }).on('fetchError', function (err) {
      should.not.exist(err);
      rcvEvts.push('fetchError');
    });

    testStream = misc.sinkBuffStream(function (err, data) {
      var htmlTxt;

      should.not.exist(err);
      htmlTxt = data.toString();
      htmlTxt.should.equal('<a href="http://localhost"> Test <a>');
      done();
    });

    task = {
      url: 'http://fetch.mock/testPage',
      _stream: testStream
    };
    fetcher.fetch(task, function (err, data) {
      should.not.exist(err);
      rcvEvts.should.containDeep(['fetchCompleted']);
      checkFetchData(data);
    });
  });

  it('fetch error page', function (done) {
    var fetcher, rcvEvts, task;

    rcvEvts = [];
    fetcher = new Fetcher();
    fetcher.on('fetchCompleted', function (data) {
      should.not.exist(data);
      rcvEvts.push('fetchCompleted');
    }).on('fetchError', function (err) {
      should.exist(err);
      rcvEvts.push('fetchError');
    });

    task = { url: 'http://fetch.mock/errPage' };
    fetcher.fetch(task, function (err, data) {
      should.exist(err);
      should.not.exist(data);
      rcvEvts.should.containDeep(['fetchError']);
    });
    done();
  });

  it('fetch page (Delay Task)', function (done) {
    var fetcher, task, tmSpan;

    fetcher = new Fetcher();
    task = {
      url: 'http://fetch.mock/delayTask',
      delay: 30
    };
    tmSpan = misc.timeSpan();
    fetcher.fetch(task, function (err, data) {
      tmSpan.end();
      should.not.exist(err);
      should.exist(data);
      tmSpan.getVal().should.not.lessThan(30);
      done();
    });
  });
});

