var express = require('express');
var router = express.Router();

var bitpay = require('bitpay');
var bitauth = require('bitauth');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Simple Pickup' });
});

router.get('/product', function(req, res) {
  var productName = req.query.name;
  var productPrice = req.query.price;
  if (!req.session.invoice) {
    res.render('product', {
      title: productName,
      name: productName,
      price: productPrice,
    });
  } else {
    var encPrivKey = process.env.BITPAY_PRIVATE_KEY;
    var privkey = bitauth.decrypt('', encPrivKey);
    var client = bitpay.createClient(privkey);

    client.on('ready', function() {
      console.log("INVOICE", req.session.invoice);
      client.get('invoices/' + req.session.invoice, function(err, invoice) {
        console.log(err || invoice);
        var paid = !err && (invoice.status == 'paid' || invoice.status == 'confirmed');
        res.render('product', {
          title: productName,
          name: productName,
          price: productPrice,
          paid: paid,
        });
      });
    });
  }
});

router.post('/product', function(req, res) {
  var productName = req.body.name;
  var productPrice = req.body.price;

  var port = req.app.settings.port;
  var redirectURL = 'http://' + req.hostname  + (port == 80 || port == 443 ? '' : ':' + port) + '/product';
  console.log('redirectURL', redirectURL);

  var encPrivKey = process.env.BITPAY_PRIVATE_KEY;
  var privkey = bitauth.decrypt('', encPrivKey);
  var client = bitpay.createClient(privkey);

  client.on('ready', function() {
    client.post('invoices', {
      itemDesc: productName,
      price: productPrice,
      // currency: 'USD',
      currency: 'BTC',
      redirectURL: redirectURL,
    }, function(err, invoice) {
      req.session.invoice = invoice.id
      console.log(err || invoice);
      res.redirect(303, invoice.url);
    });
  });
});

module.exports = router;
