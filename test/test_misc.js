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
    var handler;

    misc.logger.should.have.properties([
      'debug', 'warn', 'info', 'error', 'update']);

    handler = {
      error: function (msg) { msg.should.equal('error'); },
      warn: function (msg) { msg.should.equal('warn'); },
      info: function (msg) { msg.should.equal('info'); },
      debug: function (msg) { msg.should.equal('debug'); },
    };
    misc.logger.update({ handler: handler, silent: false });
    misc.logger.error('error');
    misc.logger.warn('warn');
    misc.logger.info('info');
    misc.logger.debug('debug');

    misc.logger.update({ handler: {}, silent: true });
    done();
  });

  it('checkOpts Test', function (done) {
    misc.defaultOpts.should.have.properties([
      'getItem', 'getData', 'setData', 'checkOpts']);
    done();
  });
});

