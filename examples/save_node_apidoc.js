'use strict';

var logger = require('winston'),
  path = require('path'),
  fs = require('fs'),
  util = require('util'),
  toMarkdown = require('to-markdown').toMarkdown,
  optimist = require('optimist')
    .alias('h', 'help')
    .describe('destFolder', 'The dest folder.')
    .usage('nspider sample - Save node.js API document to .md files.');

(function (argv) {
  var nspider, spider, dest;

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  /* initialize */
  logger.cli();
  nspider = require('../')({ logger: logger });
  spider = new nspider.Spider();

  dest = argv.destFolder || __dirname;
  logger.info('Saving http://nodejs.org/api to %s', dest);

  /* fetch and save the API content item */
  function fetchAPIContent(item) {
    var mdFile, link;

    mdFile = item.replace('.html', '.md').replace(/\//g, '_');
    mdFile = path.join(dest, mdFile);
    logger.info('Fetching api document: %s => %s', item, mdFile);
    link = util.format('http://nodejs.org/api/%s', item);
    spider.fetch(link, function (err, data) {
      var content;
      if (err) {
        logger.error('Fetch err: %s', err.toString());
        return;
      }
      /* convert the content html to Markdown */
      content = data.dom('div#apicontent');
      fs.writeFile(mdFile, toMarkdown(content.html()), function (err) {
        if (err) {
          logger.error('Save .md to %s, err: %s', mdFile, err.toString());
        }
        else {
          logger.info('Save .md to %s, OK', mdFile);
        }
      });
    });
  }

  /* check the API document items */
  spider.fetch('http://nodejs.org/api', function (err, data) {
    var apiContent;
    if (err) {
      logger.error('Fetch err: %s', err.toString());
      return;
    }
    apiContent = data.dom('div#apicontent li a');
    apiContent.each(function (idx, item) {
      fetchAPIContent(data.dom(item).attr('href'));
    });
  });
})(optimist.argv);

