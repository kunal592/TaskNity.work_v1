
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-hot-toast';
import { CalendarPlus } from 'lucide-react';
import { Leave } from '@/types';

export default function LeaveRequestButton() {
  const { currentUser, leaves, setLeaves, roleAccess, createLeave } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  if (roleAccess.canManageTeam) return null;

  const handleSubmit = async () => {
    if (!reason || !date) {
      toast.error('Please provide a reason and date.');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to request leave.');
      return;
    }

    setIsLoading(true);
    try {
      const newLeave = await createLeave({
        reason,
        date,
      });

      setLeaves([...leaves, newLeave]);
      toast.success('Leave request submitted!');
      setIsOpen(false);
      setReason('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
            <CalendarPlus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Leave of Absence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Reason for your leave..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Request'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
