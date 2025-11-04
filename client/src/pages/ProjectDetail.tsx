import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Cloud, ExternalLink, Github, FolderOpen } from "lucide-react";
import { Project, Issue, Credential, TeamMember, Goal } from "@shared/schema";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { DetailsTab } from "@/components/project-detail/DetailsTab";
import { DevNotesTab } from "@/components/project-detail/DevNotesTab";
import { IssueTrackerTab } from "@/components/project-detail/IssueTrackerTab";
import { CredentialsTab } from "@/components/project-detail/CredentialsTab";
import { TeamTab } from "@/components/project-detail/TeamTab";
import { GoalsTab } from "@/components/project-detail/GoalsTab";
import { BackupManager } from "@/components/project-detail/BackupManager";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  Planning: "secondary",
  Development: "default",
  Testing: "secondary",
  Live: "default",
  Maintenance: "secondary",
  "On Hold": "outline",
};

interface ProjectDetailProps {
  projects: Project[];
  issues: Issue[];
  credentials: Credential[];
  teamMembers: TeamMember[];
  goals: Goal[];
  onUpdateProject: (id: string, data: any) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onBackupToGoogleDrive: (projectId: string) => Promise<void>;
  onUpdateDevNotes: (id: string, notes: string) => Promise<void>;
  onCreateIssue: (issue: any) => Promise<void>;
  onUpdateIssue: (id: string, issue: any) => Promise<void>;
  onDeleteIssue: (id: string) => Promise<void>;
  onCreateCredential: (credential: any) => Promise<void>;
  onDeleteCredential: (id: string) => Promise<void>;
  onCreateTeamMember: (member: any) => Promise<void>;
  onDeleteTeamMember: (id: string) => Promise<void>;
  onCreateGoal: (goal: any) => Promise<void>;
  onUpdateGoal: (id: string, goal: any) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function ProjectDetail({
  projects,
  issues,
  credentials,
  teamMembers,
  goals,
  onUpdateProject,
  onDeleteProject,
  onBackupToGoogleDrive,
  onUpdateDevNotes,
  onCreateIssue,
  onUpdateIssue,
  onDeleteIssue,
  onCreateCredential,
  onDeleteCredential,
  onCreateTeamMember,
  onDeleteTeamMember,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}: ProjectDetailProps) {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBackupManagerOpen, setIsBackupManagerOpen] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const project = projects.find((p) => p.id === id);
  const projectIssues = issues.filter((i) => i.projectId === id);
  const projectCredentials = credentials.filter((c) => c.projectId === id);
  const projectTeamMembers = teamMembers.filter((m) => m.projectId === id);
  const projectGoals = goals.filter((g) => g.projectId === id);

  if (!project) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Project not found</h3>
          <Button onClick={() => setLocation("/projects")} data-testid="button-back-to-projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async () => {
    await onDeleteProject(project.id);
    setLocation("/projects");
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      await onBackupToGoogleDrive(project.id);
    } catch (error) {
      console.error("Backup error:", error);
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/projects")}
          className="w-fit"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{project.projectName}</h1>
              <Badge variant={STATUS_BADGE_VARIANTS[project.status]}>
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setIsBackupManagerOpen(true)}
              data-testid="button-manage-backups"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Manage Backups
            </Button>
            <Button
              variant="outline"
              onClick={handleBackup}
              disabled={backingUp}
              data-testid="button-backup-to-drive"
            >
              <Cloud className="mr-2 h-4 w-4" />
              {backingUp ? "Backing up..." : "Quick Backup (JSON)"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              data-testid="button-edit-project"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              data-testid="button-delete-project"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {(project.repoLink || project.liveLink) && (
          <div className="flex gap-2 flex-wrap">
            {project.repoLink && (
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="link-repo"
              >
                <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  Repository
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
            {project.liveLink && (
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="link-live"
              >
                <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Site
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">Dev Notes</TabsTrigger>
          <TabsTrigger value="issues" data-testid="tab-issues">Issues</TabsTrigger>
          <TabsTrigger value="credentials" data-testid="tab-credentials">Credentials</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <DetailsTab project={project} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <DevNotesTab
            project={project}
            onUpdateNotes={(notes) => onUpdateDevNotes(project.id, notes)}
          />
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <IssueTrackerTab
            projectId={project.id}
            issues={projectIssues}
            onCreateIssue={onCreateIssue}
            onUpdateIssue={onUpdateIssue}
            onDeleteIssue={onDeleteIssue}
          />
        </TabsContent>

        <TabsContent value="credentials" className="mt-6">
          <CredentialsTab
            projectId={project.id}
            credentials={projectCredentials}
            onCreateCredential={onCreateCredential}
            onDeleteCredential={onDeleteCredential}
          />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamTab
            projectId={project.id}
            teamMembers={projectTeamMembers}
            onCreateTeamMember={onCreateTeamMember}
            onDeleteTeamMember={onDeleteTeamMember}
          />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <GoalsTab
            projectId={project.id}
            goals={projectGoals}
            onCreateGoal={onCreateGoal}
            onUpdateGoal={onUpdateGoal}
            onDeleteGoal={onDeleteGoal}
          />
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={(data) => onUpdateProject(project.id, data)}
        project={project}
      />

      <BackupManager
        open={isBackupManagerOpen}
        onOpenChange={setIsBackupManagerOpen}
        projectId={project.id}
        projectName={project.projectName}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.projectName}" and all associated
              data including issues, credentials, team members, and goals. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
