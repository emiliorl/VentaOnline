'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    purchases: {type: Number, 
            default: 0},
    department: {type: Schema.ObjectId, 
            ref: 'product'},
})

module.exports = mongoose.model('product', productSchema);