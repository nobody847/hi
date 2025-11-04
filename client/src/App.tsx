import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Technologies } from "@/pages/Technologies";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";

function Router() {
  const {
    projects,
    issues,
    credentials,
    teamMembers,
    goals,
    loading,
    createProject,
    updateProject,
    deleteProject,
    updateDevNotes,
    createIssue,
    updateIssue,
    deleteIssue,
    createCredential,
    deleteCredential,
    createTeamMember,
    deleteTeamMember,
    createGoal,
    updateGoal,
    deleteGoal,
    backupToGoogleDrive,
  } = useProjects();

  return (
    <Switch>
      <Route path="/">
        <Dashboard projects={projects} loading={loading} />
      </Route>
      <Route path="/projects">
        <Projects
          projects={projects}
          loading={loading}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      </Route>
      <Route path="/projects/:id">
        <ProjectDetail
          projects={projects}
          issues={issues}
          credentials={credentials}
          teamMembers={teamMembers}
          goals={goals}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onBackupToGoogleDrive={backupToGoogleDrive}
          onUpdateDevNotes={updateDevNotes}
          onCreateIssue={createIssue}
          onUpdateIssue={updateIssue}
          onDeleteIssue={deleteIssue}
          onCreateCredential={createCredential}
          onDeleteCredential={deleteCredential}
          onCreateTeamMember={createTeamMember}
          onDeleteTeamMember={deleteTeamMember}
          onCreateGoal={createGoal}
          onUpdateGoal={updateGoal}
          onDeleteGoal={deleteGoal}
        />
      </Route>
      <Route path="/technologies">
        <Technologies projects={projects} loading={loading} />
      </Route>
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-6">
              <Router />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
