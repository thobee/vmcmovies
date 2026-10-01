import type { AdminRole, UserRole } from "@/lib/auth/types";

export type AdminPermission =
  | "catalog"
  | "homepage"
  | "updates"
  | "requests"
  | "support"
  | "users"
  | "team"
  | "billing"
  | "payments";

const CONTENT_ADMIN_PERMISSIONS = new Set<AdminPermission>([
  "catalog",
  "homepage",
  "updates",
  "requests",
  "support",
]);

const FULL_ADMIN_PERMISSIONS = new Set<AdminPermission>([
  ...CONTENT_ADMIN_PERMISSIONS,
  "users",
  "team",
  "billing",
  "payments",
]);

export function isAdminRole(role?: UserRole | string | null): role is AdminRole {
  return role === "admin" || role === "content_admin";
}

export function isFullAdminRole(role?: UserRole | string | null): boolean {
  return role === "admin";
}

export function canAdmin(role: AdminRole, permission: AdminPermission): boolean {
  return role === "admin"
    ? FULL_ADMIN_PERMISSIONS.has(permission)
    : CONTENT_ADMIN_PERMISSIONS.has(permission);
}

export function adminRoleLabel(role: AdminRole): string {
  return role === "admin" ? "Full admin" : "Content admin";
}
