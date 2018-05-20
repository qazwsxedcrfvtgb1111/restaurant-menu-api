const express = require('express');
const promisify = require('util').promisify;
const router = express.Router();
const User = require('../models').User;
const bcrypt = require('bcrypt');
const jwtSign = promisify(require('jsonwebtoken').sign);
const config = require('../config');

router.post('/', (req, res) => {
    User.findOne({
        where: {
            name: req.body.username
        }
    }).then(user => {
        if (user) {
            bcrypt.compare(req.body.password, user.password,).then(correct => {
                if (correct) {
                    jwtSign({id: user.id}, config.jwtSecret).then(token => {
                        res.send({token})
                    })
                        .catch(err => console.log(err));
                } else {
                    notAuthorized(res);
                }
            }).catch(err => console.log(err));
        } else {
            notAuthorized(res);
        }
    })
});

router.post('/create', (req, res) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        User.create({name: req.body.username, password: hash, email: 'test@test'}).then(user => res.send(user));
    }).catch(err => console.log(err));
});

function notAuthorized(res) {
    res.send('Not authorized.', 403);
}

module.exports = router;