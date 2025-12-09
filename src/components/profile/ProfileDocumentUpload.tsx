import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image as ImageIcon, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface ProfileDocumentUploadProps {
  documents: ProfileDocument[];
  onDocumentsChange: (documents: ProfileDocument[]) => void;
}

export const ProfileDocumentUpload = ({ documents, onDocumentsChange }: ProfileDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("photo");
  const { toast } = useToast();

  const documentTypes = [
    { value: "photo", label: "Passport Photo" },
    { value: "signature", label: "Signature" },
    { value: "tenth_certificate", label: "10th Certificate" },
    { value: "tenth_marksheet", label: "10th Marksheet" },
    { value: "twelfth_certificate", label: "12th Certificate" },
    { value: "twelfth_marksheet", label: "12th Marksheet" },
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "income_certificate", label: "Income Certificate" },
    { value: "caste_certificate", label: "Caste Certificate" },
    { value: "domicile", label: "Domicile Certificate" },
    { value: "other", label: "Other Document" },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload documents",
          variant: "destructive",
        });
        return;
      }

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-documents')
        .getPublicUrl(fileName);

      // Add to documents array
      const newDoc: ProfileDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        type: selectedType,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };

      onDocumentsChange([...documents, newDoc]);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: ProfileDocument) => {
    try {
      // Extract file path from URL
      const urlParts = doc.url.split('/profile-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('profile-documents')
          .remove([filePath]);

        if (error) throw error;
      }

      // Remove from documents array
      onDocumentsChange(documents.filter(d => d.id !== doc.id));

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type === "photo" || type === "signature") {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">Upload Document</Label>
          <div className="flex gap-2">
            <Input
              id="document"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              className="flex-1"
            />
            <Button disabled={uploading} variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Documents</Label>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {documentTypes.find(t => t.value === doc.type)?.label}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your documents to use them in applications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
