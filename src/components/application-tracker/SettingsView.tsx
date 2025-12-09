import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, User, Clock, Globe } from "lucide-react";
import type { Student } from "@/types/applicationTypes";

interface SettingsViewProps {
  student: Student;
}

export const SettingsView = ({ student }: SettingsViewProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>


      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
            <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between glass p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="deadline-reminders" className="text-sm font-medium">
                Deadline Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified 7, 3, and 1 day before deadlines
              </p>
            </div>
            <Switch id="deadline-reminders" defaultChecked />
          </div>

          <div className="flex items-center justify-between glass p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="status-updates" className="text-sm font-medium">
                Status Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Notifications when application status changes
              </p>
            </div>
            <Switch id="status-updates" defaultChecked />
          </div>

          <div className="flex items-center justify-between glass p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="document-reminders" className="text-sm font-medium">
                Document Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Reminders for pending document uploads
              </p>
            </div>
            <Switch id="document-reminders" defaultChecked />
          </div>

          <div className="flex items-center justify-between glass p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-summary" className="text-sm font-medium">
                Weekly Summary
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive a weekly summary of your applications
              </p>
            </div>
            <Switch id="weekly-summary" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            App Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This is a demo application tracker showcasing realistic application flows for US, UK, Canada, and India.
              All data is stored locally and no actual applications are submitted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
