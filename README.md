express-path-route
===================

**Notice:**

This project is taken over from Gabriel Vaquer 's NPM package [express-load-routes](https://www.npmjs.com/package/express-load-routes).

Just modified some code to conform with my usage.

Which is:

```
myapp
  |-> bin
  |-> public
  |-> routes
    |-> index.js
    |-> admin.js
    |-> admin
      |-> index.js
      |-> dashboard.js
```

I will load the routers in this order:

```
index.js -> admin.js -> admin/index.js -> admin/dashboard.js
```

In this way, I can put some path base middlewares to a assign path, such as in admin.js :

```

var auth = require('middlewares/auth');

router.use(auth);
``` 

------

When you use the express-generator package to create a new express.js application, you get a routes folder for free and some boilerplate code. Usually, you have to require all your routes and mount them. That's fine for small apps that only use a few routes, but for large applications this can be hell.

This module is supposed to make this task a little bit easyer by loading all files within a given folder (defaults to ./routes) and mounting them as routes -> router relatively to the ./routes folder.

For example:
```
myapp
  |-> bin
  |-> public
  |-> routes
    |-> index.js
    |-> users.js
    |-> admin
      |-> index.js
      |-> dashboard.js
      |-> customers.js
```
This folder structure would generate the following routes:

```
/
/users
/admin
/admin/dashboard
/admin/customers
```
_Notice that index.js files are translated to root slashes /._

So, the only thing that this module is expecting is a Router (express.Router()) instance to work.

```javascript
// routes/users.js
var express = require('express')
var router = express.Router();

// your routes goes here

module.exports = router;
```

This piece of code wraps the whole thing toggether.
The following example is a common "resourcefull" route declaration.
```javascript
// routes/users.js
var express = require('express')
var router = express.Router();

router
  
  .get('/', function(req, res) {
    User.find({}, function(err, users) {
      res.status(200).json(users);
    });
  })
  
  .get('/:id', function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, user) {
      if (err) throw err;
      if (!user) res.sendStatus(404);
      res.status(200).json(user);
    });
  })
  
  .post('/', function(req, res) {
    var body = req.body;
    var user = new User(body);
    user.save(function(err) {
      if (err) throw err;
      res.status(201).json(user);
    });
  })
  
  .patch('/:id', function(req, res) {
    var id = req.params.id;
    var body = req.body;
    User.findByIdAndUpdate(id, body, function(err, user) {
      if (err) throw err;
      res.sendStatus(200);
    });
  })
  
  .delete('/:id', function(req, res) {
    var id = req.params.id;
    User.findOneAndRemove(id, function(err) {
      if (err) throw err;
      res.sendStatus(200);
    });
  });

module.exports = router;
```
The above example would generate something like this:
```
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

## Installation & Usage
```
npm install express-path-route --save
```

```javascript
// app.js
var express = require('express');
var app = express();

// middlewares goes here
app.use(express.static(__dirname, '/public'));
// ...

// require the module and pass the 
// express instance
require('express-path-route')(app);

// if you don't use the default routes folder
// you can specify the path to your own
// as the second argument
require('express-path-route')(app, './path/to/routes');

module.exports = app;
```

Hope you like it. Cheers.
