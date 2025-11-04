import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const HARDCODED_USERNAME = "priyam";
const HARDCODED_PASSWORD = "priyam@2653";

export async function initializeUser() {
  const existingUsers = await db.select().from(users).limit(1);
  
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      id: nanoid(),
      username: HARDCODED_USERNAME,
      passwordHash: HARDCODED_PASSWORD,
    });
    console.log("Default user created");
  }
}

export async function authenticateUser(username: string, password: string): Promise<boolean> {
  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    return true;
  }
  return false;
}

export async function getUserId(): Promise<string> {
  const user = await db.select().from(users).where(eq(users.username, HARDCODED_USERNAME)).limit(1);
  if (user.length > 0) {
    return user[0].id;
  }
  
  const newUser = await db.insert(users).values({
    id: nanoid(),
    username: HARDCODED_USERNAME,
    passwordHash: HARDCODED_PASSWORD,
  }).returning();
  
  return newUser[0].id;
}
