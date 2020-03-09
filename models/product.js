const Sequelize = require('sequelize'); //gives back a constructor function
const sequelize =  require('../util/database'); //import db magt pool by sequelize

//we can now design a Model managed by sequelize
const Product = sequelize.define('product',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title:{
    type:Sequelize.STRING,
    allowNull:false
  },
  price:{
    type:Sequelize.DOUBLE,
    allowNull:false
  },
  imageUrl:{
    type:Sequelize.STRING,
    allowNull: false
  },
  description:{
    type:Sequelize.STRING,
    allowNull: false
  }
})

//Export your model usable in any other module

module.exports = Product;