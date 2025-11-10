"use client";

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import type { Task, User } from '@/types';
import TaskCard from './TaskCard';
import { useApp } from '@/context/AppContext';

export interface Column {
  id: string;
  title: string;
}

interface Props {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ id, title, tasks, onTaskClick }: Props) {
  const { users } = useApp();
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { setNodeRef } = useSortable({
    id: id,
    data: {
      type: 'Column',
      column: { id, title },
    },
    disabled: true, 
  });


  return (
    <div
      ref={setNodeRef}
      className="bg-muted rounded-xl p-4 min-h-[500px] shadow-sm w-[350px] flex flex-col flex-shrink-0"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="bg-primary/10 text-primary font-bold text-sm px-2 py-1 rounded-full">
            {tasks.length}
        </span>
      </div>
      <div className="flex-grow space-y-3 overflow-y-auto pr-1">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} users={users} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
