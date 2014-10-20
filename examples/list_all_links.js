'use strict';

var nspider = require('../')();

(function () {
  var spider;

  /* create spider object */
  spider = nspider.Spider();
  spider.on('fetchCompleted', function (data) {
    if (data.contentType.type !== 'text' ||
        data.contentType.subtype !== 'html') {
      /* Not a HTML page */
      return;
    }

    /* Print all <a> href attr */
    data.$('a').each(function (idx,  item) {
      console.log('Link[%d]: %s', idx, data.$(item).attr('href'));
    });
  }).on('fetchError', function (err) {
    /* fetch error */
    console.log('fetchError: %s', err.toString());
  });
  
  /* check the 'http://nodejs.org' */ 
  spider.fetch('http://nodejs.org');
})();

