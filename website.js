const CLIENT_SECRET = 'CLIENT_SECRET';
const CLIENT_ID = 'CLIENT_ID';

let models;

function startsWith(str, search, pos) {
    return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

function findOAuthOrCreate(userId) {
    return new Promise((resolve) => {
        models.OAuth.findOne({user_id: userId}).then((oauth) => {
            if (oauth) {
                resolve(oauth);
            } else {
                resolve(new models.OAuth({user_id: userId}));
            }
        }, (err) => {
            console.error('Error finding oauth: ' + err);
            resolve(new models.OAuth({user_id: userId}));
        });
    });
}

function redirectToOauth(request, response, userId) {
    findOAuthOrCreate(userId).then((oauth) => {
        oauth.generateCode().then((code) => {
            console.info('Generated code: ' + code);
            oauth.save().then(() => {
                response.redirect(request.query['redirect_uri'] + '?code=' + oauth.code + '&state=' + request.query['state']);
            }, (err) => {
                console.error('Error saving OAuth: ' + err);
                response.render('error', {error: 'DB Error'});
            });
        }, (err) => {
            console.error('Error generating code: ' + err);
            response.render('error', {error: 'Cannot generate code'});
        });
    });
}

function auth(request, response) {

    if (startsWith(request.query['redirect_uri'], 'https://oauth-redirect.googleusercontent.com/r/')) {
        if (request.session.user_id) {
            redirectToOauth(request, response, request.session.user_id);
        } else {
            const email = request.body['email'];
            if (email) {
                models.User.findOne({email: email.toLowerCase()}, function (err, user) {
                    if (err) {
                        console.error('Error finding user ' + user.email + ' in auth.js|loginUserWithReq: ' + err);
                        response.render('error', {error: 'Server Error, Try Again Later'});
                        return;
                    }
                    if (user && user.authenticate(request.body['password'])) {
                        request.session.user_id = user.id;
                        redirectToOauth(request, response, request.session.user_id);
                    } else {
                        console.error('Error logging in user, no user found');
                        response.render('login', {
                            error: 'Incorrect Email/Password',
                            email: email,
                            redirectUri: request.query['redirect_uri'],
                            state: request.query['state']
                        });
                    }
                });
            } else {
                response.render('./login', {
                    error: '',
                    email: email,
                    redirectUri: request.query['redirect_uri'],
                    state: request.query['state']
                });
            }
        }
    } else {
        console.error('Auth request sending invalid redirect uri: ' + request.query['redirect_uri']);
        response.render('error_404');
    }

}

function token(request, response) {
    if (request.body['client_id'] === CLIENT_ID && request.body['client_secret'] === CLIENT_SECRET) {
        if (request.body['grant_type'] === 'authorization_code') {
            const validateCode = request.body['code'];

            models.OAuth.findOne({code: validateCode}).then((oauth) => {
                const jsonResponse = {
                    token_type: "bearer",
                    access_token: oauth.access_token,
                    refresh_token: oauth.refresh_token,
                    expires_in: oauth.secondsToExpiration()
                };
                response.json(jsonResponse);
            }, (err) => {
                console.error('Error getting oauth: ' + err);
                response.status(500).json({error: 'Unable to find code'});
            });
        } else if (request.body['grant_type'] === 'refresh_token') {
            const refreshToken = request.body['refresh_token'];

            models.OAuth.findOne({refresh_token: refreshToken}).then((oauth) => {
                oauth.generateAccessToken().then(() => {
                    oauth.save(() => {
                        let response = {
                            token_type: "bearer",
                            access_token: oauth.access_token,
                            expires_in: oauth.secondsToExpiration()
                        };
                        response.json(response);
                    })
                });
            }, (err) => {
                console.error('Error getting oauth, refresh token: ' + err);
                response.status(500).json({error: 'refresh_token'});
            });
        }
    } else {
        console.error('Invalid request id, client_id or client_secret wrong: ' + JSON.stringify(request.body));
        response.status(404).json({error: '404'});
    }

}

function score(request, response) {

}

module.exports = (config) => {
    models = require('./mongoose').getModels(config);
    return {
        auth: auth,
        token: token,
        score: score
    };
};