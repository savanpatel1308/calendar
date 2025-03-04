const Router = require('koa-router');
const db = require('./db');
const { authMiddleware } = require('./auth'); // ✅ Make sure this is correct!

const router = new Router();

// Get All Events
router.get('/events', async (ctx) => {
    const [events] = await db.execute("SELECT * FROM events");
    ctx.body = events;
});

// Create Event (Protected Route)
router.post('/events', authMiddleware, async (ctx) => {
    const { title, description, date_time, location } = ctx.request.body;

    await db.execute(
        "INSERT INTO events (user_id, title, description, date_time, location) VALUES (?, ?, ?, ?, ?)",
        [ctx.state.user.id, title, description, date_time, location]
    );

    ctx.body = { message: 'Event created successfully' };
});

// Delete Event (Protected Route)
router.delete('/events/:id', authMiddleware, async (ctx) => {
    await db.execute(
        "DELETE FROM events WHERE id = ? AND user_id = ?",
        [ctx.params.id, ctx.state.user.id]
    );

    ctx.body = { message: 'Event deleted successfully' };
});

module.exports = router;

