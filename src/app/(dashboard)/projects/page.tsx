
"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "react-hot-toast";
import { PlusCircle, Send, CheckCircle } from "lucide-react";
import type { Project, Task, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from "@/components/ui/textarea";
import MultiAssign from '@/components/tasks/MultiAssign';
import { Badge } from "@/components/ui/badge";

const initialNewTaskState = {
  title: '',
  description: '',
  priority: 'Medium' as Task['priority'],
  assignedTo: [] as string[],
  deadline: undefined as Date | undefined,
  classified: false,
};

export default function ProjectsPage() {
  const { projects, setProjects, tasks, setTasks, users, roleAccess } = useApp();
  const [newProjectName, setNewProjectName] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<string | null>(null);
  const [newTask, setNewTask] = useState(initialNewTaskState);
  const [search, setSearch] = useState("");

  if (!roleAccess.canManageProjects) {
    return <p className="p-6 text-red-500">You don't have access to manage projects.</p>;
  }

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name cannot be empty.");
      return;
    }
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: newProjectName,
      progress: 0,
      members: [],
      isPublic: true,
    };
    setProjects([newProject, ...projects]);
    setNewProjectName("");
    toast.success(`Project "${newProjectName}" created.`);
  };

  const handleTogglePublic = (projectId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, isPublic: !p.isPublic } : p
      )
    );
  };

  const handleCompleteProject = (projectId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        toast.success(`Project "${p.title}" marked as complete!`);
        return { ...p, progress: 100 };
      }
      return p;
    }));
  };

  const handleAddTask = (projectId: string) => {
    if (!newTask.title || !newTask.title.trim()) {
        toast.error("Task title cannot be empty.");
        return;
    }
    const newTaskData: Task = {
        id: `task-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        status: "To Do",
        priority: newTask.priority,
        projectId: projectId,
        assignedTo: newTask.assignedTo,
        deadline: newTask.deadline?.toISOString().split('T')[0],
        classified: newTask.classified,
        isDraft: true,
    };
    setTasks([...tasks, newTaskData]);
    setNewTask(initialNewTaskState);
    setIsTaskDialogOpen(null);
    toast.success("Draft task created.");
  }
  
  const handlePublishTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {...t, isDraft: false} : t));
    toast.success("Task published to Kanban board!");
  }
  
  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Projects Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Enter new project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button onClick={handleAddProject}>
            <PlusCircle className="mr-2" /> Add Project
          </Button>
        </CardContent>
      </Card>
      
      <Input 
        placeholder="Search projects..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Accordion type="multiple" className="space-y-4">
        {filteredProjects.map((project) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id && t.isDraft);
            return (
          <AccordionItem key={project.id} value={project.id} className={cn("border rounded-lg bg-card", project.progress === 100 && "border-green-500 bg-green-500/10")}>
            <div className="flex justify-between items-center p-4">
              <AccordionTrigger className="p-0 hover:no-underline flex-grow">
                  <span className={cn("font-semibold text-lg", project.progress === 100 && "text-green-600")}>{project.title}</span>
              </AccordionTrigger>
              <div className="flex items-center gap-4 pl-4">
                {project.progress === 100 ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleCompleteProject(project.id)}>
                    <CheckCircle className="mr-2 h-4 w-4"/> Mark as Complete
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`public-switch-${project.id}`}>{project.isPublic ? "Public" : "Private"}</Label>
                  <Switch
                    id={`public-switch-${project.id}`}
                    checked={project.isPublic}
                    onCheckedChange={() => handleTogglePublic(project.id)}
                  />
                </div>
              </div>
            </div>
            <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                    <h4 className="font-semibold">Draft Tasks</h4>
                    {projectTasks.length > 0 ? (
                        <ul className="space-y-2">
                           {projectTasks.map(task => (
                             <li key={task.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                               <span>{task.title}</span>
                               <Button size="sm" variant="ghost" onClick={() => handlePublishTask(task.id)}>
                                 <Send className="mr-2 h-4 w-4" /> Publish
                               </Button>
                             </li>
                           ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No draft tasks for this project.</p>}
                    <div className="pt-4 border-t">
                      <Dialog open={isTaskDialogOpen === project.id} onOpenChange={(isOpen) => isOpen ? setIsTaskDialogOpen(project.id) : setIsTaskDialogOpen(null)}>
                        <DialogTrigger asChild>
                          <Button>
                            <PlusCircle className="mr-2" /> Add Draft Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Draft Task for "{project.title}"</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="Task Title"
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                            <Textarea
                              placeholder="Task Description"
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Select
                                value={newTask.priority}
                                onValueChange={(v: Task['priority']) => setNewTask({ ...newTask, priority: v })}
                              >
                                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !newTask.deadline && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newTask.deadline ? format(newTask.deadline, "PPP") : <span>Pick a deadline</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={newTask.deadline} onSelect={(date) => setNewTask({...newTask, deadline: date})} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <MultiAssign
                                users={users}
                                selectedUsers={newTask.assignedTo}
                                onSelectedUsersChange={(userIds) => setNewTask({ ...newTask, assignedTo: userIds })}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id={`classified-switch-${project.id}`} 
                                checked={newTask.classified}
                                onCheckedChange={(checked) => setNewTask({ ...newTask, classified: checked })}
                              />
                              <Label htmlFor={`classified-switch-${project.id}`} className="text-red-600 font-medium">Mark as Classified</Label>
                            </div>

                            <Button onClick={() => handleAddTask(project.id)} className="w-full">Create Draft Task</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                </div>
            </AccordionContent>
          </AccordionItem>
        )})}
      </Accordion>
    </div>
  );
}
