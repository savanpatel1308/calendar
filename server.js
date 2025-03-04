const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { router: authRoutes } = require('./auth');
const eventRoutes = require('./events');
const reminderRoutes = require('./reminders');

const app = new Koa();
app.use(bodyParser());

// Use Routes
app.use(authRoutes.routes());
app.use(eventRoutes.routes());
app.use(reminderRoutes.routes());

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

