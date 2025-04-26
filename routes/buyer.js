const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// 获取所有商品
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 搜索商品
router.get('/products/search', async (req, res) => {
  const { q } = req.query;
  try {
    const products = await Product.find({
      $text: { $search: q },
      status: 'active'
    });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 获取商品分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 获取单个商品详情
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ msg: '商品不存在' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 添加到购物车
router.post('/cart', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);
    
    if (!product || product.status !== 'active') {
      return res.status(404).json({ msg: '商品不存在' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ msg: '库存不足' });
    }

    // 添加到购物车
    const cartItem = {
      product: productId,
      quantity,
      price: product.price
    };

    user.cart.push(cartItem);
    await user.save();

    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 创建订单
router.post('/orders', auth, async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    
    if (user.cart.length === 0) {
      return res.status(400).json({ msg: '购物车为空' });
    }

    // 计算总价
    const totalPrice = user.cart.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    // 创建订单
    const order = new Order({
      user: req.user.id,
      items: user.cart,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'pending'
    });

    await order.save();
    
    // 清空购物车
    user.cart = [];
    await user.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 获取用户订单
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 添加收货地址
router.post('/addresses', auth, async (req, res) => {
  const { receiver, phone, address, isDefault } = req.body;
  try {
    const user = await User.findById(req.user.id);
    
    const newAddress = {
      receiver,
      phone,
      address,
      isDefault: isDefault || false
    };

    if (isDefault) {
      user.shippingAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.shippingAddresses.push(newAddress);
    await user.save();

    res.json(user.shippingAddresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;
