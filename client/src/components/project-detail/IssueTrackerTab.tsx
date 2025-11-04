import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bug, Trash2 } from "lucide-react";
import { Issue, ISSUE_PRIORITIES, ISSUE_STATUSES } from "@shared/schema";
import { IssueDialog } from "./IssueDialog";

interface IssueTrackerTabProps {
  projectId: string;
  issues: Issue[];
  onCreateIssue: (issue: any) => Promise<void>;
  onUpdateIssue: (id: string, issue: any) => Promise<void>;
  onDeleteIssue: (id: string) => Promise<void>;
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-chart-4",
  Medium: "bg-chart-3",
  High: "bg-destructive",
};

const PRIORITY_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  Low: "secondary",
  Medium: "default",
  High: "destructive",
};

export function IssueTrackerTab({
  projectId,
  issues,
  onCreateIssue,
  onUpdateIssue,
  onDeleteIssue,
}: IssueTrackerTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>();

  const openIssues = issues.filter((i) => i.status === "Open");
  const closedIssues = issues.filter((i) => i.status === "Closed");

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIssue(undefined);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Issue Tracker</CardTitle>
            <CardDescription>
              Track bugs and errors in your project
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-add-issue"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Issue
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Open Issues ({openIssues.length})
            </h3>
            {openIssues.length > 0 ? (
              <div className="space-y-2">
                {openIssues.map((issue) => (
                  <Card key={issue.id} data-testid={`card-issue-${issue.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{issue.title}</h4>
                            <Badge variant={PRIORITY_VARIANTS[issue.priority]}>
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(issue)}
                            data-testid={`button-edit-issue-${issue.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteIssue(issue.id)}
                            data-testid={`button-delete-issue-${issue.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No open issues</p>
            )}
          </div>

          {closedIssues.length > 0 && (
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold">
                Closed Issues ({closedIssues.length})
              </h3>
              <div className="space-y-2">
                {closedIssues.map((issue) => (
                  <Card key={issue.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold line-through">{issue.title}</h4>
                            <Badge variant="outline">Closed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteIssue(issue.id)}
                          data-testid={`button-delete-closed-issue-${issue.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {issues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bug className="h-16 w-16 opacity-50 mb-4" />
              <p className="text-center">No issues tracked yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <IssueDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        projectId={projectId}
        onSubmit={editingIssue
          ? (data) => onUpdateIssue(editingIssue.id, data)
          : onCreateIssue
        }
        issue={editingIssue}
      />
    </div>
  );
}
