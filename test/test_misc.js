'use strict';

var should = require('should'),
  util = require('util');

describe('Tests for lib/misc.js', function () {
  var misc;

  misc = require('../lib/misc.js');

  it('Interface Testing', function (done) {
    should.exist(misc);
    misc.should.have.properties([
      'pkgInf',
      'dbgTrace',
      'logger',
      'osProxy',
      'defaultOpts',
      'timeSpan',
      'parseMediaType']);
    done();
  });

  it('pkgInf Testing', function (done) {
    var name, version, fullName;

    misc.pkgInf.should.have.properties([
      'getName', 'getVersion', 'getFullName']);

    name = misc.pkgInf.getName();
    name.should.equal('nspider');

    version = misc.pkgInf.getVersion();
    version.should.match(/^(\d+\.){2}\d+$/);

    fullName = misc.pkgInf.getFullName();
    fullName.should.equal(util.format('%s_%s', name, version));

    done();
  });

  it('logger Testing', function (done) {
    var handler, msgs;

    misc.logger.should.have.properties([
      'debug', 'warn', 'info', 'error', 'update']);

    handler = {
      error: function (msg) { msgs.push(msg); },
      warn: function (msg) { msgs.push(msg); },
      info: function (msg) { msgs.push(msg); },
      debug: function (msg) { msgs.push(msg); }
    };

    msgs = [];
    misc.logger.update({ handler: handler, silent: false });
    misc.logger.error('error');
    misc.logger.warn('warn');
    misc.logger.info('info');
    misc.logger.debug('debug');
    msgs.should.containDeep(['error', 'warn', 'info', 'debug']);

    msgs = [];
    misc.logger.update({ handler: {}, silent: true });
    misc.logger.error('error');
    misc.logger.warn('warn');
    misc.logger.info('info');
    misc.logger.debug('debug');
    msgs.should.have.length(0);
    done();
  });

  it('checkOpts Testing', function (done) {
    var data, testOpts;

    misc.defaultOpts.should.have.properties([
      'getItem', 'getData', 'setData', 'checkOpts']);

    data = misc.defaultOpts.getItem('BadName');
    should.not.exist(data);
    data = misc.defaultOpts.getItem('fetchTimeout');
    data.should.equal(1000 * 30);
    data = misc.defaultOpts.getItem('httpHdrUsrAgent');
    data.should.equal(misc.pkgInf.getFullName());

    data = misc.defaultOpts.getData();
    data.should.have.properties(['fetchTimeout', 'proxy', 'httpHdrUsrAgent']);

    testOpts = { proxy: 'http://localhost:8080' };
    misc.defaultOpts.checkOpts(testOpts);
    testOpts.should.have.properties(['fetchTimeout', 'proxy', 'httpHdrUsrAgent']);
    testOpts.proxy.should.equal('http://localhost:8080');

    data = misc.defaultOpts.setData({ fetchTimeout: 888 }).getItem('fetchTimeout');
    data.should.equal(888);
    done();
  });

  it('timeSpan Testing', function (done) {
    var tmSpan;

    tmSpan = misc.timeSpan();
    tmSpan.should.have.properties(['start', 'end', 'getData']);
    tmSpan.start();
    setTimeout(function () {
      var data;
      tmSpan.end(); 
      data = tmSpan.getData();
      data.should.have.properties(['begin', 'end']);
      data.end.should.greaterThan(data.begin);
      done();
    }, 100);
  });

  it('parseMediaType Testing', function (done) {
    var testType, mediaType;

    testType = 'text/html; charset=ISO-8859-4';
    mediaType = misc.parseMediaType(testType);
    mediaType.should.have.properties(['type', 'subtype']);
    mediaType.type.should.equal('text');
    mediaType.subtype.should.equal('html');

    testType = 'badTestType';
    mediaType = misc.parseMediaType(testType);
    mediaType.should.have.properties(['type']);
    mediaType.type.should.equal('unknown');
    done();
  });
});

