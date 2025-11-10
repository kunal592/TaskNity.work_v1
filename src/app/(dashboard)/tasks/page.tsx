
"use client";

import { useState, useId } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useApp } from '@/context/AppContext';
import { Task, User, Project } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultiAssign from '@/components/tasks/MultiAssign';
import toast from 'react-hot-toast';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskCard from '@/components/kanban/TaskCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import Leaderboard from '@/components/kanban/Leaderboard';
import TaskDetailsModal from '@/components/kanban/TaskDetailsModal';
import UserProfileModal from '@/components/profile/UserProfileModal';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const columns = ['To Do', 'In Progress', 'Done'] as const;
type Status = (typeof columns)[number];

const initialNewTaskState = {
  title: '',
  description: '',
  priority: 'Medium' as Task['priority'],
  projectId: '',
  assignedTo: [] as string[],
  deadline: undefined as Date | undefined,
  classified: false,
};

export default function TasksPage() {
  const { tasks, setTasks, projects, setProjects, users, roleAccess } = useApp();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState(initialNewTaskState);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [profileUser, setProfileUser] = useState<number | null>(null);

  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );
  
  const tasksById = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, Task>);

  const publicTasks = tasks.filter(task => !task.classified && !task.isDraft);


  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId === overId) return;
  
    const isActiveTask = active.data.current?.type === 'Task';
    if (!isActiveTask) return;
  
    setTasks(currentTasks => {
      const activeIndex = currentTasks.findIndex(t => t.id === activeId);
      const overIndex = currentTasks.findIndex(t => t.id === overId);
  
      if (overIndex !== -1) {
        // Dragging over another task
        const activeTask = currentTasks[activeIndex];
        const overTask = currentTasks[overIndex];
        if (activeTask && overTask && activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;
          return arrayMove(currentTasks, activeIndex, overIndex);
        }
        return arrayMove(currentTasks, activeIndex, overIndex);
      }
      
      // Dragging over a column
      const isOverColumn = over.data.current?.type === 'Column';
      if(isOverColumn) {
        const activeTask = currentTasks[activeIndex];
        if(activeTask) {
           activeTask.status = over.id as Status;
           return [...currentTasks];
        }
      }

      return currentTasks;
    });
  };
  

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
  
    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
  
    if (isActiveTask && isOverColumn) {
      setTasks(currentTasks => {
        const activeIndex = currentTasks.findIndex(t => t.id === active.id);
        if (currentTasks[activeIndex].status !== over.id) {
          currentTasks[activeIndex].status = over.id as Status;
          return [...currentTasks];
        }
        return currentTasks;
      });
    }
  };
  
  const handleCreateProject = () => {
    if(!newProjectTitle) return toast.error("Project title cannot be empty");
    const newProjectId = `proj-${Date.now()}`;
    const newProject: Project = {
        id: newProjectId,
        title: newProjectTitle,
        progress: 0,
        members: users.filter(u => newTask.assignedTo.includes(u.id))
    }
    setProjects([...projects, newProject]);
    setNewTask({...newTask, projectId: newProjectId});
    setNewProjectTitle("");
    toast.success(`Project "${newProjectTitle}" created!`);
  }

  const handleAddTask = () => {
    if (
      !newTask.title ||
      !newTask.projectId ||
      newTask.assignedTo.length === 0
    ) {
      toast.error('Please fill all fields and assign the task.');
      return;
    }
    const newTaskData: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      projectId: newTask.projectId,
      assignedTo: newTask.assignedTo,
      status: 'To Do',
      deadline: newTask.deadline?.toISOString().split('T')[0],
      classified: newTask.classified,
      isDraft: false,
    };
    setTasks([newTaskData, ...tasks]);
    toast.success('Task created successfully!');
    setNewTask(initialNewTaskState);
    setIsTaskDialogOpen(false);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  }

  const handleUserClick = (userId: string) => {
    const numericId = parseInt(userId.split('-')[1]);
    if (!isNaN(numericId)) {
      setProfileUser(numericId);
    }
  };

  return (
    <div className="flex gap-6">
      {profileUser !== null && (
        <UserProfileModal
          open={profileUser !== null}
          onClose={() => setProfileUser(null)}
          userId={profileUser}
        />
      )}
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Kanban Board</h2>
          {roleAccess.canManageProjects && (
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Task</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create a New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Task Description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={newTask.priority}
                      onValueChange={(v: Task['priority']) =>
                        setNewTask({ ...newTask, priority: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newTask.deadline && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTask.deadline ? format(newTask.deadline, "PPP") : <span>Pick a deadline</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newTask.deadline}
                            onSelect={(date) => setNewTask({...newTask, deadline: date})}
                            initialFocus
                          />
                        </PopoverContent>
                    </Popover>

                  </div>

                  <div>
                    <Label>Project</Label>
                    <div className="flex gap-2">
                      <Select
                          value={newTask.projectId}
                          onValueChange={(v) =>
                          setNewTask({ ...newTask, projectId: v })
                          }
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Select Project" />
                          </SelectTrigger>
                          <SelectContent>
                          {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                              {p.title}
                              </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      <Popover>
                          <PopoverTrigger asChild><Button variant="outline">New</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-4 space-y-2">
                              <Input placeholder="New project title" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} />
                              <Button onClick={handleCreateProject} className='w-full'>Create Project</Button>
                          </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <MultiAssign
                      users={users}
                      selectedUsers={newTask.assignedTo}
                      onSelectedUsersChange={(userIds) =>
                        setNewTask({ ...newTask, assignedTo: userIds })
                      }
                    />
                  </div>
                  {roleAccess.canManageProjects && (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="classified-switch" 
                        checked={newTask.classified}
                        onCheckedChange={(checked) => setNewTask({ ...newTask, classified: checked })}
                      />
                      <Label htmlFor="classified-switch" className="text-red-600 font-medium">
                        Mark as Classified
                      </Label>
                    </div>
                  )}

                  <Button onClick={handleAddTask} className="w-full">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          id={dndId}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <SortableContext items={columns.map(c => c)}>
              {columns.map((col) => (
                <KanbanColumn
                  key={col}
                  id={col}
                  title={col}
                  tasks={publicTasks.filter((t) => t.status === col)}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </SortableContext>
          </div>
          <DragOverlay>
              {activeTask && (
                  <TaskCard task={activeTask} users={users} onClick={() => {}}/>
              )}
          </DragOverlay>
        </DndContext>
      </div>
      <div className="w-64 flex-shrink-0">
          <Leaderboard users={users} tasks={tasks} onUserClick={handleUserClick} />
      </div>
       {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
