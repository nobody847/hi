import { z } from "zod";

// Project Status enum
export const PROJECT_STATUSES = [
  "Planning",
  "Development",
  "Testing",
  "Live",
  "Maintenance",
  "On Hold"
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];

// Issue Priority enum
export const ISSUE_PRIORITIES = ["Low", "Medium", "High"] as const;
export type IssuePriority = typeof ISSUE_PRIORITIES[number];

// Issue Status enum
export const ISSUE_STATUSES = ["Open", "Closed"] as const;
export type IssueStatus = typeof ISSUE_STATUSES[number];

// Project Schema
export const projectSchema = z.object({
  id: z.string(),
  projectName: z.string().min(1, "Project name is required"),
  description: z.string(),
  status: z.enum(PROJECT_STATUSES),
  startDate: z.string(),
  technologyStack: z.array(z.string()),
  repoLink: z.string().url().or(z.literal("")),
  liveLink: z.string().url().or(z.literal("")),
  userId: z.string(),
  updatedAt: z.string(),
  devNotes: z.string().optional(),
});

export const insertProjectSchema = projectSchema.omit({ 
  id: true, 
  updatedAt: true 
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Issue Schema
export const issueSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  priority: z.enum(ISSUE_PRIORITIES),
  status: z.enum(ISSUE_STATUSES),
  createdAt: z.string(),
});

export const insertIssueSchema = issueSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Issue = z.infer<typeof issueSchema>;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

// Credential Schema
export const credentialSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export const insertCredentialSchema = credentialSchema.omit({ id: true });

export type Credential = z.infer<typeof credentialSchema>;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;

// Team Member Schema
export const teamMemberSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  contact: z.string(),
});

export const insertTeamMemberSchema = teamMemberSchema.omit({ id: true });

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// Goal Schema
export const goalSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  text: z.string().min(1, "Goal text is required"),
  completed: z.boolean(),
});

export const insertGoalSchema = goalSchema.omit({ id: true });

export type Goal = z.infer<typeof goalSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
