'use strict'

var express = require('express');
var receiptController = require('../controllers/receipt.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.get('/:idU/getReceipts', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], receiptController.getReceipts);
api.get('/:idU/getReceiptsU', mdAuth.ensureAuth, receiptController.getReceiptsU);
api.get('/:idU/:idR/ReceiptDetails', mdAuth.ensureAuth, receiptController.getReceiptsDetails);

module.exports = api;