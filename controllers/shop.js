const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      //console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    }).catch(err => {
      console.log(err);
    });
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err)
    });

};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      //console.log(products);
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    }).catch(err => {
      console.log(err);
    });
}

exports.getCart = (req, res, next) => {
  //console.log(req.user.cart)
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => { //here we can now access products available in the cart i.e render
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
        .catch(err => {
          console.log(err)
        });
    })
    .catch(err => {
      console.log(err)
    })
};

exports.postCart = (req, res, next) => { //Adding a product to the cart
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then(cart => { //here i simply have access to the cart coz of the getCart method
      //find out whether the product is part of the cart, if it is, add quantity of 1, if not then add to cart afresh
      fetchedCart = cart;
      return cart.getProducts({
        where: { id: prodId }
      })
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      //check if a product exists, if it does increase the quantity, check previous quantity then change it
      if (product) {
        //add a product thats already in the cart, incrementing
        const oldQuantity = product.cartItem.quantity; //quantity as stored in the cart table
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId) //add product not already in cart and tag it
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      })
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => { console.log(err) })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
  .getCart() //get cart for the specific user
  .then( cart =>{
    return cart.getProducts({ //find the products for that specific user by their prodId
      where:{
        id:prodId  
      }
    })
  })
  .then( products =>{
    const product = products[0];
    return product.cartItem.destroy();//destroy the product but only in the carts table
  })
  .then( result =>{
    return res.redirect('/cart')
  })
  .catch(err =>{
    console.log(err)
  })
};

//Orders
exports.postOrder = (req,res,next) =>{
  //take all the cart items and move them into an order
  req.user
  .getCart()
  .then(cart =>{
    return cart.getProducts(); //return all products by default
  })
  .then(products =>{
    console.log(products);
  })
  .catch(err =>{console.log(err)})
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
