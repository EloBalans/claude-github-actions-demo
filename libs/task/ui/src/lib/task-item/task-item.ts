import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Task } from '@claude-actions/task/domain';

@Component({
  selector: 'task-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
  host: { '[attr.data-status]': 'task().status' },
})
export class TaskItem {
  readonly task = input.required<Task>();

  readonly advance = output<void>();
  readonly remove = output<void>();
  readonly tagSelect = output<string>();
}
