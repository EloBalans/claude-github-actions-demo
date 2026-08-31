import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { TaskStatus } from '@claude-actions/task/domain';

@Component({
  selector: 'task-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './task-filter-bar.html',
  styleUrl: './task-filter-bar.scss',
})
export class TaskFilterBar {
  readonly statuses = input.required<readonly TaskStatus[]>();
  readonly search = input('');
  readonly selectedStatus = input<TaskStatus | null>(null);

  readonly searchChange = output<string>();
  readonly selectedStatusChange = output<TaskStatus | null>();

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchChange.emit(input.value);
  }
}
