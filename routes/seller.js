const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// 发布商品
router.post('/products', auth, [
  check('name', '商品名称不能为空').not().isEmpty(),
  check('description', '商品描述不能为空').not().isEmpty(),
  check('price', '价格必须为数字').isNumeric(),
  check('category', '商品分类不能为空').not().isEmpty(),
  check('stock', '库存必须为数字').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, category, stock, images } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images: images || [],
      seller: req.user.id,
      status: 'active'
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 发布预售商品
router.post('/products/pre-sale', auth, [
  check('name', '商品名称不能为空').not().isEmpty(),
  check('description', '商品描述不能为空').not().isEmpty(),
  check('preSalePrice', '预售价格必须为数字').isNumeric(),
  check('category', '商品分类不能为空').not().isEmpty(),
  check('startDate', '预售开始时间不能为空').not().isEmpty(),
  check('endDate', '预售结束时间不能为空').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, preSalePrice, category, startDate, endDate, images } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price: preSalePrice,
      category,
      stock: 0,
      images: images || [],
      seller: req.user.id,
      status: 'pre-sale',
      preSaleInfo: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        preSalePrice
      }
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 获取商家商品列表
router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 更新商品信息
router.put('/products/:id', auth, async (req, res) => {
  const { name, description, price, category, stock, status } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: '商品不存在' });
    }

    // 检查商品是否属于当前商家
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: '无权操作' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.status = status || product.status;
    product.updatedAt = new Date();

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 获取商家订单
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('user', 'username email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 更新订单状态
router.put('/orders/:id/status', auth, async (req, res) => {
  const { status, trackingNumber } = req.body;

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: '订单不存在' });
    }

    // 检查订单是否属于当前商家
    if (order.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: '无权操作' });
    }

    order.status = status || order.status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    order.updatedAt = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// 添加子账号
router.post('/sub-accounts', auth, [
  check('email', '请输入有效的邮箱').isEmail(),
  check('password', '密码至少6位').isLength({ min: 6 }),
  check('permissions', '权限不能为空').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, username, permissions } = req.body;

  try {
    // 检查用户是否已存在
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: '邮箱已被使用' });
    }

    // 创建子账号
    user = new User({
      username,
      email,
      password,
      role: 'sub-seller',
      parentSeller: req.user.id,
      permissions
    });

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;
