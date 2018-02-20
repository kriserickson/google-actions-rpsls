const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.Promise = global.Promise;

function generateMongoUrl(envVar) {
    mongoConfig = envVar.length > 0 ? JSON.parse(envVar) : {};

    mongoConfig.hostname = (mongoConfig.hostname || 'localhost');
    mongoConfig.port = (mongoConfig.port || 27017);
    mongoConfig.db = (mongoConfig.db || 'test');
    let res = "mongodb://";
    if (mongoConfig.username && mongoConfig.password) {
        res += mongoConfig.username + ":" + mongoConfig.password + "@" + mongoConfig.hostname + ":" + mongoConfig.port + "/" + mongoConfig.db;
    } else {
        res += mongoConfig.hostname + ":" + mongoConfig.port + "/" + mongoConfig.db;
    }
    return res;
}

function defineModels(mongoose) {

    return new Promise((resolve) => {

        const Schema = mongoose.Schema;
        const ObjectId = Schema.ObjectId;


        const OAuth = new Schema({
            'user_id': {
                type: String,
                index: {unique: true}
            },
            'code': {
                type: String,
                index: {unique: true}
            },
            'access_token': {
                type: String,
                index: {unique: true}
            },
            'refresh_token': {
                type: String,
                index: {unique: true}
            },
            'expires': Date
        });

        OAuth.method('generateCode', function () {
            return new Promise((resolve, reject) => {
                generateToken().then((token) => {
                    this.code = token;
                    this.generateAccessToken().then(() => {
                        generateToken().then((token) => {
                            this.refresh_token = token;
                            resolve(this.code);
                        }, (error) => {
                            reject(error);
                        })
                    });
                });
            });
        });

        OAuth.method('generateAccessToken', function () {
            return new Promise((resolve, reject) => {
                return generateToken().then((token) => {
                    this.access_token = token;
                    const expires = new Date();
                    expires.setDate(expires.getDate() + 30);
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.expires = expires;
                    resolve();
                }, (error) => {
                    reject(error);
                });
            })
        });

        OAuth.method('secondsToExpiration', function () {
            const currentDate = new Date();
            return Math.max(this.expires.getTime() - currentDate.getTime(), 0);
        });

        function generateToken() {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(24, function (err, buf) {
                    if (err) {
                        reject(err);
                    } else {
                        const token = buf.toString('hex');
                        resolve(token);
                    }
                });
            })
        }

        const User = new Schema({
            'email': {
                type: String,
                index: {unique: true}
            },
            'hashed_password': String,
            'salt': String,
            'wins': Number,
            'losses': Number
        });

        User.virtual('id')
                .get(function () {
                    return this._id.toHexString();
                });

        User.virtual('gamesPlay')
                .get(function () {
                    return this.wins + this.losses;
                });

        User.method('authenticate', function (plainText) {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return this.encryptPassword(plainText) === this.hashed_password;
        });

        User.method('encryptPassword', function (password) {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        });

        mongoose.model('User', User);
        mongoose.model('OAuth', OAuth);

        resolve();

    });

}

const models = {};
let db;

defineModels(mongoose).then(() => {
    models.User = mongoose.model('User');
    models.OAuth = mongoose.model('OAuth');
    db = mongoose.connect(generateMongoUrl(process.env.MONGO || ''), {useMongoClient: true});
});


module.exports = models;

