'use strict';

var nspider = require('../')(),
  path = require('path'),
  fs = require('fs'),
  url = require('url');

(function () {
  var spider;

  /* create spider object */
  spider = new nspider.Spider();

  /* fetch & save the images in 'http://nodejs.org' */
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

    /* scan all img DOM node */
    data.$('img').each(function (idx, item) {
      var imgSrc, filename, output, task;

      imgSrc = data.$(item).attr('src');
      if (!imgSrc.match(/^http(s){0,1}:\/\//)) {
        imgSrc = url.resolve('http://nodejs.org', imgSrc);
      }

      /* remove 'http(s)://' */
      filename = imgSrc.replace(/^http(s){0,1}:\/\//g, '');
      /* replace '/', '\', ':' to '-' */
      filename = filename.replace(/[\/\\:]/g, '-');
      /* add the cwd() prefix */
      filename = path.join(process.cwd(), filename);

      /* save imgSrc to filename */
      console.log('Saving [%s] to [%s] ...', imgSrc, filename);
      output = fs.createWriteStream(filename, { flags: 'w' });
      output.on('error', function (err) {
        /* error on fs write */
        console.log('Writing [%s] error: %s', filename, err.toString());
      }).on('end', function () {
        /* The image has been saved */
        console.log('Image [%s] has been saved to [%s]', imgSrc, filename);
      });

      /* image fetch task */
      task = {
        url: imgSrc,
        output: output,
        /* only save it to output stream. Don't need the content buffer */
        skipContentBuff: true
      };
      spider.fetch(task, function (err) {
        if (err) {
          console.log('Saveing [%s] error: %s', imgSrc, err.toString());
          return;
        }
      });
    });
  });
})();

