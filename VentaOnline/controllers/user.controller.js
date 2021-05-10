'use strict'

var User = require('../models/user.model');
var Department = require('../models/department.model');
var Product = require('../models/product.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind)});
                        }else{
                            return res.send({ message: 'Usuario logeado', Facturas: userFind.receipts});
                        }
                    }else{
                        return res.status(404).send({message: 'Contrasena incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Ususario no encontrado'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;
    
    if(params.name && params.username && params.email && params.password){
        User.findOne({username: params.username}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'});
            }else if(userFind){
                return res.send({message: 'Nombre de usuario ya en uso'});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la encriptación'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.email = params.email.toLowerCase();

                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar'});
                            }else if(userSaved){
                                return res.send({message: 'Usuario guardado', userSaved});
                            }else{
                                return res.status(500).send({message: 'No se guardó el usuario'});
                            }
                        })
                    }else{
                        return res.status(401).send({message: 'Contraseña no encriptada'});
                    }
                })
            }
        })
    }else{
        return res.send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;
    
    if(req.user.sub == userId || req.user.role == "admin"){
        if(update.password){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña desde esta función'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        return res.send({message: 'No se puede actualizar, nombre de ususario ya en uso'});
                    }else{
                        User.findById(userId, (err, userFind) => {
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(!userFind){
                                return res.status(404).send({message: 'Usuario no encontrado'});
                            }else if(userFind.role == 'admin' && req.user.sub != userId){
                                return res.send({message: 'No se puede actualizar este usuario'});
                            }else if(userFind.role == 'admin' && req.user.sub == userId){
                                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al actualizar'});
                                    }else if(userUpdated){
                                        return res.send({message: 'Usuario actualizado', userUpdated});
                                    }else{
                                        return res.send({message: 'No se pudo actualizar al usuario'});
                                    }
                                })
                            }else{
                                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al actualizar'});
                                    }else if(userUpdated){
                                        return res.send({message: 'Usuario actualizado', userUpdated});
                                    }else{
                                        return res.send({message: 'No se pudo actualizar al usuario'});
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                User.findById(userId, (err, userFind) => {
                    if(err){
                        return res.status(500).send({message: 'Error general'});
                    }else if(!userFind){
                        return res.status(404).send({message: 'Usuario no encontrado'});
                    }else if(userFind.role == 'admin' && req.user.sub == userId){
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }else if(userFind.role == 'admin' && req.user.sub != userId){
                        return res.send({message: 'No se puede actualizar este usuario'});
                    }else if(userFind){
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }
                })
            }
        }
    }else if(req.user.sub != userId){
        return res.status(401).send({ message: 'No tienes permiso para realizar esta acción'});
    }
    
}


function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(req.user.sub == userId || req.user.role == "admin"){
        User.findOne({_id: userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind){
                if(userFind.role == 'client'){
                    bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al verificar contraseña'});
                        }else if(checkPassword){
                            User.findByIdAndRemove(userId, (err, userRemoved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al eliminar'});
                                }else if(userRemoved){
                                    Department.findOne({name: 'default'}, (err, departmentFind)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general'})
                                        }else if(departmentFind){
                                            Product.findOne({name: params.name.toLowerCase()}, (err, productFind)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general en el servidor'});
                                                }else if(productFind){
                                                    return res.send({message: 'Nombre de producto ya existe'});
                                                }else{                            
                                                    product.name = params.name.toLowerCase();
                                                    product.description = params.description;
                                                    product.stock = params.stock;
                                                    product.price = params.price;
                                                    product.department = departmentFind._id
                            
                                                    product.save((err, productSave)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al guardar'})
                                                        }else if(productSave){
                                                            Department.findOneAndUpdate({name: 'default'}, {$push:{products: productSave._id}}, {new: true}, (err, productPush)=>{
                                                                if(err){
                                                                    return res.status(500).send({message: 'Error general al agergar producto'})
                                                                }else if(productPush){
                                                                    return res.send({message: 'Producto agregado', productPush});
                                                                }else{
                                                                    return res.status(500).send({message: 'Error al agregar producto'})
                                                                }
                                                            })
                                                        }else{
                                                            return res.status(404).send({message: 'No se guardó el producto'})
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            Product.findOne({name: params.name.toLowerCase()}, (err, productFind)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general en el servidor'});
                                                }else if(productFind){
                                                    return res.send({message: 'Nombre de producto ya existe'});
                                                }else{                            
                                                    product.name = params.name.toLowerCase();
                                                    product.description = params.description;
                                                    product.stock = params.stock;
                                                    product.price = params.price;
                                                    
                                                    let defaultD = new Department(); 
                                                    defaultD.name = 'default';
                                                    defaultD.description = 'Productos generales'
                                                    defaultD.save((err, departmentSave)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al guardar'})
                                                        }else if(departmentSave){
                                                            User.findByIdAndUpdate(userId, {$push:{departments: departmentSave._id}}, {new: true}, (err, departmentPush)=>{
                                                                if(err){
                                                                    return res.status(500).send({message: 'Error general al agergar categoria'})
                                                                }else if(departmentPush){
                                                                    product.department = departmentSave.name
                                                                    console.log('Added default department')
                                                                }else{
                                                                    return res.status(500).send({message: 'Error al agregar categoria'})
                                                                }
                                                            })
                                                        }else{
                                                            return res.status(404).send({message: 'No se guardó la categoria'})
                                                        }
                                                    })
                            
                                                    product.save((err, productSave)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al guardar'})
                                                        }else if(productSave){
                                                            Department.findOneAndUpdate({name: 'default'}, {$push:{products: productSave._id}}, {new: true}, (err, productPush)=>{
                                                                if(err){
                                                                    return res.status(500).send({message: 'Error general al agergar producto'})
                                                                }else if(productPush){
                                                                    return res.send({message: 'Producto agregado', productPush});
                                                                }else{
                                                                    return res.status(500).send({message: 'Error al agregar producto'})
                                                                }
                                                            })
                                                        }else{
                                                            return res.status(404).send({message: 'No se guardó el producto'})
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                    return res.send({message: 'Usuario eliminado'});
                                }else{
                                    return res.status(403).send({message: 'Usuario no eliminado'});
                                }
                            })
                        }else{
                            return res.status(403).send({message: 'Contraseña incorrecta, no puedes eliminar tu cuenta sin tu contraseña'});
                        }
                    })
                }else{
                    return res.send({message: 'No se puede eliminar este usuario'});
                }
            }else{
                return res.status(403).send({message: 'Usuario no eliminado'});
            } 
        })
    }else if(req.user.sub != userId){
        return res.status(403).send({message: 'No tienes permiso para realizar esta acción'});
    }
}

function getUsers(req, res){
    User.find({}).populate('departments').exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor' + err})
        }else if(users){
            return res.send({message: 'Usuarios: ', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

function search(req, res){
    var params = req.body;

    if(params.search){
        User.find({$or:[{name: params.search},
                        {lastname: params.search},
                        {email: params.search},
                        {phone: params.search},
                        {username: params.search}]}, (err, resultSearch)=>{
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
    login,
    saveUser,
    updateUser,
    removeUser,
    getUsers,
    search
}