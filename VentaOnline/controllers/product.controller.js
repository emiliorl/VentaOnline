'use strict'

var User = require('../models/user.model');
var Department = require('../models/department.model');
var Product = require('../models/product.model');

function setProduct(req, res){
    var userId = req.params.idU;
    var departmentId = req.params.idD;
    var params = req.body;
    var product = new Product();

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.name && params.price && params.stock){
            Department.findById(departmentId, (err, departmentFind)=>{
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
                            product.department = departmentId
    
                            product.save((err, productSave)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar'})
                                }else if(productSave){
                                    Department.findByIdAndUpdate(departmentId, {$push:{products: productSave._id}}, {new: true}, (err, productPush)=>{
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
                    return res.status(404).send({message: 'La categoria a la que deseas agregar el producto no existe.'})
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function setProductNoId(req, res){
    var userId = req.params.idU;
    var params = req.body;
    var product = new Product();

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.name && params.price && params.stock){
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
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function updateProduct(req, res){
    let userId = req.params.idU;
    let productId = req.params.idP;
    let update = req.body;

    if(userId != req.user.sub || update.department){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.name || update.price || update.stock){
            Product.findById(productId, (err, productFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'});
                }else if(productFind){
                    Department.find({products: productId}, (err, departmentFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la busqueda de la categoria'});
                        }else if(departmentFind){
                            Product.findByIdAndUpdate(productId, update, {new: true}, (err, productUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la actualización'});
                                }else if(productUpdated){
                                    return res.send({message: 'Producto actualizado', productUpdated});
                                }else{
                                    return res.status(404).send({message: 'Producto no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'Categoria no encontrado'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'No existe el producto a actulizar'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function removeProduct(req, res){
    let userId = req.params.idU;
    let departmentId = req.params.idD;
    let productId = req.params.idP;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Department.findById(departmentId).populate('products').exec((err, departments)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(departments){
                Department.findOneAndUpdate({_id: departmentId, products: productId},
                    {$pull:{products: productId}}, {new:true}, (err, productPull)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(productPull){
                            Product.findByIdAndRemove(productId, (err, productRemoved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al eliminar producto'});
                                }else if(productRemoved){
                                    return res.send({message: 'Producto eliminado', productPull});
                                }else{
                                    return res.status(500).send({message: 'Producto no encontrado, o ya eliminado'});
                                }
                            })
                        }else{
                            return res.status(500).send({message: 'No se pudo eliminar el producto'});
                        }
                    }).populate('products')
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function getProducts(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Product.find({}).exec((err, products)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(products){
                return res.send({message: 'Productos: ', products})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function mostSold(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Product.find({}).exec((err, products)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(products){
                return res.send({message: 'Productos:', 
                MasVendido: (products.filter(product => {
                    return product.purchases > 0
                })).sort((a,b) => b.purchases - a.purchases)})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function soldOut(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Product.find({}).exec((err, products)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(products){
                return res.send({message: 'Productos: ', 
                FueraDeInventario: (products.filter(product => {
                    return product.stock === 0
                }))})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function searchProduct(req, res){
    var params = req.body;

    if(params.search){
        Product.find({$or:[{name: { "$regex": params.search}}]}, (err, resultSearch)=>{
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
    setProduct,
    setProductNoId,
    updateProduct,
    getProducts,
    mostSold,
    soldOut,
    searchProduct,
    removeProduct
}