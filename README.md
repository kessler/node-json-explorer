# json explorer

SUPER ALPHA!

an initial attempt at building a "streaming" json object explorer

### try it out
```
	// tree layout is default
	cat my.json | node index 
```
or 
```
	cat my.json | node index --layout force
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
* make force layout collapsible 
* refresh isn't working properly
* shutdown button in browser will shut down the server
* better hover box
* labels should move according to circle size
* maybe replaces circles with something more meaningful 

![force](https://raw.github.com/kessler/static/master/node-json-explorer.png)
![tree](https://raw.github.com/kessler/static/master/node-json-explorer-tree.png)
