require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// 用户模型
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 },
  totalInvestment: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// 验证令牌的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 注册路由
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: '用户注册成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 登录路由
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ $or: [{ username }, { email: username }] });

    if (user && await bcrypt.compare(password, user.password)) {
      // 创建并发送 JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } else {
      res.status(400).json({ message: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 验证令牌的路由
app.get('/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取用户数据的路由
app.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({
      username: user.username,
      email: user.email,
      balance: user.balance,
      totalInvestment: user.totalInvestment
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 模拟投资数据路由
app.get('/investment-data', authenticateToken, (req, res) => {
  // 这里应该从数据库获取实际的投资数据
  // 现在我们只返回模拟数据
  res.json({
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    data: [12, 19, 3, 5, 2, 3]
  });
});

// 模拟加密货币列表路由
app.get('/crypto-list', authenticateToken, (req, res) => {
  // 这里应该从实时API获取实际的加密货币数据
  // 现在我们只返回模拟数据
  res.json([
    { name: 'Bitcoin', price: 50000 },
    { name: 'Ethereum', price: 3000 },
    { name: 'Litecoin', price: 150 }
  ]);
});

app.post('/fixed-investment', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (amount < 1000) {
      return res.status(400).json({ message: '最低投资额为 $1,000' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: '余额不足' });
    }

    // 更新用户余额和总投资
    user.balance -= amount;
    user.totalInvestment += amount;

    // 这里可以添加创建投资记录的逻辑
    // 例如：const investment = new Investment({ userId: user._id, amount, type: 'fixed', interestRate: 0.15 });
    // await investment.save();

    await user.save();

    res.json({ message: '投资成功', newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));