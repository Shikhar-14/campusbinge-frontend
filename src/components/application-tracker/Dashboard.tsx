import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock, Award, TrendingUp } from "lucide-react";
import type { Application, Requirement, Task } from "@/types/applicationTypes";
import { getStatusLabel, getStatusColor, getDaysUntilDeadline, formatDeadline } from "@/utils/applicationUtils";
import { format } from "date-fns";

interface DashboardProps {
  applications: Application[];
  requirements: Requirement[];
  tasks: Task[];
}

export const Dashboard = ({ applications, requirements, tasks }: DashboardProps) => {
  const activeApplications = applications.filter(
    app => !["DECLINED", "ENROLLED"].includes(app.currentStatus)
  ).length;

  const upcomingDeadlines = applications.filter(
    app => getDaysUntilDeadline(app.deadline) <= 30 && getDaysUntilDeadline(app.deadline) >= 0
  ).length;

  const missingDocuments = requirements.filter(
    req => req.isRequired && req.status !== "UPLOADED"
  ).length;

  const offers = applications.filter(
    app => ["OFFER", "ACCEPTED"].includes(app.currentStatus)
  ).length;

  const nearestDeadlines = applications
    .filter(app => getDaysUntilDeadline(app.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentActivity = applications
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  const pendingTasks = tasks.filter(t => t.status !== "DONE").slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {applications.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missingDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Required items pending
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Congratulations! 🎉
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline View */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearestDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              ) : (
                nearestDeadlines.map((app) => {
                  const days = getDaysUntilDeadline(app.deadline);
                  return (
                    <div key={app.id} className="flex items-start gap-3 glass p-3 rounded-lg">
                      <div className="mt-1">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.university}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.course}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(app.deadline), "MMM d, yyyy")}
                          </Badge>
                          <span className={`text-xs font-medium ${days <= 7 ? 'text-destructive' : 'text-primary'}`}>
                            {formatDeadline(app.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((app) => (
                <div key={app.id} className="flex items-center justify-between glass p-3 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{app.university}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.course}</p>
                  </div>
                  <Badge className={getStatusColor(app.currentStatus)}>
                    {getStatusLabel(app.currentStatus)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            ) : (
              pendingTasks.map((task) => {
                const app = applications.find(a => a.id === task.applicationId);
                return (
                  <div key={task.id} className="flex items-start gap-3 glass p-3 rounded-lg">
                    <div className="mt-1">
                      <div className={`h-2 w-2 rounded-full ${task.status === "DOING" ? "bg-primary animate-pulse" : "bg-muted"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{app?.university}</p>
                      {task.dueOn && (
                        <p className="text-xs text-primary mt-1">
                          Due: {format(new Date(task.dueOn), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">{task.bucket}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
