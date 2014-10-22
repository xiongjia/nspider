'use strict';

var should = require('should');

describe('Tests for lib/transport.js', function () {
  var transport, nock, misc;

  /* transport module & mock data */
  transport = require('../lib/transport.js');
  misc = require('../lib/misc.js');
  nock = require('nock');

  it('Interface Testing', function (done) {
    should.exist(transport);
    transport.should.have.properties(['fetch']);
    done();
  });

  it('fetch string', function (done) {
    var fetchOpts;

    nock('http://tran.mock')
      .defaultReplyHeaders({
        'Content-Type': 'text/plain'
      })
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
      should.exist(data.contentType);
      data.contentType.type.should.equal('text');
      data.contentType.subtype.should.equal('plain');
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

  it('fetch stream', function (done) {
    var testStream, fetchOpts;

    nock('http://tran.mock')
      .get('/testStream')
      .reply(200, 'stream content');

    testStream = misc.sinkBuffStream(function (err, data) {
      should.not.exist(err);
      data.toString().should.equal('stream content');
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

