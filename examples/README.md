# nspider samples
* Build Samples:
  Run `npm run build` in the `sample` folder.

## List all links ( list_all_links.js) 
This sample fetch the HTML from the srouce URL and parse all the links from the HTML source.
* Usage:      
```
nspider sample - List all links

Options:
  --srcUrl  the source URL  [required]
```

* Example:
  `node ./list_all_links.js --srcUrl http://nodejs.org/`

## Save the Node.js API Docs to .md files ( save_node_apidoc.js )
This sample fetch the Node.js API Docs from http://nodejs.org/api . and save the API Docs to Markdown files.
* Usage:    
```
nspider sample - Save node.js API document to .md files.

Options:
  --destFolder  The dest folder.
```

* Example:
  `node ./save_node_apidoc.js --destFolder ./dest`

