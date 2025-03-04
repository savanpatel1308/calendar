const Router = require('koa-router');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = new Router();
const SECRET_KEY = process.env.SECRET_KEY;

// User Registration (Sign Up)
router.post('/users/register', async (ctx) => {
    const { name, email, password } = ctx.request.body;

    // ✅ Validate Input
    if (!name || !email || !password) {
        ctx.status = 400;
        ctx.body = { error: "All fields (name, email, password) are required" };
        return;
    }
    
    // Check if user already exists
    const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
        ctx.status = 400;
        ctx.body = { error: "User already exists" };
        return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User into Database
    await db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
        [name, email, hashedPassword]);

    ctx.body = { message: "User registered successfully" };
});

// User Login (Generate JWT Token)
router.post('/users/login', async (ctx) => {
    const { email, password } = ctx.request.body;

    // ✅ Validate Input
    if (!email || !password) {
        ctx.status = 400;
        ctx.body = { error: "Email and password are required" };
        return;
    }

    // Find User by Email
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        ctx.status = 401;
        ctx.body = { error: "Invalid email or password" };
        return;
    }

    const user = users[0];

    // Compare Passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        ctx.status = 401;
        ctx.body = { error: "Invalid email or password" };
        return;
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    ctx.body = { token };
});

// ✅ Logout Route
router.post('/users/logout', async (ctx) => {
    // On the frontend, just remove the token from localStorage
    ctx.body = { message: "User logged out successfully" };
});

// Middleware to Protect Routes
const authMiddleware = async (ctx, next) => {
    try {
        if (!ctx.headers.authorization) {
            console.log("❌ Missing Authorization Header");
            ctx.status = 401;
            ctx.body = { error: "Missing Authorization Header" };
            return;
        }

        const token = ctx.headers.authorization.split(" ")[1];

        if (!token) {
            console.log("❌ Token is missing");
            ctx.status = 401;
            ctx.body = { error: "Token is missing" };
            return;
        }

        ctx.state.user = jwt.verify(token, SECRET_KEY);
        console.log("✅ User authenticated:", ctx.state.user);

        await next();
    } catch (err) {
        console.error("❌ Authentication Error:", err.message);
        ctx.status = 401;
        ctx.body = { error: "Invalid or Expired Token" };
    }
};

module.exports = { router, authMiddleware };
