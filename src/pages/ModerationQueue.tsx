import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useModeratorStatus } from "@/hooks/useModeratorStatus";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";

type Report = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
};

const ModerationQueue = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { isModerator, loading: modLoading } = useModeratorStatus();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!modLoading && !isModerator) {
      navigate("/forum");
      return;
    }
    if (isModerator) {
      fetchReports();
    }
  }, [isModerator, modLoading, activeTab, navigate]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("reports")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Report updated",
        description: `Report marked as ${status}`,
      });

      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const viewTarget = (report: Report) => {
    if (report.target_type === "post") {
      navigate(`/forum/post/${report.target_id}`);
    }
  };

  if (modLoading || !isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Moderation Queue</h1>
          <p className="text-muted-foreground">Review and manage reported content</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              <AlertCircle className="w-4 h-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              <Eye className="w-4 h-4 mr-2" />
              Reviewed
            </TabsTrigger>
            <TabsTrigger value="resolved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolved
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              <XCircle className="w-4 h-4 mr-2" />
              Dismissed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : reports.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No {activeTab} reports</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{report.target_type}</Badge>
                          <Badge>{report.reason}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => viewTarget(report)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>

                    {report.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Details:</p>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    )}

                    {activeTab === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateReportStatus(report.id, "reviewed")}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateReportStatus(report.id, "resolved")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, "dismissed")}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModerationQueue;
