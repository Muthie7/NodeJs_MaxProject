const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const CartItem = sequelize.define('cartItem',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true

  },
  quantity:{
      type:Sequelize.INTEGER  //since each cart item is a combination of product and the id of the cart where the product lies and quantity 
      //id of the cart of which it's related is created by a sequelize association managed
  }
})

module.exports = CartItem; // A cart belongs to one user but has multiple products