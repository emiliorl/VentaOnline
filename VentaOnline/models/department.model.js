'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var departmentSchema = Schema({
    name: String,
    description: String,
    products: [{
        type: Schema.ObjectId, 
        ref: 'product'
    }]
})

module.exports = mongoose.model('department', departmentSchema);