import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LucideTicket,
  LucideRefreshCw,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideAlertCircle,
  LucideCheckCircle,
  LucideFileText,
  LucidePencil,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRouter } from "next/navigation";
import { TICKET_STATUS_LABELS } from "@/features/ticket/constants";

export function DashboardTicketSummary() {
  const { data, isLoading, isError, refreshData } = useDashboardStats();
  const router = useRouter();

  // Loading state with skeleton UI
  if (isLoading && !data) {
    return (
      <Card className="shadow-sm border-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="shadow-sm border-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <LucideAlertCircle className="h-5 w-5 text-destructive" />
            Error Loading Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load ticket statistics. Please try again.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refreshData()}
          >
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Null safety check - provide default values if data is not available
  const ticketStats = data?.stats?.tickets || {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    trend: { value: "+0%", up: true },
  };

  const distribution = data?.stats?.distribution || {
    open: 0,
    inProgress: 0,
    completed: 0,
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleViewTickets = (status?: string) => {
    if (status) {
      router.push(`/tickets?status=${status}`);
    } else {
      router.push("/tickets");
    }
  };

  return (
    <Card className="shadow-sm border-muted/30 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <LucideTicket className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Resumo do Suporte</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <LucideRefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Total tickets with trend */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-3xl font-bold">{ticketStats.total}</p>
            <p className="text-sm text-muted-foreground">Total Tickets</p>
          </div>
          <Badge
            variant={ticketStats.trend.up ? "default" : "secondary"}
            className={
              ticketStats.trend.up
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          >
            {ticketStats.trend.up ? (
              <LucideArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <LucideArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {ticketStats.trend.value}
          </Badge>
        </div>

        {/* Status breakdown */}
        <div className="space-y-4">
          <StatusItem
            icon={<LucideFileText className="h-4 w-4" />}
            label={TICKET_STATUS_LABELS.ABERTO}
            count={ticketStats.open}
            percentage={distribution.open}
            color="blue"
            onClick={() => handleViewTickets("ABERTO")}
          />

          <StatusItem
            icon={<LucidePencil className="h-4 w-4" />}
            label={TICKET_STATUS_LABELS.EM_ANDAMENTO}
            count={ticketStats.inProgress}
            percentage={distribution.inProgress}
            color="amber"
            onClick={() => handleViewTickets("EM_ANDAMENTO")}
          />

          <StatusItem
            icon={<LucideCheckCircle className="h-4 w-4" />}
            label={TICKET_STATUS_LABELS.CONCLUÍDO}
            count={ticketStats.completed}
            percentage={distribution.completed}
            color="green"
            onClick={() => handleViewTickets("CONCLUÍDO")}
          />
        </div>

        {/* View all button */}
        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={() => handleViewTickets()}
        >
          Ver todos os tickets
          <LucideArrowUpRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  percentage: number;
  color: "blue" | "amber" | "green";
  onClick: () => void;
}

function StatusItem({
  icon,
  label,
  count,
  percentage,
  color,
  onClick,
}: StatusItemProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      progress: "bg-blue-500",
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      progress: "bg-amber-500",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      progress: "bg-green-500",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className="space-y-2 cursor-pointer group" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${classes.bg} ${classes.text}`}>
            {icon}
          </div>
          <span className="text-sm font-medium group-hover:text-primary transition-colors">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{count}</span>
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        </div>
      </div>
      <Progress
        value={percentage}
        className="h-2"
      />
    </div>
  );
}
