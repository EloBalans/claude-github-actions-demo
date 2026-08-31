import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TASK_STATUSES } from '@claude-actions/task/domain';
import { TaskListStore } from '@claude-actions/task/application-web';
import { TaskFilterBar, TaskItem, TaskStatsBar } from '@claude-actions/task/ui';

@Component({
  selector: 'task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskFilterBar, TaskItem, TaskStatsBar],
  providers: [TaskListStore],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  protected readonly store = inject(TaskListStore);
  protected readonly statuses = TASK_STATUSES;
}
