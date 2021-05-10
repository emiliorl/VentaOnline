'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var cartController = require('../controllers/cart.controller');
var receiptController = require('../controllers/receipt.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', userController.login);
api.post('/saveUser', userController.saveUser);
api.put('/updateUser/:id', mdAuth.ensureAuth,  userController.updateUser);
api.delete('/removeUser/:id', mdAuth.ensureAuth, userController.removeUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);
api.post('/search', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.search);

api.get('/:idU/checkOut', mdAuth.ensureAuth, receiptController.checkOut);

api.put('/:idU/setItemCart/:idP', mdAuth.ensureAuth, cartController.setCartItem);
api.put('/:idU/updateItemCart/:idP', mdAuth.ensureAuth, cartController.updateCartItem);
api.put('/:idU/removeItemCart/:idP', mdAuth.ensureAuth, cartController.removeCartProduct);
api.get('/:idU/getCart', mdAuth.ensureAuth, cartController.getCart);

module.exports = api;