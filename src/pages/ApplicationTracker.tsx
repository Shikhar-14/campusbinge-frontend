import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, List, CheckSquare, FolderOpen, Settings, Calendar, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedDashboard } from "@/components/application-tracker/EnhancedDashboard";
import { ApplicationsList } from "@/components/application-tracker/ApplicationsList";
import { ApplicationDetail } from "@/components/application-tracker/ApplicationDetail";
import { DocumentsView } from "@/components/application-tracker/DocumentsView";
import { SettingsView } from "@/components/application-tracker/SettingsView";
import { CalendarView } from "@/components/application-tracker/CalendarView";
import { ApplyDirectView } from "@/components/application-tracker/ApplyDirectView";
import { ShortlistView } from "@/components/application-tracker/ShortlistView";
import { useApplications, useRequirements, useTasks, useEvents, useDocuments } from "@/hooks/useApplications";
import type { Application } from "@/types/applicationTypes";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ApplicationTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch data from database
  const { data: applications = [], isLoading: isLoadingApps, refetch: refetchApplications } = useApplications();
  const { data: requirements = [], isLoading: isLoadingReqs } = useRequirements();
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks();
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: documents = [], isLoading: isLoadingDocs } = useDocuments();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Check if we're coming from career cards
  useEffect(() => {
    if (location.state?.course) {
      setActiveTab("apply");
    }
  }, [location.state]);

  // Refetch applications when returning to dashboard/applications tabs
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "applications") {
      refetchApplications();
    }
  }, [activeTab, refetchApplications]);

  const handleSelectApplication = (app: Application) => {
    setSelectedApplication(app);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
    setActiveTab("applications");
  };

  const getApplicationRequirements = (appId: string) => {
    return requirements.filter(r => r.applicationId === appId);
  };

  const getApplicationEvents = (appId: string) => {
    return events.filter(e => e.applicationId === appId);
  };

  const getApplicationDocuments = (appId: string) => {
    return documents.filter(d => d.applicationId === appId);
  };

  // Show loading state
  if (isLoadingApps || isLoadingReqs || isLoadingTasks || isLoadingEvents || isLoadingDocs) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      {/* Gradient orbs for glassmorphism depth */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" style={{ animationDelay: "1s" }}></div>

      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {activeTab === "detail" && selectedApplication ? (
        <ApplicationDetail
          application={selectedApplication}
          requirements={getApplicationRequirements(selectedApplication.id)}
          events={getApplicationEvents(selectedApplication.id)}
          documents={getApplicationDocuments(selectedApplication.id)}
          onBack={handleBackToList}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="glass-card p-2 mb-6 overflow-x-auto">
            <TabsList className="w-full grid grid-cols-7 bg-transparent min-w-max">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="apply" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Apply Direct</span>
              </TabsTrigger>
              <TabsTrigger value="shortlist" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Shortlist</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">My Applications</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar & Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <EnhancedDashboard
              applications={applications}
              requirements={requirements}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="apply">
            <ApplyDirectView careerInfo={location.state} />
          </TabsContent>

          <TabsContent value="shortlist">
            <ShortlistView />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsList
              applications={applications}
              requirements={requirements}
              onSelectApplication={handleSelectApplication}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView applications={applications} tasks={tasks} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsView documents={documents} applications={applications} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsView student={{ id: "", name: "", email: "", timezone: "" }} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ApplicationTracker;
