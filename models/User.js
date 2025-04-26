const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'sub-seller'],
    default: 'buyer'
  },
  date: {
    type: Date,
    default: Date.now
  },
  // 买家特有字段
  shippingAddresses: [{
    receiver: String,
    phone: String,
    address: String,
    isDefault: Boolean
  }],
  // 商家特有字段
  shopInfo: {
    shopName: String,
    contactPhone: String,
    businessLicense: String
  },
  // 子账号特有字段
  parentSeller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  permissions: [String] // 子账号权限
});

module.exports = mongoose.model('User', UserSchema);
