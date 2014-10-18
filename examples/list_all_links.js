'use strict';

var nspider = require('../')();

(function (argv) {
  var spider;

  /* create spider object */
  spider = nspider.Spider();
  spider.on('fetchCompleted', function (data) {
    data.dom('a').each(function (idx,  item) {
      /* Print the <a> href attr */
      console.log('Link[%d]: %s', idx, data.dom(item).attr('href'));
    });
  }).on('fetchError', function (err) {
    /* fetch error */
    console.log('fetchError: %s', err.toString());
  });
  
  /* check the 'http://nodejs.org' */ 
  spider.fetch('http://nodejs.org');
})();

