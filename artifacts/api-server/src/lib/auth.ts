import { getAuth, requireAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";
import { and, eq } from "drizzle-orm";
import {
  db,
  profilesTable,
  rolesTable,
  userRolesTable,
  usersTable,
  walletsTable,
} from "@workspace/db";

export { getAuth, requireAuth };

export function clerkUserIdFromRequest(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

export async function ensureLocalUser(req: Request) {
  const clerkUserId = clerkUserIdFromRequest(req);
  if (!clerkUserId) return null;

  const email = getAuth(req).sessionClaims?.email as string | undefined;
  const [user] = await db
    .insert(usersTable)
    .values({ clerkUserId, email })
    .onConflictDoUpdate({
      target: usersTable.clerkUserId,
      set: { email, updatedAt: new Date() },
    })
    .returning();

  if (!user) return null;
  await db
    .insert(profilesTable)
    .values({ userId: user.id })
    .onConflictDoNothing();
  await db
    .insert(walletsTable)
    .values({ userId: user.id })
    .onConflictDoNothing();
  return user;
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  const clerkUserId = clerkUserIdFromRequest(req);
  if (!clerkUserId) return false;

  const configured = (process.env.VEYRA_ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.includes(clerkUserId)) return true;

  const [row] = await db
    .select({ userId: usersTable.id })
    .from(usersTable)
    .innerJoin(userRolesTable, eq(userRolesTable.userId, usersTable.id))
    .innerJoin(rolesTable, and(eq(rolesTable.id, userRolesTable.roleId), eq(rolesTable.key, "admin")))
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  return Boolean(row);
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!(await isAdminRequest(req))) {
    res.status(getAuth(req).userId ? 403 : 401).json({
      error: getAuth(req).userId ? "Admin role required" : "Authentication required",
    });
    return;
  }
  next();
};