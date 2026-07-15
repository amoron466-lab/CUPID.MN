// No auth backend / database — the admin panel is gated by a single shared
// password read from the environment so it never lands in git history.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
