"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NoticeStats({ stats }: { stats: any }) {
  const { total, responded, pending, global } = stats;

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat label="Total Notices" value={total} />
      <Stat label="Responded" value={responded} />
      <Stat label="Pending" value={pending} />
      <Stat label="Global Notices" value={global} />
    </div>
  );
}
