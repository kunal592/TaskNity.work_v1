
'use client';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function LeaveStatusPage() {
  const { users, attendance, leaves, setLeaves, roleAccess } = useApp();

  if (!roleAccess.canManageTeam) {
    return <p className="p-6 text-red-500">You don't have access to view this page.</p>;
  }
  
  const today = new Date().toISOString().split('T')[0];

  const handleLeaveStatus = (leaveId: string, status: 'Approved' | 'Rejected') => {
    setLeaves(
      leaves.map(leave => {
        if (leave.id === leaveId) {
          toast.success(`Leave request ${status.toLowerCase()}.`);
          return { ...leave, status };
        }
        return leave;
      })
    );
  };
  
  const getStatusBadge = (status: 'Present' | 'Absent' | 'Remote' | 'On Leave' | undefined) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-500">Present</Badge>;
      case 'Remote':
        return <Badge className="bg-blue-500">Remote</Badge>;
      case 'On Leave':
        return <Badge variant="destructive">On Leave</Badge>;
       case 'Absent':
        return <Badge variant="secondary" className="bg-yellow-500">Absent</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Today's Attendance & Leave Status</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-4 text-left">Member</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Leave Reason</th>
                  <th className="p-4 text-left">Leave Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const userAttendance = attendance.find(a => a.userId === user.id && a.date === today);
                  const userLeave = leaves.find(l => l.userId === user.id && l.date === today);

                  return (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(userAttendance?.status)}</td>
                      <td className="p-4 text-muted-foreground">{userLeave?.reason || '—'}</td>
                      <td className="p-4">
                        {userLeave ? (
                          <Badge variant={
                            userLeave.status === 'Approved' ? 'default' : 
                            userLeave.status === 'Rejected' ? 'destructive' : 'secondary'
                          } className={userLeave.status === 'Approved' ? 'bg-green-600' : ''}>
                            {userLeave.status}
                          </Badge>
                        ) : '—'}
                      </td>
                       <td className="p-4">
                        {userLeave && userLeave.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleLeaveStatus(userLeave.id, 'Approved')}>
                              <Check size={16} />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleLeaveStatus(userLeave.id, 'Rejected')}>
                              <X size={16} />
                            </Button>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
