import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { db, pool } from "../db";
import { projects, issues, credentials, teamMembers, goals } from "../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authenticateUser, initializeUser } from "./auth";
import { getUncachableGoogleDriveClient, listProjectBackups, uploadBackup, downloadBackup, deleteBackup, getFileMetadata } from "./google-drive";

const PgSession = connectPgSimple(session);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

declare module 'express-session' {
  interface SessionData {
    isAuthenticated: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeUser();

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  const sessionStore = new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'priyam-ops-dashboard-secret-key-' + nanoid(),
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const isValid = await authenticateUser(username, password);
      
      if (isValid) {
        req.session.isAuthenticated = true;
        res.json({ success: true, message: "Logged in successfully" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAuthenticated });
  });

  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const allProjects = await db.select().from(projects).orderBy(projects.updatedAt);
      res.json(allProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await db.select().from(projects).where(eq(projects.id, req.params.id)).limit(1);
      if (project.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project[0]);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectId = nanoid();
      const newProject = await db.insert(projects).values({
        id: projectId,
        ...req.body,
        updatedAt: new Date(),
      }).returning();
      res.json(newProject[0]);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const updatedProject = await db.update(projects)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(projects.id, req.params.id))
        .returning();
      
      if (updatedProject.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updatedProject[0]);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(projects).where(eq(projects.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.get("/api/projects/:projectId/issues", requireAuth, async (req, res) => {
    try {
      const projectIssues = await db.select().from(issues)
        .where(eq(issues.projectId, req.params.projectId));
      res.json(projectIssues);
    } catch (error: any) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  app.post("/api/projects/:projectId/issues", requireAuth, async (req, res) => {
    try {
      const newIssue = await db.insert(issues).values({
        id: nanoid(),
        projectId: req.params.projectId,
        ...req.body,
        createdAt: new Date(),
      }).returning();
      res.json(newIssue[0]);
    } catch (error: any) {
      console.error("Error creating issue:", error);
      res.status(500).json({ error: "Failed to create issue" });
    }
  });

  app.put("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      const updatedIssue = await db.update(issues)
        .set(req.body)
        .where(eq(issues.id, req.params.id))
        .returning();
      
      if (updatedIssue.length === 0) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(updatedIssue[0]);
    } catch (error: any) {
      console.error("Error updating issue:", error);
      res.status(500).json({ error: "Failed to update issue" });
    }
  });

  app.delete("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(issues).where(eq(issues.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting issue:", error);
      res.status(500).json({ error: "Failed to delete issue" });
    }
  });

  app.get("/api/projects/:projectId/credentials", requireAuth, async (req, res) => {
    try {
      const projectCredentials = await db.select().from(credentials)
        .where(eq(credentials.projectId, req.params.projectId));
      res.json(projectCredentials);
    } catch (error: any) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  app.post("/api/projects/:projectId/credentials", requireAuth, async (req, res) => {
    try {
      const newCredential = await db.insert(credentials).values({
        id: nanoid(),
        projectId: req.params.projectId,
        ...req.body,
      }).returning();
      res.json(newCredential[0]);
    } catch (error: any) {
      console.error("Error creating credential:", error);
      res.status(500).json({ error: "Failed to create credential" });
    }
  });

  app.put("/api/credentials/:id", requireAuth, async (req, res) => {
    try {
      const updatedCredential = await db.update(credentials)
        .set(req.body)
        .where(eq(credentials.id, req.params.id))
        .returning();
      
      if (updatedCredential.length === 0) {
        return res.status(404).json({ error: "Credential not found" });
      }
      res.json(updatedCredential[0]);
    } catch (error: any) {
      console.error("Error updating credential:", error);
      res.status(500).json({ error: "Failed to update credential" });
    }
  });

  app.delete("/api/credentials/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(credentials).where(eq(credentials.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting credential:", error);
      res.status(500).json({ error: "Failed to delete credential" });
    }
  });

  app.get("/api/projects/:projectId/team", requireAuth, async (req, res) => {
    try {
      const projectTeam = await db.select().from(teamMembers)
        .where(eq(teamMembers.projectId, req.params.projectId));
      res.json(projectTeam);
    } catch (error: any) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/projects/:projectId/team", requireAuth, async (req, res) => {
    try {
      const newTeamMember = await db.insert(teamMembers).values({
        id: nanoid(),
        projectId: req.params.projectId,
        ...req.body,
      }).returning();
      res.json(newTeamMember[0]);
    } catch (error: any) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.put("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const updatedTeamMember = await db.update(teamMembers)
        .set(req.body)
        .where(eq(teamMembers.id, req.params.id))
        .returning();
      
      if (updatedTeamMember.length === 0) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(updatedTeamMember[0]);
    } catch (error: any) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(teamMembers).where(eq(teamMembers.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/projects/:projectId/goals", requireAuth, async (req, res) => {
    try {
      const projectGoals = await db.select().from(goals)
        .where(eq(goals.projectId, req.params.projectId));
      res.json(projectGoals);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/projects/:projectId/goals", requireAuth, async (req, res) => {
    try {
      const newGoal = await db.insert(goals).values({
        id: nanoid(),
        projectId: req.params.projectId,
        ...req.body,
      }).returning();
      res.json(newGoal[0]);
    } catch (error: any) {
      console.error("Error creating goal:", error);
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const updatedGoal = await db.update(goals)
        .set(req.body)
        .where(eq(goals.id, req.params.id))
        .returning();
      
      if (updatedGoal.length === 0) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(updatedGoal[0]);
    } catch (error: any) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(goals).where(eq(goals.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // New Backup Management Endpoints
  const upload = multer({ storage: multer.memoryStorage() });

  // List backups for a specific project
  app.get("/api/backups/:projectId", requireAuth, async (req, res) => {
    try {
      const projectData = await db.select().from(projects).where(eq(projects.id, req.params.projectId)).limit(1);
      
      if (projectData.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const backups = await listProjectBackups(projectData[0].projectName);
      
      res.json({ backups });
    } catch (error: any) {
      console.error("Error listing backups:", error);
      res.status(500).json({
        error: "Failed to list backups",
        message: error.message,
      });
    }
  });

  // Upload a backup file
  app.post("/api/backups/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      // Fetch project from database to get actual project name (security: don't trust client data)
      const projectData = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      
      if (projectData.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const fileStream = Readable.from(req.file.buffer);
      const result = await uploadBackup(
        projectData[0].projectName,
        req.file.originalname,
        fileStream,
        req.file.mimetype
      );

      res.json({
        success: true,
        file: result,
      });
    } catch (error: any) {
      console.error("Error uploading backup:", error);
      res.status(500).json({
        error: "Failed to upload backup",
        message: error.message,
      });
    }
  });

  // Download a backup file
  app.get("/api/backups/:projectId/download/:fileId", requireAuth, async (req, res) => {
    try {
      const { projectId, fileId } = req.params;
      
      // Fetch project from database to verify ownership
      const projectData = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      
      if (projectData.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify file belongs to this project by checking if it's in the project's backup list
      const projectBackups = await listProjectBackups(projectData[0].projectName);
      const fileExists = projectBackups.some(backup => backup.id === fileId);
      
      if (!fileExists) {
        return res.status(403).json({ error: "File does not belong to this project" });
      }
      
      const metadata = await getFileMetadata(fileId);
      const fileStream = await downloadBackup(fileId);

      res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
      res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
      
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("Error downloading backup:", error);
      res.status(500).json({
        error: "Failed to download backup",
        message: error.message,
      });
    }
  });

  // Delete a backup file
  app.delete("/api/backups/:projectId/:fileId", requireAuth, async (req, res) => {
    try {
      const { projectId, fileId } = req.params;
      
      // Fetch project from database to verify ownership
      const projectData = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      
      if (projectData.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify file belongs to this project by checking if it's in the project's backup list
      const projectBackups = await listProjectBackups(projectData[0].projectName);
      const fileExists = projectBackups.some(backup => backup.id === fileId);
      
      if (!fileExists) {
        return res.status(403).json({ error: "File does not belong to this project" });
      }
      
      await deleteBackup(fileId);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting backup:", error);
      res.status(500).json({
        error: "Failed to delete backup",
        message: error.message,
      });
    }
  });

  app.post("/api/backup-to-drive", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const projectData = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      
      if (projectData.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const [projectIssues, projectTeam, projectGoals] = await Promise.all([
        db.select().from(issues).where(eq(issues.projectId, projectId)),
        db.select().from(teamMembers).where(eq(teamMembers.projectId, projectId)),
        db.select().from(goals).where(eq(goals.projectId, projectId)),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        project: projectData[0],
        issues: projectIssues,
        teamMembers: projectTeam,
        goals: projectGoals,
        metadata: {
          totalIssues: projectIssues.length,
          totalTeamMembers: projectTeam.length,
          totalGoals: projectGoals.length,
          openIssues: projectIssues.filter((i: any) => i.status === "Open").length,
          completedGoals: projectGoals.filter((g: any) => g.completed).length,
        },
      };

      const drive = await getUncachableGoogleDriveClient();

      const folderName = "Project-Ops Backups";
      const folderQuery = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
      });

      let folderId: string;
      if (folderQuery.data.files && folderQuery.data.files.length > 0) {
        folderId = folderQuery.data.files[0].id!;
      } else {
        const folderMetadata = {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        };
        const folder = await drive.files.create({
          requestBody: folderMetadata,
          fields: "id",
        });
        folderId = folder.data.id!;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${projectData[0].projectName || "project"}-backup-${timestamp}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: "application/json",
        body: JSON.stringify(backupData, null, 2),
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink",
      });

      res.json({
        success: true,
        fileId: file.data.id,
        fileName: file.data.name,
        webViewLink: file.data.webViewLink,
        backupSummary: backupData.metadata,
      });
    } catch (error: any) {
      console.error("Google Drive backup error:", error);
      res.status(500).json({
        error: "Failed to backup to Google Drive",
        message: error.message,
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
