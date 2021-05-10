'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    role: { type: String, 
            default: 'client',
            enum: ["client", "admin"]},
    username: String,
    name: String,
    lastname: String,
    password: String,
    email: String,
    phone: Number,
    departments: [{
        type: Schema.ObjectId, 
        ref: 'department'
    }],
    products: [{
        type: Schema.ObjectId, 
        ref: 'product'
    }],
    cart: [{
        _id:{type: Schema.ObjectId, 
            ref: 'product'}, 
        quantity: Number,
        pricePP: Number}],
    receipts: [{
        type: Schema.ObjectId, 
        ref: 'receipt'
    }]
})

module.exports = mongoose.model('user', userSchema);