# Firestore Security Rules Setup

This file contains instructions for deploying the Firebase Firestore security rules to your Firebase project.

## Security Rules

The security rules are defined in `firestore.rules` and ensure that:
- Users must be authenticated to access any data
- Users can only read, write, update, and delete their own documents
- All collections are protected by the `userId` field

## How to Deploy Security Rules

### Option 1: Using Firebase Console (Easiest)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy the contents of `firestore.rules` from this project
6. Paste it into the Firebase Console rules editor
7. Click **Publish** to deploy the rules

### Option 2: Using Firebase CLI

If you have the Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Testing the Rules

After deploying the rules, you can test them in the Firebase Console:

1. Go to **Firestore Database** > **Rules** tab
2. Click on **Rules Playground** at the top
3. Test read/write operations with different user IDs

## Important Notes

- The rules are essential for data security in your application
- Without these rules, unauthorized users could access or modify data
- Make sure to deploy the rules before using the application in production
- The rules file is already configured for your Project-Ops Dashboard data model

## Collections Protected

- `projects` - User's development projects
- `issues` - Project issues and bugs
- `credentials` - Secure credential storage
- `teamMembers` - Project team members
- `goals` - Project goals and roadmap items

All collections require that the `userId` field matches the authenticated user's ID.
