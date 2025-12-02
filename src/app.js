import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { router as agentRouter } from './route/agentRoute.js';
const app=express();
app.use('/api', agentRouter);
export { app };