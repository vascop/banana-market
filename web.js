var Hapi = require('hapi');
var Joi = require('joi');
var wallet = require('meo-wallet');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Twit = require('twit')

var T = new Twit({
    consumer_key:         '44JHVRQkteAob0WD8uUmdYO8c',
    consumer_secret:      'osPNWcddMatXMPhkkTSqiIDah567HYz5C6Vy3M6ybFwwKhvelN',
    access_token:         '...',
    access_token_secret:  '...'
})

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  if(!err) {
    console.log("mongo up!");
  }

  product_table = db.collection('products');
});

var options = {
    views: {
        path: __dirname + '/templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: __dirname + '/partials'
    }
};

var new_product_submit_config = {
    handler: new_product_submit,
    validate: {
        payload: {
            title: Joi.string().required(),
            description: Joi.string().required(),
            after_description: Joi.string().required(),
            photo_url: Joi.string().required(),
            price: Joi.number().required().min(1).max(999),
            email: Joi.string().email().required(),
            twitter: Joi.string().required()
    } }
};

function new_product_submit(request, reply) {
    var new_product = {
        'title': request.payload.title,
        'description': request.payload.description,
        'after_description': request.payload.after_description,
        'photo_url': request.payload.photo_url,
        'price': request.payload.price,
        'email': request.payload.email,
        'twitter': request.payload.twitter,
    };

    product_table.insert(new_product, function (err, item) {
        var id = item[0]._id;

        reply({
            id: id,
            title: request.payload.title,
            description: request.payload.description,
            after_description: request.payload.after_description,
            photo_url: request.payload.photo_url,
            price: request.payload.price,
            email: request.payload.email,
            twitter: request.payload.twitter
        });
    });
};

function product_list(request, reply) {
    product_table.find({}, function(err, items) {
        items.toArray(function(err, array) {
            reply.view('list_products.html', {
                products: array
            });
        });
    });
};

function new_product(request, reply) {
    reply.view('new_product.html', {});
};

function confirm(request, reply) {
    wallet.checkout.get(request.query.checkoutid, function(error, checkout) {
      if(error) {
        console.log(error);
      }
      product_table.findOne({_id:ObjectId(checkout.payment.items[0].ref)}, function(err, item) {
        reply.view('confirm.html', {
            id: item._id,
            title: item.title,
            description: item.description,
            after_description: item.after_description,
            price: item.price,
        });
      });
    });
};

function cancel(request, reply) {
    reply.view('cancel.html', {});
};

function wallet_callback(request, reply) {
  console.log("\n\nCALLBACK \n\n", request);

  reply();
};

function index(request, reply) {
    product_table.find({}, function(err, items) {
        items.toArray(function(err, array) {
            reply.view('index.html', {
                products: array
            });
        });
    });
};

function product_detail(request, reply) {
    product_table.findOne({_id:ObjectId(request.params.id)}, function(err, item) {
        reply.view('product_detail.html', {
            id: item._id,
            title: item.title,
            description: item.description,
            price: item.price,
            price_coded: item.price*100,
            photo_url: item.photo_url,
            twitter: item.twitter
        });
    });
};

function delete_product(request, reply) {
    var id = ObjectId(request.params.id);
    product_table.findOne({_id:id}, function(err, item) {
        product_table.remove({_id:id}, function(err, item) {
            reply().redirect('/superpainelsecreto');
        });
    });
};

function painel_secreto(request, reply) {
    product_table.find({}, function(err, items) {
        items.toArray(function(err, array) {
            reply.view('admin_products.html', {
                products: array
            });
        });
    });
};


function go(request, reply) {
    console.log("ID: " + request.params.id);
    product_table.findOne({_id:ObjectId(request.params.id)}, function(err, item) {
        if (err) {
            console.log("ERR: " + err);
        }
        wallet.checkout.create({
          "amount":item.price,
          "currency": "EUR",
          "items":[{
            "ref":request.params.id,
            "name":item.title,
            "descr":item.title + " - " + item.description,
          "qt":1
          }]
        }, function(error, checkout) {
          if(error) {
            console.log(error);
          }
          console.log(checkout);
          reply().redirect(checkout.url_redirect);
        });
    });
};


var server = new Hapi.Server('0.0.0.0', 80, options);

server.route([
    { method: 'GET', path: '/', handler: index },
    { method: 'GET', path: '/go/{id}', handler: go },
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel },
    { method: 'GET', path: '/wallet_callback', handler: wallet_callback },
    { method: 'GET', path: '/new', handler: new_product },
    { method: 'POST', path: '/new', config: new_product_submit_config },
    { method: 'GET', path: '/products/{id}', handler: product_detail },
    { method: 'GET', path: '/products', handler: product_list },
    { method: 'GET', path: '/superpainelsecreto', handler: painel_secreto },
    { method: 'POST', path: '/delete_product/{id}', handler: delete_product },
    { method: 'GET', path: '/{path*}', handler: {
        directory: { path: './public', listing: true, index: true }
    } }
]);

server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});
