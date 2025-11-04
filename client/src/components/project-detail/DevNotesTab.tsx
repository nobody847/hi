import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { Project } from "@shared/schema";

interface DevNotesTabProps {
  project: Project;
  onUpdateNotes: (notes: string) => Promise<void>;
}

export function DevNotesTab({ project, onUpdateNotes }: DevNotesTabProps) {
  const [notes, setNotes] = useState(project.devNotes || "");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateNotes(notes);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== (project.devNotes || ""));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Developer Notes</CardTitle>
          <CardDescription>
            Keep track of thoughts, code snippets, and important information
          </CardDescription>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          data-testid="button-save-notes"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Notes"}
        </Button>
      </CardHeader>
      <CardContent>
        {notes || hasChanges ? (
          <Textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your development notes here... You can include code snippets, ideas, or anything you need to remember about this project."
            className="min-h-[400px] font-mono text-sm"
            data-testid="textarea-dev-notes"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 opacity-50 mb-4" />
            <p className="text-center mb-4">No development notes yet</p>
            <Button
              variant="outline"
              onClick={() => setHasChanges(true)}
              data-testid="button-start-writing"
            >
              Start Writing
            </Button>
          </div>
        )}
        {hasChanges && (
          <p className="text-sm text-muted-foreground mt-2">
            You have unsaved changes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
