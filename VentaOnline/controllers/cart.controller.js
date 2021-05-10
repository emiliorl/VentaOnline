'use strict'

var User = require('../models/user.model');
var Product = require('../models/product.model');

function setCartItem(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;
    var params = req.body;

    if(req.user.sub != userId){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.quantity && params.quantity > 0){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(userFind){
                    Product.findById(productId, (err, productFind) => {
                        if(err){
                            return res.status(500).send({message: 'Error general'})
                        }else if(productFind.stock < params.quantity || params.quantity > 10){
                            return res.status(401).send({message: 'Cantidad de producto selecccionada incorrecta'})
                        }else if(productFind){
                            let itemInCart = userFind.cart.filter((itemInCart) =>{
                                if(itemInCart._id == productId) return true
                            })
                            if(itemInCart.length !== 0){
                                return res.status(401).send({message: 'Producto ya se encuentra en la canasta, solo puede actualizar o eliminar.'})
                            }else if(itemInCart.length === 0){
                                User.findByIdAndUpdate(userId, {$push:{cart: [{_id: productId, quantity: params.quantity, pricePP: productFind.price}]}}, {new: true}, (err, cartPush)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al agergar producto a la canasta'})
                                    }else if(cartPush){
                                        return res.send({message: 'Producto agregado a la canasta', cartPush});
                                    }else{
                                        return res.status(500).send({message: 'Error al agregar producto a la canasta'})
                                    }
                                })
                            }
                        }else{
                            return res.status(404).send({message: 'El producto que deseas agregar no existe.'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'El usuario al que deseas agregar el producto no existe.'})
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function updateCartItem(req, res){
    let userId = req.params.idU;
    var productId = req.params.idP;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.quantity){
            User.findById(userId, (err, userFind) => {
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }if(userFind){
                    Product.findById(productId, (err, productFind) => {
                        if(err){
                            return res.status(500).send({message: 'Error general'});
                        }else if(productFind.stock < update.quantity || update.quantity > 10){
                            return res.status(401).send({message: 'Cantidad de producto incorrecta'});
                        }else if(productFind){
                            User.findOneAndUpdate({_id: userId, 'cart._id': productId}, {'cart.$.quantity': update.quantity}, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Carrito actualizado', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar al carrito'});
                                }
                            })
                        }else{
                            return res.status(401).send({message: 'Producto no encontrado'});
                        }
                    })

                }else{
                    return res.status(401).send({message: 'Usuario no encontrado'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function removeCartProduct(req, res){
    let userId = req.params.idU;
    let proudctId = req.params.idP;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOneAndUpdate({_id: userId, 'cart._id': proudctId},
        {$pull:{cart:{_id: proudctId}}}, {new: true}, (err, productRemove)=>{
            if(err){
                res.status(500).send({message: 'Error general al eliminar documento embedido'});
            }else if(productRemove){
                res.status(200).send({message: 'Product fue eliminado del carrito: ', productRemove});
            }else{
                res.status(404).send({message: 'Product no encontrado o ya eliminado del carrito'});
            }
        })
    }
}

function getCart(req, res){
    let userId = req.params.idU;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOne({_id: userId}).exec((err, userCart)=>{
            if(err){
                res.status(500).send({message: 'Error general en el servidor'});
            }else if(userCart){
                res.status(200).send({message: 'Carrito: ', cart: userCart.cart})
            }else{
                res.status(404).send({message: 'Carrito no encontrado'});
            }
        })
    }
}

module.exports = {
    setCartItem,
    updateCartItem,
    getCart,
    removeCartProduct
}