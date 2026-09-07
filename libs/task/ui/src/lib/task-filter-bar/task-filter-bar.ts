import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { TaskSortOrder, TaskStatus } from '@claude-actions/task/domain';

const SORT_ORDER_LABEL: Readonly<Record<TaskSortOrder, string>> = {
  newest: 'newest first',
  oldest: 'oldest first',
};

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
  readonly selectedTag = input<string | null>(null);
  readonly sortOrder = input<TaskSortOrder>('newest');

  readonly searchChange = output<string>();
  readonly selectedStatusChange = output<TaskStatus | null>();
  readonly selectedTagChange = output<string | null>();
  readonly sortOrderChange = output<TaskSortOrder>();

  readonly sortOrderLabel = computed(() => SORT_ORDER_LABEL[this.sortOrder()]);

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchChange.emit(input.value);
  }

  onSortOrderToggle(): void {
    this.sortOrderChange.emit(
      this.sortOrder() === 'newest' ? 'oldest' : 'newest',
    );
  }
}
