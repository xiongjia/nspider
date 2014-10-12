'use strict';

var logger = require('winston'),
  optimist = require('optimist')
    .alias('h', 'help')
    .describe('srcUrl', 'the source URL')
    .demand(['srcUrl'])
    .usage('nspider sample - List all links');

(function (argv) {
  var nspider, spider;

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  /* initialize */
  logger.cli();
  nspider = require('../')({ logger: logger });
  spider = new nspider.Spider();
  spider.on('fetchCompleted', function (data) {
    var links;
    links = data.dom('a');
    links.each(function (idx, item) {
      var link = data.dom(item).attr('href');
      logger.info('[%d] - %s', idx, link);
    });
  }).on('fetchError', function (err) {
    logger.error('fetchError: %s', err.toString());
  });
  logger.info('Fetch: %s', argv.srcUrl);
  spider.fetch(argv.srcUrl);
})(optimist.argv);

