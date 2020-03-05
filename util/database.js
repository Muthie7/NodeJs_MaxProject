const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'Onfon@2014', { //create a sequelize object that will connect to the db automatically
    dialect: 'mysql', 
    host: 'localhost'
});


module.exports = sequelize; //which is simply that db connection 