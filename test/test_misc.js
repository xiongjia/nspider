'use strict';

var should = require('should'),
  util = require('util');

describe('Test lib/misc.js', function () {
  var misc;

  misc = require('../lib/misc.js');

  it('Interface Testing', function (done) {
    should.exist(misc);
    misc.should.have.properties([
      'pkgInf', 'dbgTrace', 'logger', 'osProxy', 'defaultOpts']);

    done();
  });

  it('pkgInf Testing', function (done) {
    var name, version, fullName;

    misc.pkgInf.should.have.properties([
      'getName', 'getVersion', 'getFullName']);

    name = misc.pkgInf.getName();
    name.should.equal('nspider');

    version = misc.pkgInf.getVersion();
    version.should.match(/^\d\.\d\.\d$/);

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

  it('checkOpts Test', function (done) {
    misc.defaultOpts.should.have.properties([
      'getItem', 'getData', 'setData', 'checkOpts']);
    done();
  });
});

