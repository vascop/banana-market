var Hapi = require('hapi');

var confirm = function (request, reply) {
    console.log(request);
};

var cancel = function (request, reply) {
    console.log(request);
};

var index = function (request, reply) {
    reply.view('index.html', {
        
    });
}

var options = {
    views: {
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: 'partials'
    }
}; 

var server = new Hapi.Server('localhost', 8000, { cors: true });

server.route([
    { method: 'GET', path: '/', handler: index },
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel }
]);

server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});




