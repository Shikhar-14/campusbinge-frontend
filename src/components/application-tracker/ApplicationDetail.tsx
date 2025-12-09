import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, DollarSign, FileText, MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Application, Requirement, Event, Document } from "@/types/applicationTypes";
import { getStatusLabel, getStatusColor, getPortalLabel, getCountryFlag, formatDeadline } from "@/utils/applicationUtils";
import { format } from "date-fns";

interface ApplicationDetailProps {
  application: Application;
  requirements: Requirement[];
  events: Event[];
  documents: Document[];
  onBack: () => void;
}

const statusFlow: Record<string, string[]> = {
  COMMON_APP: ["DRAFT", "SUBMITTED", "PAYMENT_CONFIRMED", "UNDER_REVIEW", "AWAITING_DOCS", "SHORTLISTED", "OFFER", "ACCEPTED", "VISA", "ENROLLED"],
  UCAS: ["DRAFT", "SUBMITTED", "PAYMENT_CONFIRMED", "UNDER_REVIEW", "OFFER", "ACCEPTED", "VISA", "ENROLLED"],
  OUAC: ["DRAFT", "SUBMITTED", "PAYMENT_CONFIRMED", "UNDER_REVIEW", "AWAITING_DOCS", "OFFER", "ACCEPTED", "ENROLLED"],
  CUET: ["DRAFT", "SUBMITTED", "COUNSELING_ROUND_1", "COUNSELING_ROUND_2", "SEAT_ALLOTMENT_PENDING", "ACCEPTED", "ENROLLED"],
  DIRECT: ["DRAFT", "SUBMITTED", "PAYMENT_CONFIRMED", "UNDER_REVIEW", "SHORTLISTED", "OFFER", "ACCEPTED", "ENROLLED"],
};

export const ApplicationDetail = ({ application, requirements, events, documents, onBack }: ApplicationDetailProps) => {
  const flow = statusFlow[application.portal] || statusFlow.DIRECT;
  const currentIndex = flow.indexOf(application.currentStatus);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / flow.length) * 100 : 0;

  const getRequirementIcon = (status: string) => {
    if (status === "UPLOADED") return <CheckCircle2 className="h-4 w-4 text-primary" />;
    if (status === "IN_PROGRESS") return <Clock className="h-4 w-4 text-primary animate-pulse" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const requiredReqs = requirements.filter(r => r.isRequired);
  const optionalReqs = requirements.filter(r => !r.isRequired);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>

      {/* Header Card */}
      <Card className="glass-card overflow-hidden">
        {application.image && (
          <div className="w-full h-48 overflow-hidden relative">
            <img src={application.image} alt={application.university} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{application.university}</h1>
                  <p className="text-white/90">{application.course}</p>
                </div>
                <span className="text-4xl">{getCountryFlag(application.country)}</span>
              </div>
            </div>
          </div>
        )}
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Portal</p>
              <Badge variant="outline">{getPortalLabel(application.portal)}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <Badge variant="outline">{application.level}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Term</p>
              <p className="text-sm font-medium">{application.term}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Application ID</p>
              <p className="text-sm font-mono font-medium">{application.appId}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Application Status</span>
              <Badge className={getStatusColor(application.currentStatus)}>
                {getStatusLabel(application.currentStatus)}
              </Badge>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex flex-wrap gap-2">
              {flow.map((status, index) => (
                <div
                  key={status}
                  className={`text-xs px-2 py-1 rounded ${
                    index <= currentIndex
                      ? "bg-primary/20 text-primary font-medium"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStatusLabel(status as any)}
                </div>
              ))}
            </div>
          </div>

          {application.scholarshipNote && (
            <div className="mt-4 p-3 glass rounded-lg">
              <p className="text-sm text-muted-foreground">{application.scholarshipNote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="glass w-full justify-start overflow-x-auto">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredReqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No required documents</p>
              ) : (
                requiredReqs.map((req) => (
                  <div key={req.id} className="flex items-start gap-3 glass p-3 rounded-lg">
                    {getRequirementIcon(req.status)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{req.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{req.type.replace("_", " ")}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {req.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {req.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{req.notes}</p>
                      )}
                      {req.dueOn && (
                        <p className="text-xs text-primary mt-1">Due: {format(new Date(req.dueOn), "MMM d, yyyy")}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {optionalReqs.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Optional Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {optionalReqs.map((req) => (
                  <div key={req.id} className="flex items-start gap-3 glass p-3 rounded-lg">
                    {getRequirementIcon(req.status)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{req.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{req.type.replace("_", " ")}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {req.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {req.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{req.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fees">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Fee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Application Fee</span>
                  <span className="text-lg font-bold">${application.feeAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  {application.feePaid ? (
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Deadline</p>
                <p className="text-sm font-medium">{format(new Date(application.deadline), "MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDeadline(application.deadline)}</p>
              </div>

              {application.decision && (
                <div className="glass p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Decision</p>
                  <p className="text-sm font-medium">{application.decision}</p>
                  {application.decisionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Received: {format(new Date(application.decisionDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                ) : (
                  events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        {index < events.length - 1 && (
                          <div className="absolute top-4 left-1 w-px h-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 glass p-3 rounded-lg">
                        <p className="text-sm font-medium">{event.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between glass p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{doc.kind}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
