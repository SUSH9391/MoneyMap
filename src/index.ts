
import { config } from './config/index.js';
import db from '../prisma/db.js'
import app from './app.js'

const PORT = config.port;
async function start() {
    console.log('Running startup check');
    try {
        await db.orm.public.User.where({ id: 'health-check' }).first();
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1)
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
        console.log(`Health http://0.0.0.0:${PORT}/health`);
        console.log(`API http://0.0.0.0:${PORT}/api`)
    })
}
start();