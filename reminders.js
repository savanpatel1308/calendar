const Router = require('koa-router');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = new Router();

// Get All Reminders
router.get('/reminders', authMiddleware, async (ctx) => {
    const [reminders] = await db.execute("SELECT * FROM reminders WHERE user_id = ?", [ctx.state.user.id]);
    ctx.body = reminders;
});

// Create a Reminder (Protected)
router.post('/reminders', authMiddleware, async (ctx) => {
    const { event_id, message, reminder_time } = ctx.request.body;

    await db.execute(
        "INSERT INTO reminders (event_id, user_id, message, reminder_time) VALUES (?, ?, ?, ?)",
        [event_id, ctx.state.user.id, message, reminder_time]
    );

    ctx.body = { message: 'Reminder created successfully' };
});

// Update a Reminder (Protected)
router.put('/reminders/:id', authMiddleware, async (ctx) => {
    const { message, reminder_time } = ctx.request.body;

    await db.execute(
        "UPDATE reminders SET message=?, reminder_time=? WHERE id=? AND user_id=?",
        [message, reminder_time, ctx.params.id, ctx.state.user.id]
    );

    ctx.body = { message: 'Reminder updated successfully' };
});

// Delete a Reminder (Protected)
router.delete('/reminders/:id', authMiddleware, async (ctx) => {
    await db.execute(
        "DELETE FROM reminders WHERE id=? AND user_id=?",
        [ctx.params.id, ctx.state.user.id]
    );

    ctx.body = { message: 'Reminder deleted successfully' };
});

module.exports = router;
