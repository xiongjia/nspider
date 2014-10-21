'use strict';

var should = require('should'),
  stream = require('stream'),
  _ = require('underscore');

describe('Tests for lib/transport.js', function () {
  var transport, nock;

  /* transport module & mock data */
  transport = require('../lib/transport.js');
  nock = require('nock');

  it('Interface Testing', function (done) {
    should.exist(transport);
    transport.should.have.properties(['fetch']);
    done();
  });

  it('fetch string', function (done) {
    var fetchOpts;

    nock('http://tran.mock')
      .get('/testString')
      .reply(200, 'testString');

    fetchOpts = {
      url: 'http://tran.mock/testString',
      needContentBuff: true
    };
    transport.fetch(fetchOpts, function (err, data) {
      should.not.exist(err);
      data.statusCode.should.equal(200);
      should.exist(data.content);
      data.content.toString().should.equal('testString');
      done();
    });
  });

  it('fetch 404', function (done) {
    var fetchOpts;

    nock('http://tran.mock')
      .get('/err404')
      .reply(404);

    fetchOpts = {
      url: 'http://tran.mock/err404',
    };
    transport.fetch(fetchOpts, function (err, data) {
      should.not.exist(err);
      data.statusCode.should.equal(404);
      done();
    });
  });

  it ('fetch stream', function (done) {
    var testStream, fetchOpts, chunks, totalLen, content;

    nock('http://tran.mock')
      .get('/testStream')
      .reply(200, 'stream content');

    chunks = [];
    totalLen = 0;
    testStream = new stream.PassThrough();
    testStream.on('data', function (chunk) {
      chunks.push(chunk);
      totalLen += chunk.length;
    }).on('end', function () {
      var targetStart = 0;
      content = new Buffer(totalLen);
      _.each(chunks, function (item) {
        item.copy(content, targetStart, 0, item.length);
        targetStart += item.length;
      });
      content.toString().should.equal('stream content');
      done();
    });

    fetchOpts = {
      url: 'http://tran.mock/testStream',
      stream: testStream 
    };
    transport.fetch(fetchOpts, function (err, data) {
      should.not.exist(err);
      data.statusCode.should.equal(200);
    });
  });
});

