var request = require('request');
var Hapi = require('hapi');

var confirm = function (request, reply) {
    console.log(reply);
};

var cancel = function (request, reply) {
    console.log(reply);
};


var server = new Hapi.Server('localhost', 8000, { cors: true });

server.route([
    { method: 'GET', path: '/confirm', handler: confirm },
    { method: 'GET', path: '/cancel', handler: cancel }
]);

server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});




