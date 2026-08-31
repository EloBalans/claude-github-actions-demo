import express, { type Express } from 'express';
import { InMemoryTaskRepository } from './persistence/in-memory-task.repository';
import { systemTaskIdentity } from './task-identity';
import { createTasksRouter } from './tasks.router';

export function createTaskApi(): Express {
  const app = express();

  app.use(express.json());
  app.use(createTasksRouter(new InMemoryTaskRepository(), systemTaskIdentity));

  return app;
}
