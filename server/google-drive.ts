// Google Drive integration for project backups
// Reference: google-drive blueprint integration
import { google } from 'googleapis';
import type { Readable } from 'stream';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Helper function to get or create root backup folder
export async function getRootBackupFolder() {
  const drive = await getUncachableGoogleDriveClient();
  const folderName = "Project-Ops Backups";
  
  const folderQuery = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (folderQuery.data.files && folderQuery.data.files.length > 0) {
    return folderQuery.data.files[0].id!;
  } else {
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });
    return folder.data.id!;
  }
}

// Helper function to get or create project-specific folder
export async function getProjectFolder(projectName: string) {
  const drive = await getUncachableGoogleDriveClient();
  const rootFolderId = await getRootBackupFolder();
  
  const folderQuery = await drive.files.list({
    q: `name='${projectName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (folderQuery.data.files && folderQuery.data.files.length > 0) {
    return folderQuery.data.files[0].id!;
  } else {
    const folderMetadata = {
      name: projectName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    };
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });
    return folder.data.id!;
  }
}

// List all backups for a specific project
export async function listProjectBackups(projectName: string) {
  const drive = await getUncachableGoogleDriveClient();
  const projectFolderId = await getProjectFolder(projectName);
  
  const filesQuery = await drive.files.list({
    q: `'${projectFolderId}' in parents and trashed=false`,
    fields: "files(id, name, createdTime, size, mimeType, webContentLink, webViewLink)",
    orderBy: "createdTime desc",
  });

  return filesQuery.data.files || [];
}

// Upload a backup file
export async function uploadBackup(projectName: string, fileName: string, fileStream: Readable, mimeType: string) {
  const drive = await getUncachableGoogleDriveClient();
  const projectFolderId = await getProjectFolder(projectName);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const finalFileName = `backup-${timestamp}-${sanitizedFileName}`;
  
  const fileMetadata = {
    name: finalFileName,
    parents: [projectFolderId],
  };

  const media = {
    mimeType: mimeType,
    body: fileStream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name, createdTime, size, webViewLink",
  });

  return file.data;
}

// Download a backup file
export async function downloadBackup(fileId: string) {
  const drive = await getUncachableGoogleDriveClient();
  
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return response.data;
}

// Delete a backup file
export async function deleteBackup(fileId: string) {
  const drive = await getUncachableGoogleDriveClient();
  
  await drive.files.delete({
    fileId: fileId,
  });

  return { success: true };
}

// Get file metadata
export async function getFileMetadata(fileId: string) {
  const drive = await getUncachableGoogleDriveClient();
  
  const file = await drive.files.get({
    fileId: fileId,
    fields: "id, name, createdTime, size, mimeType",
  });

  return file.data;
}
