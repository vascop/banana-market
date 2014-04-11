var Hapi = require('hapi');
var Joi = require('joi');
var wallet = require('meo-wallet');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

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
            after_description: Joi.string().optional(),
            price: Joi.number().required().min(1).max(999),
            email: Joi.string().email().required(),
            photo_url: Joi.string().optional()
    } }
};

function new_product_submit(request, reply) {
    console.log(request.payload);

    var new_product = {
        'title': request.payload.title,
        'description': request.payload.description,
        'photo_url': request.payload.photo_url,
        'price': request.payload.price,
        'email': request.payload.email,
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
            email: request.payload.email
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
    reply.view('confirm.html', {});
};

function cancel(request, reply) {
    reply.view('cancel.html', {});
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
            after_description: request.payload.after_description,
            price: item.price,
            photo_url: item.photo_url
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
            "descr":item.description,
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


var server = new Hapi.Server('localhost', 8000, options);

server.route([
    { method: 'GET', path: '/', handler: index },
    { method: 'GET', path: '/go/{id}', handler: go },
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel },
    { method: 'GET', path: '/new', handler: new_product },
    { method: 'POST', path: '/new', config: new_product_submit_config },
    { method: 'GET', path: '/products/{id}', handler: product_detail },
    { method: 'GET', path: '/products', handler: product_list },
    { method: 'GET', path: '/{path*}', handler: {
        directory: { path: './public', listing: true, index: true }
    } }
]);

server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});
