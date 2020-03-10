const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const OrderItem = sequelize.define('orderItem',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  },
  quantity:{
    type: Sequelize.INTEGER,
    allowNull:false
  }
})

module.exports = OrderItem; // A cart belongs to one user but has multiple products