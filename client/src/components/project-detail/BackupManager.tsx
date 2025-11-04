import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, FolderOpen, Calendar, HardDrive, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

interface BackupFile {
  id: string;
  name: string;
  createdTime: string;
  size: number;
  webContentLink?: string;
  webViewLink?: string;
}

interface BackupManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function BackupManager({ open, onOpenChange, projectId, projectName }: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open, projectId]);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/backups/${projectId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to load backups');
      }
      
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (err: any) {
      console.error('Error loading backups:', err);
      setError(err.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('projectId', projectId);
      formData.append('projectName', projectName);

      const response = await fetch('/api/backups/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      await loadBackups();
      event.target.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload backup');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (backup: BackupFile) => {
    try {
      const response = await fetch(`/api/backups/${projectId}/download/${backup.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download backup');
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    setDeletingId(backupId);
    setError(null);

    try {
      const response = await fetch(`/api/backups/${projectId}/${backupId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      await loadBackups();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete backup');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Google Drive Backups - {projectName}
          </DialogTitle>
          <DialogDescription>
            Manage your project backups stored in Google Drive
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={loadBackups}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
              <Badge variant="secondary">
                {backups.length} {backups.length === 1 ? 'backup' : 'backups'}
              </Badge>
            </div>

            <div>
              <input
                type="file"
                id="backup-upload"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
                accept=".zip,.tar.gz,.json"
              />
              <Button
                onClick={() => document.getElementById('backup-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Backup
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : backups.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FolderOpen className="h-16 w-16 opacity-50 mb-4" />
                  <p className="text-center mb-2">No backups found</p>
                  <p className="text-sm text-center">
                    Upload your first backup to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              backups.map((backup) => (
                <Card key={backup.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{backup.name}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(backup.createdTime), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            <span>{formatFileSize(backup.size)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(backup.createdTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(backup)}
                          disabled={deletingId === backup.id}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(backup.id)}
                          disabled={deletingId === backup.id}
                        >
                          {deletingId === backup.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
