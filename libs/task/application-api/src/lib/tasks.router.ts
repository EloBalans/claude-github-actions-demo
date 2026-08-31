import { Router } from 'express';
import {
  beAddTaskUrl,
  beChangeTaskStatusUrlPattern,
  beDiscardTaskUrlPattern,
  beFindTaskUrlPattern,
  beListTasksUrl,
  beReadTaskStatsUrl,
  beResetTasksUrl,
  isTaskStatusDto,
  type BeErrorResponse,
} from '@claude-actions/task/contracts';
import {
  toTaskDto,
  toTaskStatsDto,
  type TaskQuery,
} from '@claude-actions/task/domain';
import type { SeededTaskRepository } from './persistence/seeded-task.repository';
import type { TaskIdentityFactory } from './task-identity';
import { addTask } from './use-cases/add-task';
import { changeTaskStatus } from './use-cases/change-task-status';
import { discardTask } from './use-cases/discard-task';
import { findTask } from './use-cases/find-task';
import { listTasks } from './use-cases/list-tasks';
import { readTaskStats } from './use-cases/read-task-stats';
import { resetTasks } from './use-cases/reset-tasks';
import { delay, searchDelayMs } from './latency';

const STATS_DELAY_MS = 120;
const UPDATE_DELAY_MS = 200;

export function createTasksRouter(
  repository: SeededTaskRepository,
  newIdentity: TaskIdentityFactory,
): Router {
  const router = Router();

  router.get(beListTasksUrl, async (req, res) => {
    const query = readQuery(req.query.search, req.query.status);

    await delay(searchDelayMs(query.search));

    res.json(listTasks(repository, query).map(toTaskDto));
  });

  router.get(beReadTaskStatsUrl, async (_req, res) => {
    await delay(STATS_DELAY_MS);

    res.json(toTaskStatsDto(readTaskStats(repository)));
  });

  router.get(beFindTaskUrlPattern, (req, res) => {
    const task = findTask(repository, req.params.taskId);

    if (!task) {
      res.status(404).json(notFound(req.params.taskId));
      return;
    }

    res.json(toTaskDto(task));
  });

  router.post(beAddTaskUrl, (req, res) => {
    const created = addTask(repository, newIdentity, {
      title: isString(req.body?.title) ? req.body.title : '',
      status: isTaskStatusDto(req.body?.status) ? req.body.status : undefined,
      tags: Array.isArray(req.body?.tags)
        ? req.body.tags.filter(isString)
        : undefined,
    });

    if (!created) {
      res
        .status(400)
        .json({ message: 'title is required' } satisfies BeErrorResponse);
      return;
    }

    res.status(201).json(toTaskDto(created));
  });

  router.patch(beChangeTaskStatusUrlPattern, async (req, res) => {
    if (!isTaskStatusDto(req.body?.status)) {
      res.status(400).json({
        message: 'status must be one of: todo, doing, done',
      } satisfies BeErrorResponse);
      return;
    }

    await delay(UPDATE_DELAY_MS);

    const updated = changeTaskStatus(
      repository,
      req.params.taskId,
      req.body.status,
    );

    if (!updated) {
      res.status(404).json(notFound(req.params.taskId));
      return;
    }

    res.json(toTaskDto(updated));
  });

  router.delete(beDiscardTaskUrlPattern, (req, res) => {
    if (!discardTask(repository, req.params.taskId)) {
      res.status(404).json(notFound(req.params.taskId));
      return;
    }

    res.status(204).send();
  });

  router.post(beResetTasksUrl, (_req, res) => {
    res.json(resetTasks(repository).map(toTaskDto));
  });

  return router;
}

function readQuery(rawSearch: unknown, rawStatus: unknown): TaskQuery {
  return {
    search: isString(rawSearch) ? rawSearch : '',
    status: isTaskStatusDto(rawStatus) ? rawStatus : null,
  };
}

function notFound(taskId: string): BeErrorResponse {
  return { message: `No task with id ${taskId}` };
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
