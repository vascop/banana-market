var Hapi = require('hapi');

var options = {
    views: {
        path: __dirname + 'templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: __dirname + 'partials'
    }
}; 

var server = new Hapi.Server('localhost', 8000, { cors: true });

server.route([
    { method: 'GET', path: '/', handler: index },
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel }
]);


function confirm(request, reply) {
    console.log(request);
};

function cancel(request, reply) {
    console.log(request);
};

function index(request, reply) {
    reply.view('index.html', {
        
    });
}


server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});




