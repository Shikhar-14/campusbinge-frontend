import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, Application } from "@/types/applicationTypes";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

interface TasksViewProps {
  tasks: Task[];
  applications: Application[];
}

const bucketLabels: Record<string, string> = {
  ESSAY: "Essays & Personal Statements",
  TEST: "Standardized Tests",
  REC: "Recommendations",
  FINANCE: "Financial Aid & Scholarships",
  ADMIN: "Administrative Tasks",
};

const bucketColors: Record<string, string> = {
  ESSAY: "bg-primary/10 text-primary border-primary/20",
  TEST: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  REC: "bg-primary/20 text-primary border-primary/30",
  FINANCE: "bg-primary/30 text-primary border-primary/40",
  ADMIN: "bg-muted text-muted-foreground border-border",
};

export const TasksView = ({ tasks, applications }: TasksViewProps) => {
  const groupedTasks: Record<string, Task[]> = {
    ESSAY: [],
    TEST: [],
    REC: [],
    FINANCE: [],
    ADMIN: [],
  };

  tasks.forEach((task) => {
    if (groupedTasks[task.bucket]) {
      groupedTasks[task.bucket].push(task);
    }
  });

  const getTaskIcon = (status: string) => {
    if (status === "DONE") return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (status === "DOING") return <Clock className="h-5 w-5 text-primary animate-pulse" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getApplication = (appId: string) => applications.find(a => a.id === appId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold mb-2">Tasks & Documents</h1>
        <p className="text-muted-foreground">Manage all your application tasks in one place</p>
      </div>

      {Object.entries(groupedTasks).map(([bucket, bucketTasks]) => {
        if (bucketTasks.length === 0) return null;
        
        const completedCount = bucketTasks.filter(t => t.status === "DONE").length;
        const progress = (completedCount / bucketTasks.length) * 100;

        return (
          <Card key={bucket} className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bucketLabels[bucket]}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{bucketTasks.length} Complete
                </Badge>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bucketTasks.map((task) => {
                  const app = getApplication(task.applicationId);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                        task.status === "DONE" ? "opacity-60" : ""
                      } ${bucketColors[bucket]}`}
                    >
                      <div className="mt-0.5">
                        {getTaskIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through" : ""}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {app?.university} - {app?.course}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {task.status.toLowerCase()}
                          </Badge>
                        </div>
                        {task.dueOn && (
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Due: {format(new Date(task.dueOn), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {tasks.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No tasks to display</p>
            <p className="text-sm text-muted-foreground mt-2">All caught up! 🎉</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
