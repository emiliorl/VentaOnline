'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/:idU/setProduct/', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productController.setProductNoId);
api.put('/:idU/:idD/setProduct/', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productController.setProduct);
api.put('/:idU/updateProduct/:idP', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productController.updateProduct);
api.put('/:idU/:idD/removeProduct/:idP', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productController.removeProduct);
api.get('/:idU/getProducts', mdAuth.ensureAuth, productController.getProducts);
api.get('/:idU/mostSold', mdAuth.ensureAuth, productController.mostSold);
api.get('/:idU/soldOut', mdAuth.ensureAuth, productController.soldOut);
api.post('/searchProduct', mdAuth.ensureAuth, productController.searchProduct);

module.exports = api;