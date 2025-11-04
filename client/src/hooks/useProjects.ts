import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Project, Issue, Credential, TeamMember, Goal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setProjects([]);
      setIssues([]);
      setCredentials([]);
      setTeamMembers([]);
      setGoals([]);
      return;
    }

    loadAllData();
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projectsData] = await Promise.all([
        api.projects.getAll(),
      ]);
      
      setProjects(projectsData);

      const allIssues: Issue[] = [];
      const allCredentials: Credential[] = [];
      const allTeamMembers: TeamMember[] = [];
      const allGoals: Goal[] = [];

      await Promise.all(
        projectsData.map(async (project: Project) => {
          const [issuesData, credentialsData, teamData, goalsData] = await Promise.all([
            api.issues.getByProject(project.id).catch(() => []),
            api.credentials.getByProject(project.id).catch(() => []),
            api.team.getByProject(project.id).catch(() => []),
            api.goals.getByProject(project.id).catch(() => []),
          ]);
          
          allIssues.push(...issuesData);
          allCredentials.push(...credentialsData);
          allTeamMembers.push(...teamData);
          allGoals.push(...goalsData);
        })
      );

      setIssues(allIssues);
      setCredentials(allCredentials);
      setTeamMembers(allTeamMembers);
      setGoals(allGoals);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: any) => {
    if (!isAuthenticated) return;

    try {
      const newProject = await api.projects.create({
        ...projectData,
        devNotes: "",
      });
      
      setProjects((prev) => [newProject, ...prev]);
      
      toast({
        title: "Project created",
        description: `"${projectData.projectName}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: any) => {
    try {
      const updatedProject = await api.projects.update(id, projectData);
      
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedProject } : p))
      );
      
      toast({
        title: "Project updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await api.projects.delete(id);
      
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setIssues((prev) => prev.filter((i) => i.projectId !== id));
      setCredentials((prev) => prev.filter((c) => c.projectId !== id));
      setTeamMembers((prev) => prev.filter((m) => m.projectId !== id));
      setGoals((prev) => prev.filter((g) => g.projectId !== id));
      
      toast({
        title: "Project deleted",
        description: "The project and all associated data have been removed.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDevNotes = async (id: string, notes: string) => {
    try {
      await api.projects.update(id, { devNotes: notes });
      
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, devNotes: notes } : p))
      );
      
      toast({
        title: "Notes saved",
        description: "Your development notes have been updated.",
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createIssue = async (issueData: any) => {
    if (!isAuthenticated) return;

    try {
      const newIssue = await api.issues.create(issueData.projectId, issueData);
      setIssues((prev) => [...prev, newIssue]);
    } catch (error) {
      console.error("Error creating issue:", error);
      throw error;
    }
  };

  const updateIssue = async (id: string, issueData: any) => {
    try {
      const updatedIssue = await api.issues.update(id, issueData);
      setIssues((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updatedIssue } : i))
      );
    } catch (error) {
      console.error("Error updating issue:", error);
      throw error;
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      await api.issues.delete(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error deleting issue:", error);
      throw error;
    }
  };

  const createCredential = async (credentialData: any) => {
    if (!isAuthenticated) return;

    try {
      const newCredential = await api.credentials.create(
        credentialData.projectId,
        credentialData
      );
      setCredentials((prev) => [...prev, newCredential]);
    } catch (error) {
      console.error("Error creating credential:", error);
      throw error;
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      await api.credentials.delete(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting credential:", error);
      throw error;
    }
  };

  const createTeamMember = async (memberData: any) => {
    if (!isAuthenticated) return;

    try {
      const newMember = await api.team.create(memberData.projectId, memberData);
      setTeamMembers((prev) => [...prev, newMember]);
    } catch (error) {
      console.error("Error creating team member:", error);
      throw error;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      await api.team.delete(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting team member:", error);
      throw error;
    }
  };

  const createGoal = async (goalData: any) => {
    if (!isAuthenticated) return;

    try {
      const newGoal = await api.goals.create(goalData.projectId, goalData);
      setGoals((prev) => [...prev, newGoal]);
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  };

  const updateGoal = async (id: string, goalData: any) => {
    try {
      const updatedGoal = await api.goals.update(id, goalData);
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g))
      );
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.goals.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  };

  const backupToGoogleDrive = async (projectId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to backup your project.",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }

    try {
      const result = await api.backup.toGoogleDrive(projectId);
      
      toast({
        title: "Backup successful",
        description: `Your project has been backed up to Google Drive. ${result.backupSummary?.totalIssues || 0} issues, ${result.backupSummary?.totalGoals || 0} goals included.`,
      });
      return result;
    } catch (error: any) {
      console.error("Error backing up to Google Drive:", error);
      toast({
        title: "Backup failed",
        description: error.message || "Failed to backup to Google Drive. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
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
  };
}
