'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receiptSchema = Schema({
    date: Date,
    products: [{
        _id:{type: Schema.ObjectId, 
            ref: 'product'}, 
        quantity: Number,
        pricePP: Number}],
    tax: mongoose.Types.Decimal128,
    total: Number
})

module.exports = mongoose.model('receipt', receiptSchema);