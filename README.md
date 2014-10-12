# nspider

It's a Node.js Web Spider library. 
nspider = [node.js](http://nodejs.org/) + [cheerio](https://github.com/cheeriojs/cheerio) + [request](https://github.com/mikeal/request) . 

## Usage:
```
  var nspider, spider;

  nspider = require('nspider')();
  spider = new nspider.Spider();
  spider.on('fetchCompleted', function (data) {
    var links;
    links = data.dom('a');
    links.each(function (idx, item) {
      var link = data.dom(item).attr('href');
      logger.info('[%d] - %s', idx, link);
    });
  });

  spider.fetch('http://nodejs.org');
```

## Samples 
* Build Samples:
  Run `npm run build` in the `sample` folder.

### List all links ( sample/list_all_links.js) 
This sample fetch the HTML from the srouce URL and parse all the links from the HTML source.
* Usage:      
```
nspider sample - List all links

Options:
  --srcUrl  the source URL  [required]
```

* Example:
  `node ./list_all_links.js --srcUrl http://nodejs.org/`

### Save the Node.js API Docs to .md files ( sample/save_node_apidoc.js )
This sample fetch the Node.js API Docs from http://nodejs.org/api . and save the API Docs to Markdown files.
* Usage:    
```
nspider sample - Save node.js API document to .md files.

Options:
  --destFolder  The dest folder.
```

* Example:
  `node ./save_node_apidoc.js --destFolder ./dest`

