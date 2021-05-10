'use strict'

var User = require('../models/user.model');
var Product = require('../models/product.model');
var Receipt = require('../models/receipt.model');


function getReceipts(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Receipt.find({}).populate('receipt.products').exec((err, receipts)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(receipts){
                return res.send({message: 'Facturas: ', receipts})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function getReceiptsU(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOne({_id: userId}).populate('receipts').exec((err, user)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(user){
                    return res.status(202).send({message: 'Facturas', 
                        Facturas: user.receipts})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function getReceiptsDetails(req, res){
    let userId = req.params.idU;
    let receiptId = req.params.idR;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Receipt.findOne({_id: receiptId}).populate('receipts').exec((err, receipt)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(receipt){
                    return res.status(202).send({message: 'Factura', receipt})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

/* function checkOut(req, res){
    var userId = req.params.idU;
    var receipt = new Receipt();

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findById(userId, (err, userFind) => {
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind && userFind.cart.length === 0){
                return res.status(401).send({message: 'No hay productos en el carrito'});
            }else if(userFind){
                receipt.date = Date.now();

                receipt.save((err, receiptSave)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar'})
                    }else if(receiptSave){
                        User.findByIdAndUpdate(userId, {$push:{receipts: receiptSave._id}}, {new: true}, (err, receiptPush)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al agergar factura'})
                            }else if(receiptPush){

                                userFind.cart.map(product => {

                                    Product.findById(product._id, (err, productFind) => {
                                        var stock

                                        if(err){
                                            return res.status(500).send({message: 'Error general al buscar producto'});
                                        }else if(productFind){
                                            if(productFind.stock === 0){
                                                stock = productFind.stock
                                                if(userFind.cart.length === 1){
                                                    User.findOneAndUpdate({_id: userId, receipt: receiptSave._id},
                                                        {$pull:{products: productFind._id}}, {new:true}, (err, receiptPull)=>{
                                                            if(err){
                                                                return res.status(500).send({message: 'Error general'});
                                                            }else if(receiptPull){
                                                                Receipt.findByIdAndRemove(receiptSave._id, (err, receiptRemoved)=>{
                                                                    if(err){
                                                                        return res.status(500).send({message: 'Error general al eliminar producto'});
                                                                    }else if(receiptRemoved){
                                                                        return res.send({message: 'Producto eliminado', receiptRemoved});
                                                                    }else{
                                                                        return res.status(500).send({message: 'Producto no encontrado, o ya eliminado'});
                                                                    }
                                                                })
                                                            }
                                                        }   
                                                    )
                                                }
                                            }else if(productFind.stock < product.quantity){
                                                stock = 0
                                                product.quantity = productFind.stock
                                            }else{
                                                stock =  productFind.stock - product.quantity
                                            }
                                            if(productFind.stock > 0 && userFind.cart.length > 1){
                                                Product.findByIdAndUpdate(productFind._id, {stock: stock, purchases: productFind.purchases+1} , {new: true}, (err, productUpdated)=>{
                                                    if(err){
                                                        console.log({message: 'Error general en la actualización', err});
                                                    }else if(!productUpdated){
                                                        console.log({message: 'Producto no actualizado'});
                                                    }
                                                })

                                                Receipt.findByIdAndUpdate(receiptSave._id, {$push:{products: product._id}}, {new: true}, (err, productPush)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al agergar el producto'})
                                                    }else if(!productPush){
                                                        return res.status(500).send({message: 'Error al agregar producto'})
                                                    }if(product._id == userFind.cart[userFind.cart.length -1]._id){
                                                        return res.send({message: 'Factura creada', productPush})
                                                    }
                                                })
            
                                                User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                                {$pull:{cart:{_id: product._id}}}, {new: true}, (err, productRemove)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                                    }else if(!productRemove){
                                                        console.log({message: 'Producto no encontrado o ya eliminado'});
                                                    }
                                                })
                                            }else{
                                                User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                                {$pull:{cart:{_id: product._id}}}, {new: true}, (err, productRemove)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                                    }else if(!productRemove){
                                                        console.log({message: 'Producto no encontrado o ya eliminado'});
                                                    }
                                                })

                                                User.findOneAndUpdate({_id: userId, receipt: receiptSave._id},
                                                    {$pull:{products: productFind._id}}, {new:true}, (err, receiptPull)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general'});
                                                        }else if(receiptPull){
                                                            Receipt.findByIdAndRemove(receiptSave._id, (err, receiptRemoved)=>{
                                                                if(err){
                                                                    return res.status(500).send({message: 'Error general al eliminar producto'});
                                                                }else if(receiptRemoved){
                                                                    return res.send({message: 'Producto eliminado', receiptRemoved});
                                                                }else{
                                                                    return res.status(500).send({message: 'Producto no encontrado, o ya eliminado'});
                                                                }
                                                            })
                                                        }
                                                    }   
                                                )
                                                return res.status(401).send({message: 'Error en la peticion'})
                                            }

                                        }else{
                                            User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                            {$pull:{cart:{_id: product._id}}}, {new: true}, (err, productRemove)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                                }else if(!productRemove){
                                                    console.log({message: 'Producto no encontrado o ya eliminado'});
                                                }
                                            })
                                        }
                                    })
                                    
                                    

                                })

                                
                            }else{
                                return res.status(500).send({message: 'Error al crear factura'})
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se guardó la factura'})
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no encontrado'});
            }
        })
    }
} */

function checkOut(req, res){
    var userId = req.params.idU;
    var receipt = new Receipt();

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findById(userId, (err, userFind) => {
            if(err){
                return res.status(500).send({message: 'Error general buscar usuario'});
            }else if(userFind && userFind.cart.length === 0){
                return res.status(401).send({message: 'No hay productos en el carrito'});
            }else if(userFind && userFind.cart.length === 1){
                Product.findById(userFind.cart[0]._id, (err,productC) => {
                    if(err){
                        return res.status(500).send({message: 'Error general al eliminar'});
                    }else if(productC.stock === 0){
                        return res.status(500).send({message: 'Producto fuera de inventario'});
                    }
                    else{
                        receipt.date = Date.now();
                        receipt.save((err, receiptSave)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar'})
                            }else if(receiptSave){
                                User.findByIdAndUpdate(userId, {$push:{receipts: receiptSave._id}}, {new: true}, (err, receiptPush)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al agergar factura'})
                                    }else if(receiptPush){
                                        userFind.cart.map(product => {

                                            Receipt.findByIdAndUpdate(receiptSave._id, {$push:{products: product}}, {new: true}, (err, productPush)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al agergar el producto'})
                                                }else if(!productPush){
                                                    return res.status(404).send({message: 'Error al agregar producto'})
                                                }
                                            })

                                            Receipt.findByIdAndUpdate(receiptSave._id, {$inc:{total: product.quantity * product.pricePP, tax: product.pricePP * 0.02 * product.quantity}}, {new: true}, (err, productPush)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al agergar el producto'})
                                                }else if(!productPush){
                                                    return res.status(404).send({message: 'Error al agregar producto'})
                                                }
                                            })

                                            User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                                {$pull:{cart:{_id: product._id}}}, {new: true}, (err, productRemove)=>{
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                                    }else if(!productRemove){
                                                        return res.status(404).send({message: 'Producto no encontrado o ya eliminado'});
                                                    }
                                                }
                                            )
        
                                            Product.findByIdAndUpdate(product._id, {$inc: {purchases : 1, stock: -product.quantity}} , {new: true}, (err, productUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general en la actualización', err});
                                                }else if(!productUpdated){
                                                    return res.status(404).send({message: 'Producto no actualizado'});
                                                }
                                            })
        
                                        })
        
                                        Receipt.findById(receiptSave._id).populate('products').exec((err, receipts)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general en el servidor' + err})
                                            }else if(receipts){
                                                return res.status(202).send({message: 'Facturas', receipts})
                                            }else{
                                                return res.status(404).send({message: 'No hay registros'})
                                            }
                                        })
                                        
                                    }else{
                                        return res.status(500).send({message: 'Error al crear factura'})
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'No se guardó la factura'})
                            }
                        })
                    }
                })
            }else if(userFind){
                userFind.cart.map(productV => {
                    Product.findById(productV._id, (err,productC) => {
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar'});
                        }else if(productC.stock === 0 || !productC){
                            User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                {$pull:{cart:{_id: product._id}}}, {new: true}, (err)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                    }
                                }
                            )
                        }else if(productC.stock < productV.quantity){
                            productV.quantity = productC.stock
                        }
                    })
                })

                receipt.date = Date.now();
                receipt.save((err, receiptSave)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar'})
                    }else if(receiptSave){
                        User.findByIdAndUpdate(userId, {$push:{receipts: receiptSave._id}}, {new: true}, (err, receiptPush)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al agergar factura'})
                            }else if(receiptPush){
                                userFind.cart.map(product => {

                                    Receipt.findByIdAndUpdate(receiptSave._id, {$push:{products: product._id}}, {new: true}, (err, productPush)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al agergar el producto'})
                                        }else if(!productPush){
                                            return res.status(404).send({message: 'Error al agregar producto'})
                                        }
                                    })

                                    User.findOneAndUpdate({_id: userId, 'cart._id': product._id},
                                        {$pull:{cart:{_id: product._id}}}, {new: true}, (err, productRemove)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general al eliminar documento embedido'});
                                            }else if(!productRemove){
                                                return res.status(404).send({message: 'Producto no encontrado o ya eliminado'});
                                            }
                                        }
                                    )

                                    Product.findByIdAndUpdate(product._id, {$inc: {purchases : 1, stock: -product.quantity}} , {new: true}, (err, productUpdated)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general en la actualización', err});
                                        }else if(!productUpdated){
                                            return res.status(404).send({message: 'Producto no actualizado'});
                                        }
                                    })

                                })

                                Receipt.findById(receiptSave._id).populate('products').exec((err, receipts)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general en el servidor' + err})
                                    }else if(receipts){
                                        return res.status(202).send({message: 'Facturas', receipts})
                                    }else{
                                        return res.status(404).send({message: 'No hay registros'})
                                    }
                                })
                                
                            }else{
                                return res.status(500).send({message: 'Error al crear factura'})
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se guardó la factura'})
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no encontrado'});
            }
        })
    }
}

module.exports = {
    getReceipts,
    getReceiptsU,
    getReceiptsDetails,
    checkOut
}