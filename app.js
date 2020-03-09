const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) =>{ //only runs after app initialized
    //reach into my db get my user
    User.findByPk(1)
    .then( user =>{
        req.user = user; //whenever we call req.user in our code it comes embedded wiht sequel methods e.g .destroy
        next();
    })
    .catch(err =>{console.log(err)});
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


Product.belongsTo(User, {  //these are for products created by users
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Product);

//with the above setup sequelize wont jst setup the 2 tables but also define their relations as defined
//forces re-Sync i.e drops any existing tables and re-do with the ralations 
//sequelize.sync({ force:true}) 
sequelize
    .sync()
    .then(result => {
        //console.log(result);
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({ 
                name: 'Mash',
                email: "test@test.com" })
        }
        return user;
    })
    .then(user => {
        //console.log(user);
        app.listen(3000, () => {
            console.log('Server listening on port 3000')
        });
    })
    .catch(err => {
        console.log(err);
    })
