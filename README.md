# json explorer

SUPER ALPHA!

an initial attempt at building a "streaming" json object explorer

### try it out
```
	cat my.json | node index
```

### develop

#### server

just hack at index.js and JsonObjectStream mostly

#### client

```
	browserify clientIndex.js -o clientIndex.min.js
```

client code sits in lib/client

### TODO:
* make collapsible
* replace force layout to something else?
* better hover box

![screenshot](https://raw.github.com/kessler/static/master/node-json-explorer.png)
