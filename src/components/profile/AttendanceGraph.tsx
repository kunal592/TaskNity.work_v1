"use client";
import { useMemo } from 'react';
import { Attendance } from '@/types';
import { format, subDays, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AttendanceGraphProps {
  attendance: Attendance[];
}

const getStatusColor = (status: Attendance['status'] | undefined) => {
  if (!status) return 'bg-muted/50';
  switch (status) {
    case 'Present':
    case 'Remote':
      return 'bg-green-500';
    case 'Absent':
      return 'bg-red-500';
    default:
      return 'bg-muted/50';
  }
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AttendanceGraph({ attendance }: AttendanceGraphProps) {
  const { days, yearStart, yearEnd } = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 364);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const attendanceMap = new Map<string, Attendance['status']>();
    attendance.forEach(log => {
      attendanceMap.set(format(new Date(log.date), 'yyyy-MM-dd'), log.status);
    });

    const paddedDaysCount = (7 - getDay(startDate)) % 7;
    const paddedDays = Array(paddedDaysCount).fill(null);

    const dayData = [...paddedDays, ...days].map((day, index) => {
      if (!day) return { date: `pad-${index}`, status: undefined };
      const dateString = format(day, 'yyyy-MM-dd');
      return {
        date: dateString,
        status: attendanceMap.get(dateString),
      };
    });

    return { days: dayData, yearStart: startDate, yearEnd: endDate };
  }, [attendance]);
  
  const getMonthLabel = (weekIndex: number) => {
    const firstDayOfWeek = new Date(yearStart);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() + weekIndex * 7);
    const currentMonth = firstDayOfWeek.getMonth();
    
    // Only show month label if it's the start of a new month
    if (weekIndex === 0 || firstDayOfWeek.getDate() <= 7) {
        return monthLabels[currentMonth];
    }
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Activity (Last Year)</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="flex justify-start overflow-x-auto">
                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2">
                        {weekDays.map(day => <div key={day} className="h-3 leading-3">{day}</div>)}
                    </div>
                    <div className="grid grid-flow-col grid-rows-7 gap-1 relative">
                        {/* Month labels */}
                         <div className="absolute -top-5 left-0 flex" style={{ width: `${(days.length/7) * 16}px`}}>
                            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
                                <div key={weekIndex} className="w-4 text-xs text-muted-foreground">
                                    {getMonthLabel(weekIndex)}
                                </div>
                            ))}
                        </div>

                        {/* Day blocks */}
                        {days.map((day) => (
                           <Tooltip key={day.date}>
                                <TooltipTrigger>
                                <div className={cn(
                                    "h-3 w-3 rounded-sm",
                                    day.status !== undefined ? getStatusColor(day.status) : 'bg-gray-200 dark:bg-gray-800'
                                )} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{day.status || 'No record'} on {day.date}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}