
'use client';
import { useState } from 'react';
import useUsersData, { User } from '@/hooks/useUsersData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserProfileModal from '@/components/profile/UserProfileModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const initialNewUserState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'Member' as User['role'],
  team: 'Frontend',
  salary: '',
  github: '',
  linkedin: '',
  joined: new Date().toISOString().split("T")[0]
};

export default function TeamPage() {
  const { users, addUser, deleteUser } = useUsersData();
  const { roleAccess } = useApp();
  const [profileUser, setProfileUser] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState(initialNewUserState);

  if (!roleAccess.canManageTeam) {
    return <p className="p-6 text-red-500">You don't have access to manage the team.</p>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewUser(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof newUser, value: string) => {
    setNewUser(prev => ({ ...prev, [id]: value }));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.team) {
      toast.error('Please fill in all required fields (Name, Email, Role, Team).');
      return;
    }
    const userToAdd = {
        ...newUser,
        salary: parseFloat(newUser.salary) || 0
    };
    addUser(userToAdd);
    toast.success('User added successfully!');
    setIsAddUserOpen(false);
    setNewUser(initialNewUserState);
  };

  const handleTerminate = (userId: number) => {
    deleteUser(userId);
    toast.success('Employee terminated successfully!');
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {profileUser !== null && (
        <UserProfileModal
          open={profileUser !== null}
          onClose={() => setProfileUser(null)}
          userId={profileUser}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>Add New Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newUser.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={newUser.email} onChange={handleInputChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Cell No.</Label>
                <Input id="phone" type="tel" value={newUser.phone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary" className="text-right">Salary (₹)</Label>
                <Input id="salary" type="number" value={newUser.salary} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                 <Select value={newUser.role} onValueChange={(value: User['role']) => handleSelectChange('role', value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">Team</Label>
                 <Select value={newUser.team} onValueChange={(value) => handleSelectChange('team', value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Textarea id="address" value={newUser.address} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="github" className="text-right">GitHub</Label>
                <Input id="github" value={newUser.github} onChange={handleInputChange} className="col-span-3" placeholder="Optional" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkedin" className="text-right">LinkedIn</Label>
                <Input id="linkedin" value={newUser.linkedin} onChange={handleInputChange} className="col-span-3" placeholder="Optional" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Add Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left">Member</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Team</th>
                  <th className="p-3 text-left">Salary</th>
                  <th className="p-3 text-left">Joined</th>
                  <th className="p-3 text-left">Task Progress</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setProfileUser(user.id)}
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium hover:underline">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.team}</td>
                    <td className="p-3">₹{user.salary?.toLocaleString()}</td>
                    <td className="p-3">{user.joined}</td>
                    <td className="p-3">
                      {user.tasks.length > 0 ? (
                        `${user.tasks.filter(t => t.status === "completed").length}/${user.tasks.length} completed`
                      ) : (
                        "No tasks"
                      )}
                    </td>
                    <td className="p-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm" disabled={user.role === 'Admin'}>Terminate</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove {user.name} from the team.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleTerminate(user.id)}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
