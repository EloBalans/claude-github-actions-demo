import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  beAddTaskUrl,
  beChangeTaskStatusUrl,
  beDiscardTaskUrl,
  beListTasksUrl,
  beReadTaskStatsUrl,
  type AddTaskResponse,
  type ChangeTaskStatusRequestBody,
  type ChangeTaskStatusResponse,
  type DiscardTaskResponse,
  type EntityId,
  type ListTasksQueryParams,
  type ListTasksResponse,
  type ReadTaskStatsResponse,
} from '@claude-actions/task/contracts';
import {
  toAddTaskRequestBody,
  toTask,
  toTaskStats,
  type NewTask,
  type Task,
  type TaskQuery,
  type TaskStats,
  type TaskStatus,
} from '@claude-actions/task/domain';

@Injectable({ providedIn: 'root' })
export class TaskDataService {
  private readonly http = inject(HttpClient);

  list(query: TaskQuery): Observable<Task[]> {
    const queryParams: ListTasksQueryParams = {
      search: query.search,
      ...(query.status === null ? {} : { status: query.status }),
    };

    return this.http
      .get<ListTasksResponse>(beListTasksUrl, {
        params: toHttpParams(queryParams),
      })
      .pipe(map((documents) => documents.map(toTask)));
  }

  stats(): Observable<TaskStats> {
    return this.http
      .get<ReadTaskStatsResponse>(beReadTaskStatsUrl)
      .pipe(map(toTaskStats));
  }

  create(draft: NewTask): Observable<Task> {
    return this.http
      .post<AddTaskResponse>(beAddTaskUrl, toAddTaskRequestBody(draft))
      .pipe(map(toTask));
  }

  updateStatus(taskId: EntityId, status: TaskStatus): Observable<Task> {
    const body: ChangeTaskStatusRequestBody = { status };

    return this.http
      .patch<ChangeTaskStatusResponse>(beChangeTaskStatusUrl(taskId), body)
      .pipe(map(toTask));
  }

  remove(taskId: EntityId): Observable<DiscardTaskResponse> {
    return this.http.delete<DiscardTaskResponse>(beDiscardTaskUrl(taskId));
  }
}

function toHttpParams(
  queryParams: Record<string, string | undefined>,
): HttpParams {
  return Object.entries(queryParams).reduce(
    (params, [key, value]) =>
      value === undefined ? params : params.set(key, value),
    new HttpParams(),
  );
}
