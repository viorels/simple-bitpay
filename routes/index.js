var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Simple Pickup' });
});

var products = {
  "go": {
    "name": "Project GO",
    "price": 40, // per month
  },
  "30": {
    "name": "Simple 30",
    "price": 399,
  },
}

router.get('/product/:name', function(req, res) {
  productName = products[req.params.name]["name"];
  res.render('product', { title: productName});
});

module.exports = router;
