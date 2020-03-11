const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => { //only runs after app initialized                            
    User.findByPk(1) //reach into my db get my user
        .then(user => {
            req.user = user; //whenever we call req.user in our code it comes embedded with sequel methods e.g .destroy
            next();
        })
        .catch(err => { console.log(err) });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//User ASSOCIATIONS
Product.belongsTo(User, {  //these are for products created by users i.e Admins
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Product);

//Carts Associations
User.hasOne(Cart);
Cart.belongsTo(User); //will add a new field to the cart which is the userId to which the cart belongs
Cart.belongsToMany(Product,{ through: CartItem });//through ==>points sequelize to where this connectioms should be stored
Product.belongsToMany(Cart,{ through: CartItem }); //many-to-many coz one cart can hold many products and many products can be held in many carts
                            //this works with an intermediate table which works with a combi of productId and cartId ==> cart-item model

//Orders Associations
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{ through: OrderItem}); //belongs to many products and does so with an inBtwn table specified by OrderItem
Product.belongsToMany(Order, { through: OrderItem})

//with the above setup sequelize wont jst setup the 2 tables but also define their relations as defined
//forces re-Sync i.e drops any existing tables and re-do with the ralations ==> sequelize.sync({ force:true}) 

sequelize
    .sync(s)
    .then(result => {
        //console.log(result);
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Mash',
                email: "test@test.com"
            })
        }
        return user;
    })
    .then(user => {
        //console.log(user);
        return user.createCart();
    })
    .then(cart =>{
        app.listen(3000, () => {
            console.log('======================================');
            console.log('Server listening on port 3000');
            console.log('======================================')
        });
    })
    .catch(err => {
        console.log(err);
    })
