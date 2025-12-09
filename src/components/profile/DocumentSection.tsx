import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image as ImageIcon, Trash2, Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStudentProfile } from "@/hooks/useStudentProfile";

interface DocumentFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface DocumentSectionProps {
  title: string;
  documentType: string;
  icon: "file" | "image";
  document: DocumentFile | null;
  onDocumentChange: (doc: DocumentFile | null) => void;
}

export const DocumentSection = ({ 
  title, 
  documentType, 
  icon,
  document,
  onDocumentChange 
}: DocumentSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile, saveProfile } = useStudentProfile();

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
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL (valid for 1 year)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('profile-documents')
        .createSignedUrl(fileName, 31536000); // 1 year in seconds

      if (urlError || !signedUrlData) {
        throw new Error('Failed to generate access URL');
      }

      // Create document object
      const newDoc: DocumentFile = {
        id: crypto.randomUUID(),
        name: file.name,
        url: signedUrlData.signedUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Update local state first
      onDocumentChange(newDoc);

      // Save to database immediately
      const updatedDocuments = {
        ...(profile?.documents || {}),
        [documentType]: newDoc
      };

      await saveProfile({
        documents: updatedDocuments as any
      });

      toast({
        title: "Success",
        description: "Document uploaded and saved successfully",
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

  const handleDelete = async () => {
    if (!document) return;

    try {
      // Extract file path from URL
      const urlParts = document.url.split('/profile-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('profile-documents')
          .remove([filePath]);

        if (error) throw error;
      }

      // Update local state first
      onDocumentChange(null);

      // Save to database immediately
      const updatedDocuments = {
        ...(profile?.documents || {}),
        [documentType]: null
      };

      await saveProfile({
        documents: updatedDocuments as any
      });

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

  const IconComponent = icon === "image" ? ImageIcon : FileText;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-base">
        <IconComponent className="h-4 w-4" />
        {title}
      </Label>
      
      {!document ? (
        <div className="flex gap-2">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept={icon === "image" ? ".jpg,.jpeg,.png,.webp" : ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"}
            className="flex-1"
          />
          <Button disabled={uploading} variant="outline" size="icon" type="button">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-primary mt-1">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{document.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(document.url, '_blank')}
                    type="button"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    type="button"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
