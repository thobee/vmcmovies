import { isAdminAuthPath } from "./gate";

const gated = [
  "/admin/login",
  "/admin/forgot",
  "/admin/signup",
  "/api/admin/login",
  "/api/admin/password-reset",
  "/api/admin/signup",
];
const open = ["/admin", "/admin/movies", "/api/admin/content", "/login"];

for (const p of gated) {
  if (!isAdminAuthPath(p)) throw new Error(`expected gated: ${p}`);
}
for (const p of open) {
  if (isAdminAuthPath(p)) throw new Error(`expected open: ${p}`);
}

console.log("admin gate paths ok");
