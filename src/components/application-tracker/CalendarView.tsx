import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { Application, Task } from "@/types/applicationTypes";
import { getCountryFlag, getStatusColor, getStatusLabel } from "@/utils/applicationUtils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

interface CalendarViewProps {
  applications: Application[];
  tasks: Task[];
}

interface CalendarEvent {
  date: Date;
  type: "deadline" | "interview" | "task";
  title: string;
  subtitle: string;
  application?: Application;
  task?: Task;
}

export const CalendarView = ({ applications, tasks }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Create events from applications and tasks
  const events: CalendarEvent[] = [
    ...applications.map(app => ({
      date: new Date(app.deadline),
      type: "deadline" as const,
      title: app.university,
      subtitle: `Deadline: ${app.course}`,
      application: app,
    })),
    ...tasks.filter(t => t.dueOn && t.status !== "DONE").map(task => {
      const app = applications.find(a => a.id === task.applicationId);
      return {
        date: new Date(task.dueOn!),
        type: "task" as const,
        title: task.title,
        subtitle: app?.university || "",
        task,
        application: app,
      };
    }),
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const upcomingEvents = events
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold mb-2">Calendar & Tasks</h1>
        <p className="text-muted-foreground">All your deadlines and tasks in one place</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="glass"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="glass"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="glass"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 glass rounded-lg border transition-all ${
                      isCurrentMonth ? "border-border" : "border-transparent opacity-50"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={i}
                          className={`text-xs p-1 rounded truncate ${
                            event.type === "deadline"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary-foreground"
                          }`}
                          title={`${event.title} - ${event.subtitle}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event, index) => (
                  <div key={index} className="glass p-3 rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>
                      </div>
                      {event.application && (
                        <span className="text-lg">{getCountryFlag(event.application.country)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          event.type === "deadline" ? "border-primary/50" : "border-secondary/50"
                        }`}
                      >
                        {format(event.date, "MMM d, yyyy")}
                      </Badge>
                      {event.application && (
                        <Badge className={`text-xs ${getStatusColor(event.application.currentStatus)}`}>
                          {getStatusLabel(event.application.currentStatus)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Legend */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span className="text-sm text-muted-foreground">Application Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary/20" />
              <span className="text-sm text-muted-foreground">Tasks Due</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
