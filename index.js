const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const express = require('express');
const bodyParser = require('body-parser');

const rpsls = require('./rpsls');

const expressApp = express();

expressApp.use(bodyParser.urlencoded({extended: false}));
expressApp.use(bodyParser.json({extended: false}));

expressApp.use((request, response) => {
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


expressApp.listen(5050, () => console.log('Example app listening on port ' + 5050));

