//this is the root file where the execution of the api takes place 
//ROOT_DIR/scr/app.ts
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import routes from './routes/index.js';
import { config } from './config/index.js'
import { db } from '../prisma/db';
import { errorHandler } from './middlewares/errorHandler.js';

const app: Application = express()//initiate the session of express to valiable name app
app.use(morgan('dev'))//console logs on the server are avilable only duing dev mode
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())//to parse the incoming request body as json
app.use(express.urlencoded({ extended: true }))//to parse the incoming request body as urlencoded data

//to serve uploaded file stasitacally
app.use('/uploads', express.static(path.resolve(config.uploadsDir)))

//health- check route
app.get('/health', async (_req: Request, res: Response) => {
    const services: Record<string, 'ok' | 'error'> = {}
    try {
        await db.orm.public.User.where({ id: 'health-check' }).first();//check the database connection
        services.db = 'ok'
    } catch {
        services.db = 'error'

    }
    const allHealthy = Object.values(services).every((s) => s === 'ok');
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'ok' : 'error',
        services,
    })
})
app.use('/api', routes);
app.use(errorHandler)//error handler middleware to handle errors in the api
export default app;
