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