import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock, Award, TrendingUp, PieChart, BarChart3, Globe } from "lucide-react";
import type { Application, Requirement, Task } from "@/types/applicationTypes";
import { getStatusLabel, getStatusColor, getDaysUntilDeadline, formatDeadline, getCountryFlag } from "@/utils/applicationUtils";
import { format } from "date-fns";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EnhancedDashboardProps {
  applications: Application[];
  requirements: Requirement[];
  tasks: Task[];
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--chart-2))",
  accent: "hsl(var(--chart-3))",
  muted: "hsl(var(--muted))",
};

export const EnhancedDashboard = ({ applications, requirements, tasks }: EnhancedDashboardProps) => {
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

  // Country distribution
  const countryData = [
    { name: "🇺🇸 US", value: applications.filter(a => a.country === "US").length },
    { name: "🇬🇧 UK", value: applications.filter(a => a.country === "UK").length },
    { name: "🇨🇦 Canada", value: applications.filter(a => a.country === "CA").length },
    { name: "🇮🇳 India", value: applications.filter(a => a.country === "IN").length },
  ].filter(d => d.value > 0);

  // Status distribution
  const statusData = [
    { status: "Draft", count: applications.filter(a => a.currentStatus === "DRAFT").length, color: COLORS.muted },
    { status: "Submitted", count: applications.filter(a => ["SUBMITTED", "PAYMENT_CONFIRMED"].includes(a.currentStatus)).length, color: COLORS.secondary },
    { status: "In Review", count: applications.filter(a => ["UNDER_REVIEW", "AWAITING_DOCS"].includes(a.currentStatus)).length, color: COLORS.primary },
    { status: "Shortlisted", count: applications.filter(a => ["SHORTLISTED", "COUNSELING_ROUND_1", "COUNSELING_ROUND_2"].includes(a.currentStatus)).length, color: COLORS.accent },
    { status: "Offers", count: applications.filter(a => ["OFFER", "ACCEPTED"].includes(a.currentStatus)).length, color: "hsl(147, 99%, 29%)" },
  ].filter(d => d.count > 0);

  const nearestDeadlines = applications
    .filter(app => getDaysUntilDeadline(app.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentOffers = applications
    .filter(app => ["OFFER", "ACCEPTED"].includes(app.currentStatus))
    .slice(0, 3);

  const pendingTasks = tasks.filter(t => t.status !== "DONE").slice(0, 5);

  const completionRate = requirements.length > 0 
    ? Math.round((requirements.filter(r => r.status === "UPLOADED").length / requirements.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {applications.length} total
            </p>
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(activeApplications / applications.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within 30 days
            </p>
            {upcomingDeadlines > 5 && (
              <Badge variant="outline" className="mt-2 text-xs">
                Requires attention
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {missingDocuments} documents pending
            </p>
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{offers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {offers > 0 ? "Congratulations! 🎉" : "Keep going!"}
            </p>
            {offers > 0 && (
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                View Offers
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Charts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Applications by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
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
                    <div key={app.id} className="flex items-start gap-3 glass p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="text-xl mt-1">{getCountryFlag(app.country)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.university}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.course}</p>
                        <div className="flex items-center gap-2 mt-2">
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

        {/* Offers & Pending Tasks */}
        <div className="space-y-6">
          {recentOffers.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recent Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOffers.map((app) => (
                    <div key={app.id} className="glass p-3 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{app.university}</p>
                          <p className="text-xs text-muted-foreground">{app.course}</p>
                          {app.scholarshipNote && (
                            <p className="text-xs text-primary mt-1">{app.scholarshipNote}</p>
                          )}
                        </div>
                        <span className="text-xl">{getCountryFlag(app.country)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
                ) : (
                  pendingTasks.map((task) => {
                    const app = applications.find(a => a.id === task.applicationId);
                    return (
                      <div key={task.id} className="flex items-start gap-3 glass p-3 rounded-lg">
                        <div className={`h-2 w-2 rounded-full mt-2 ${task.status === "DOING" ? "bg-primary animate-pulse" : "bg-muted"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{app?.university}</p>
                          {task.dueOn && (
                            <p className="text-xs text-primary mt-1">
                              Due: {format(new Date(task.dueOn), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
