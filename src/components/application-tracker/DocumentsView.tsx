import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Image as ImageIcon, User } from "lucide-react";
import type { Document, Application } from "@/types/applicationTypes";
import { format } from "date-fns";
import { useStudentProfile } from "@/hooks/useStudentProfile";

interface DocumentsViewProps {
  documents: Document[];
  applications: Application[];
}

export const DocumentsView = ({ documents, applications }: DocumentsViewProps) => {
  const { profile } = useStudentProfile();
  
  const getDocumentIcon = (kind: string) => {
    if (kind === "PDF") return <FileText className="h-8 w-8 text-primary" />;
    if (kind === "LINK") return <ExternalLink className="h-8 w-8 text-primary" />;
    return <ImageIcon className="h-8 w-8 text-primary" />;
  };

  const getApplication = (appId: string) => applications.find(a => a.id === appId);

  // Group documents by application
  const documentsByApp: Record<string, Document[]> = {};
  documents.forEach((doc) => {
    if (!documentsByApp[doc.applicationId]) {
      documentsByApp[doc.applicationId] = [];
    }
    documentsByApp[doc.applicationId].push(doc);
  });

  // Convert profile documents object to array
  const profileDocuments = profile?.documents 
    ? Object.entries(profile.documents)
        .filter(([_, doc]) => doc !== null)
        .map(([type, doc]) => ({ ...doc!, type }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold mb-2">Documents Vault</h1>
        <p className="text-muted-foreground">All your application documents in one secure place</p>
      </div>

      {/* Profile Documents */}
      {profileDocuments.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Documents
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Documents from your ONE-Profile</p>
              </div>
              <Badge variant="outline">{profileDocuments.length} documents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profileDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="glass p-4 rounded-lg hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                      {getDocumentIcon("PDF")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">{doc.type.replace(/_/g, ' ')}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Documents */}
      {Object.entries(documentsByApp).map(([appId, appDocs]) => {
        const app = getApplication(appId);
        if (!app) return null;

        return (
          <Card key={appId} className="glass-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{app.university}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{app.course}</p>
                </div>
                <Badge variant="outline">{appDocs.length} documents</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="glass p-4 rounded-lg hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        {getDocumentIcon(doc.kind)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{doc.kind}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {documents.length === 0 && profileDocuments.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your documents as you prepare your applications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
