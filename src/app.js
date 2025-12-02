import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { router as agentRouter } from './route/agentRoute.js';
const app=express();
app.use(express.json());
app.use('/api', agentRouter);
export { app };