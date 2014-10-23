'use strict';

var nspider = require('../')();

(function () {
  var spider;

  /* create spider object */
  spider = new nspider.Spider();

  /* fetch the content of 'http://nodejs.org' */
  spider.fetch('http://nodejs.org', function (err, data) {
    if (err) {
      /* fetch error */
      console.log('fetchError: %s', err.toString());
      return;
    }

    if (data.contentType.type !== 'text' ||
        data.contentType.subtype !== 'html') {
      /* Not a HTML page */
      console.log('Invalid contentType: %j', data.contentType);
      return;
    }

    /* Print all <a> href attr */
    data.$('a').each(function (idx,  item) {
      console.log('Link[%d]: %s', idx, data.$(item).attr('href'));
    });
  });
})();

