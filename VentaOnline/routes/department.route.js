'use strict'

var express = require('express');
var departmentController = require('../controllers/department.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/:idU/setDepartment/', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], departmentController.setDepartment);
api.put('/:idU/updateDepartment/:idD', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], departmentController.updateDepartment);
api.put('/:idU/removeDepartment/:idD', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], departmentController.removeDepartment);
api.get('/:idU/getDepartments', mdAuth.ensureAuth, departmentController.getDepartments);
api.post('/searchDepartment', mdAuth.ensureAuth, departmentController.searchDepartment);

module.exports = api;