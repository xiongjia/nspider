# nspider

A simple Web Spider/Crawler Node.js package.
```javascript
var nspider = require('nspider')();

/* create spider object */
var spider = new nspider.Spider();

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
```

## Installation
```
npm install nspider
```

## Examples
* `examples/list_all_links.js` - List all links.
* `examples/save_all_img.js` - Save all images.

## Build
```
git clone https://github.com/xiongjia/nspider.git
npm run build
```

