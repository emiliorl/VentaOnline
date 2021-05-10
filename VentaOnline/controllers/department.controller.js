'use strict'

var User = require('../models/user.model');
var Department = require('../models/department.model');
var Product = require('../models/product.model');

function setDepartment(req, res){
    var userId = req.params.idU;
    var params = req.body;
    var department = new Department();

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.name && params.description){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(userFind){
                    Department.findOne({name: params.name.toLowerCase()}, (err, departmentFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en el servidor'});
                        }else if(departmentFind){
                            return res.send({message: 'Nombre de categoria ya existe'});
                        }else{                            
                            department.name = params.name.toLowerCase();
                            department.description = params.description;
    
                            department.save((err, departmentSave)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar'})
                                }else if(departmentSave){
                                    User.findByIdAndUpdate(userId, {$push:{departments: departmentSave._id}}, {new: true}, (err, departmentPush)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al agergar categoria'})
                                        }else if(departmentPush){
                                            return res.send({message: 'Categoria agregada', departmentPush});
                                        }else{
                                            return res.status(500).send({message: 'Error al agregar categoria'})
                                        }
                                    })
                                }else{
                                    return res.status(404).send({message: 'No se guardó la categoria'})
                                }
                            })
                        }
                    })
                }else{
                    return res.status(404).send({message: 'El usuario al que deseas agregar la categoria no existe.'})
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function updateDepartment(req, res){
    let userId = req.params.idU;
    let departmentId = req.params.idD;
    let update = req.body;

    if((userId == req.user.sub || req.user.role == 'admin') && !update.products){
        if(update.name || update.description){
            Department.findByIdAndUpdate(departmentId, update, {new: true}, (err, departmentUpdated)=>{
                if(err){
                    return res.status(500).send({message: 'Error general en la actualización'});
                }else if(departmentUpdated){
                    return res.send({message: 'Categoria actualizada', departmentUpdated});
                }else{
                    return res.status(404).send({message: 'Categoria no actualizada'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }else{
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }
}

function removeDepartment(req,res){
    let userId = req.params.idU;
    let departmentId = req.params.idD;

    if(userId == req.user.sub || req.user.role == 'admin'){
        User.findById(userId, (err, userFind) => {
            if(err){
                return res.status(500).send({message: 'Error general al buscar usuario'});
            }else if(userFind){
                Department.findById(departmentId, (err, departmentFind) => {
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar categoria'});
                    }else if(departmentFind && departmentFind.products.length === 0){
                        User.findByIdAndUpdate(userFind._id, {$pull:{departments: departmentId}}, {new: true},(err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al elimanar categoria del usuario'});
                            }else if(userUpdated){
                                Department.findByIdAndRemove(departmentId, (err, departmentRemoved) =>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al elimanar categoria'});
                                    }else if(departmentRemoved){
                                        return res.status(200).send({message: 'Categoria eliminada', departmentRemoved});
                                    }else{
                                        return res.status(404).send({message: 'Categoria no eliminada'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'Categoria no eliminada del usuario'});
                            }
                        })
                    }else if(departmentFind){
                        Department.findOne({name: 'default'}, (err,departmentFindD)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al buscar categoria default'});
                            }else if(departmentFindD){
                                departmentFind.products.map(product => {
                                    Product.findByIdAndUpdate(product._id, {department: departmentFindD._id} ,(err, productFind)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al alctualizar producto'});
                                        }/* else if(productFind){
                                            res.status(200).send({message: 'Prodcuto actualizado'});
                                        } */else if(!productFind){
                                            return res.status(404).send({message: 'No se actulizo el producto'});
                                        }
                                    })

                                    Department.findByIdAndUpdate(departmentFindD, {products: product._id} ,(err, departmentUpdated)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al alctualizar categoria predeterminada'});
                                        }/* else if(departmentUpdated){
                                            res.status(200).send({message: 'Prodcuto actualizado'});
                                        } */else if(!departmentUpdated){
                                            return res.status(404).send({message: 'No se actulizo la categoria predeterminada'});
                                        }
                                    })

                                })

                                User.findByIdAndUpdate(userFind._id, {$pull:{departments: departmentId}}, {new: true} ,(err, userUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al alctualizar usuario'});
                                    }else if(userUpdated){
                                        Department.findByIdAndRemove(departmentId, (err, departmentRemoved) =>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general al elimanar categoria'});
                                            }else if(departmentRemoved){
                                                return res.status(200).send({message: 'Categoria eliminada', departmentRemoved});
                                            }else{
                                                return res.status(404).send({message: 'Categoria no eliminada'});
                                            }
                                        })
                                    }else{
                                        return res.status(404).send({message: 'No se actulizo el usuario'});
                                    }
                                })
                            }else{
                                var newDepartment = new Department();
                                newDepartment.name = 'default'
                                newDepartment.description = 'Productos generales'
                                newDepartment.save((err, departmentSaved) => {
                                    if(err){
                                        return res.status(500).send({message: 'Error general al crear categoria predeterminada'});
                                    }else if(departmentSaved){
                                        departmentFind.products.map(product => {
                                            Product.findByIdAndUpdate(product._id, {department: departmentSaved._id} ,(err, productFind)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al alctualizar prodcuto'});
                                                }/* else if(productFind){
                                                    res.status(200).send({message: 'Prodcuto actualizado'});
                                                } */else if(!productFind){
                                                    return res.status(404).send({message: 'No se actulizo el producto'});
                                                }
                                            })

                                            Department.findByIdAndUpdate(departmentFindD, {products: product._id} ,(err, departmentUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al alctualizar categoria predeterminada'});
                                                }/* else if(productFind){
                                                    res.status(200).send({message: 'Prodcuto actualizado'});
                                                } */else if(!departmentUpdated){
                                                    return res.status(404).send({message: 'No se actulizo la categoria predeterminada'});
                                                }
                                            })
                                        })
                                        User.findByIdAndUpdate(userFind._id, {$pull:{departments: departmentId}}, {new: true} ,(err, userUpdated)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general al alctualizar usuario'});
                                            }else if(userUpdated){
                                                Department.findByIdAndRemove(departmentId, (err, departmentRemoved) =>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al elimanar categoria'});
                                                    }else if(departmentRemoved){
                                                        return res.status(200).send({message: 'Categoria eliminada', departmentRemoved});
                                                    }else{
                                                        return res.status(404).send({message: 'Categoria no eliminada'});
                                                    }
                                                })
                                            }else{
                                                return res.status(404).send({message: 'No se actulizo el usuario'});
                                            }
                                        })
                                    }else{
                                        return res.status(500).send({message: 'No se guardó la categoria predeterminada'});
                                    }
                                })
                            }
                        })
                        
                    }else{
                        return res.status(404).send({message: 'Categoria no encontrada'});
                    }
                })
            }else{
                return res.status(404).send({message: 'Usuario no encontrado'});
            }
        })
    }else{
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }
}

function getDepartments(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Department.find({}).populate('products').exec((err, departments)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(departments){
                return res.send({message: 'Categorias: ', departments})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function searchDepartment(req, res){
    var params = req.body;

    if(params.search){
        Department.find({$or:[{name: { "$regex": params.search}}]}).populate('products').exec((err, resultSearch)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(resultSearch){
                                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                            }else{
                                return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                            }
                        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}

module.exports = {
    setDepartment,
    updateDepartment,
    getDepartments,
    searchDepartment,
    removeDepartment
}