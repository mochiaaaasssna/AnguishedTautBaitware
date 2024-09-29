const express = require('express');
const app = express();
const fs = require('fs');

// Read files only once at startup
const users = JSON.parse(fs.readFileSync('./database/users.json'));
const bannedIDs = JSON.parse(fs.readFileSync('./database/banned.json')); 
const coupons = JSON.parse(fs.readFileSync('./database/coupons.json'));

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true })); 

// Check if username exists
app.get('/check', (req, res) => {
  const user = users.find(x => x.username === req.query.username);
  res.send(!!user); 
});

// Create new user
app.get('/create', (req, res) => {
  const { username, password, money, profile } = req.query;

  if (users.some(x => x.username === username)) {
    return res.status(400).send('Username already exists'); 
  }

  const newUser = {
    username,
    password,
    profile,
    money: parseInt(money) || 500, 
    coupons: []
  };
  users.push(newUser);
  fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
  res.send(true);
});

// Redeem coupon (re-optimized)
app.get('/redeem', (req, res) => {
  const { username, coupons: couponCode } = req.query; 

  // 1. Find user and handle not found case
  const user = users.find(x => x.username === username);
  if (!user) return res.status(404).send('User not found');

  // 2. Find coupon and handle not found case 
  const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
  if (!coupon) return res.status(400).send('Invalid coupon code'); // Explicit error message

  // 3. Check if coupon already redeemed by this user
  if (user.coupons.includes(couponCode)) {
    return res.status(400).send('Coupon already redeemed');
  }

  // 4. Check redemption limit for the specific coupon
  if (coupon.uses >= coupon.limit) { 
    return res.status(400).send('Coupon redemption limit reached'); 
  } 

  // 5. Update user's money and coupons
  user.money += coupon.money;
  user.coupons.push(couponCode);

  // 6. Update coupon uses
  coupon.uses++;

  // 7. Write changes to files
  fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
  fs.writeFileSync('./database/coupons.json', JSON.stringify(coupons, null, 2)); 

  // 8. Send success response
  res.send(true);
});

// Get user info
app.get('/info', (req, res) => {
  const { username } = req.query;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(404).send('User not found');
  res.send(JSON.stringify(user)); 
});

// Update user info
app.get('/update', (req, res) => {
  const { username, password, money } = req.query;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(404).send('User not found');
  if (password) user.password = password; 
  if (money) user.money = parseInt(money) || 0; 
  fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
  res.send(true);
});

// User login
app.get('/login', (req, res) => {
  const { username, password } = req.query;
  const user = users.find(u => u.username === username && u.password === password);
  if (username === "admin" || username === "moderators") return res.send('admin')
  res.send(express)
});

// Check if user is banned
app.get('/isBan', (req, res) => {
  const { username } = req.query;
  res.send(bannedIDs.includes(username)); 
});
app.get('/createCoupon', (req, res) => {
  const { code, money, limit} = req.query
  newCoupon = {
    code: code,
    money: parseInt(money),
    limit: parseInt(limit),
    uses: 0
  }
  coupons.push(newCoupon)
  fs.writeFileSync("./database/coupons.json", JSON.stringify(coupons,null,2))
  res.send(true)
})
// Start the server
const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
