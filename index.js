const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoStore = require('connect-mongo')({session: session});

const rpsls = require('./rpsls');

const config = {
    cookieSecret: 'thisismycookiesecret-changeme',
    serverPort: 5050,
    mongoConfig : {
        hostname: 'localhost',
        port: 27017,
        username: '',
        password: '',
        name: '',
        db: 'rpsls'
    }
};

const website = require('./website')(config);

config.mongoConnectConfig = {
    adapter: 'connect-mongo',
    url: 'mongodb://' + (config.mongoConfig.host || config.mongoConfig.hostname) + ':' + config.mongoConfig.port + '/' + config.mongoConfig.db,
    collection: 'sessions'
};

const expressApp = express();

expressApp.set('view engine', 'ejs');
expressApp.use(compression());
expressApp.use('/public', express.static('public'));
expressApp.use(session({maxAge:120000, store: new mongoStore(config.mongoConnectConfig), secret:config.cookieSecret, resave: true, saveUninitialized: true}));
expressApp.use(bodyParser.urlencoded({extended: false}));
expressApp.use(bodyParser.json({extended: false}));
expressApp.use(favicon(__dirname + '/public/img/favicon.ico'));

expressApp.get('/robots.txt', (request, response) => {
    response.send('User-agent: *\nDisallow: /');
});

expressApp.get('/auth', website.auth);
expressApp.post('/auth', website.auth);
expressApp.post('/token', website.token);
expressApp.get('/', website.score);

expressApp.post('/', (request, response) => {
    console.log('Request body: ' + JSON.stringify(request.body));

    const actionApp = new ActionsSdkApp({
        request,
        response
    });

    // Map that contains the intents and respective handlers to be used by the
    // actions client library
    const actionMap = new Map();

    actionMap.set(actionApp.StandardIntents.MAIN,  rpsls.mainIntentHandler);
    actionMap.set(actionApp.StandardIntents.OPTION, rpsls.optionIntentHandler);
    actionMap.set(actionApp.StandardIntents.TEXT,  rpsls.textIntentHandler);

    actionApp.handleRequestAsync(actionMap).then(() => {
        console.log('Success handling GoogleAction request');
    }, (reason) => {
        console.error('Error: ' + JSON.stringify(reason));
    });
});

expressApp.use(function(req, res){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error_404');
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});


expressApp.listen(config.serverPort, () => console.log('Rpsls App listening on port ' + config.serverPort));

