import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TaskStats } from '@claude-actions/task/domain';

@Component({
  selector: 'task-stats-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './task-stats-bar.html',
  styleUrl: './task-stats-bar.scss',
})
export class TaskStatsBar {
  readonly stats = input.required<TaskStats>();
  readonly completion = input.required<string>();
  readonly loading = input(false);
  readonly boardTotal = input<number | null>(null);
}
