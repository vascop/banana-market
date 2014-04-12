var Twit = require('twit');

var T = new Twit({
    consumer_key:         '44JHVRQkteAob0WD8uUmdYO8c',
    consumer_secret:      'osPNWcddMatXMPhkkTSqiIDah567HYz5C6Vy3M6ybFwwKhvelN',
    access_token:         '2437968967-O4Ag3n9mBrV22EWHLzHo0SxNssgQ8B4F6E6WlMf',
    access_token_secret:  '0ZZFc443YfXEuanaRmQBJ9zSlgbglrImbfCQPpXdAPU1c'
});

T.post('statuses/update', { status: 'ou just sold in bananamarket.eu from @ at #codebits!' }, function(err, reply) {
    if (err) console.log(err);
});