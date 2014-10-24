'use strict';

var should = require('should');

describe('Tests for lib/spider.js', function () {
  var Spider, nock, misc;

  /* disable OS Proxy for Nock */ 
  misc = require('../lib/misc.js');
  misc.defaultOpts.setItem('proxy', undefined);

  Spider = require('../lib/spider.js');
  nock = require('nock');
  nock('http://spider.mock')
    .defaultReplyHeaders({
      'Content-Type': 'text/html'
    })
    .get('/testPage')
    .reply(200, '<a href="http://localhost"> Test <a>');

  it('Interface Testing', function (done) {
    should.exist(Spider);
    done();
  });

  it('Fetch DOM', function (done) {
    var spider, rcvEvts, testStream, task;

    function checkDOM(data) {
      should.exist(data);
      data.contentType.type.should.equal('text');
      data.contentType.subtype.should.equal('html');
      data.$('a').attr('href').should.equal('http://localhost');
    }

    rcvEvts = [];
    spider = new Spider();
    spider.on('fetchCompleted', function (data) {
      checkDOM(data);
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
      url: 'http://spider.mock/testPage',
      output: testStream
    };
    spider.fetch(task, function (err, data) {
      should.not.exist(err);
      checkDOM(data);
      rcvEvts.should.containDeep(['fetchCompleted']);
    });
  });
});
 
