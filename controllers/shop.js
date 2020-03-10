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
      res.redirect('/cart'); //prefarably redirect to /products not to always have to go back for item quantity
    })
    .catch(err => { console.log(err) })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart() //get cart for the specific user
    .then(cart => {
      return cart.getProducts({ //find the products for that specific user by their prodId
        where: {
          id: prodId
        }
      })
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();//destroy the product but only in the carts table
    })
    .then(result => {
      return res.redirect('/cart')
    })
    .catch(err => {
      console.log(err)
    })
};

//Orders
exports.postOrder = (req, res, next) => {
  let fetchedCart;
  //take all the cart items and move them into an order
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts(); //return all products by default
    })
    .then(products => {
      return req.user.createOrder() //sequelize creates order and returns it
        .then(order => {  //addProduct picks that up and add the products to the order with that quantity
          return order.addProducts(products.map(product => { //i have an array of products mapped from the initial products 
            product.orderItem = { quantity: product.cartItem.quantity } //plus sme info regarding quantity of my order
            return product;
          }))
        }) //associate the user products in his cart to his order
        .catch(err => { console.log(err) });
    })
    .then(result => {
      //remove cart content after you order
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => { console.log(err) });
}

//SHOW ORDERS
exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include :['products']})
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      console.log(err)
    });

};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
