var Hapi = require('hapi');
var wallet = require('meo-wallet');

var options = {
    views: {
        path: __dirname + '/templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: __dirname + '/partials'
    }
}; 

var server = new Hapi.Server('localhost', 8000, options);

server.route([
    { method: 'GET', path: '/', handler: index },
    { method: 'GET', path: '/go', handler: go },
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel },
    { method: 'GET', path: '/{path*}', handler: {
        directory: { path: './public', listing: true, index: true }
    } }
]);


function confirm(request, reply) {
    reply.view('confirm.html', {});
};

function cancel(request, reply) {
    reply.view('cancel.html', {});
};

function index(request, reply) {
    reply.view('index.html', {});
};

function go(request, reply) {
  wallet.checkout.create({ 
    "amount":0.01,
    "currency": "EUR",
    "items":[{
      "ref":123,
      "name":"Gato",
      "descr":"Um gato",
    "qt":1
    }]
  }, function(error, checkout) {
    if(error) {
      console.log(error);
    }
    console.log(checkout);
    reply().redirect(checkout.url_redirect);
  });
};


server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});




