
import { eq } from "drizzle-orm";
import { db } from "../server/db/index.ts";
import { users } from "../server/db/schema.ts";
import { PasswordUtils } from "../server/providers/password-utils.ts";

async function resetAdmin() {
  console.log("Resetting admin password...");

  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (adminUser.length === 0) {
    console.log("Admin user does not exist. Creating one...");
    const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await PasswordUtils.hashPassword(defaultPassword);

    await db.insert(users).values({
      username: "admin",
      passwordHash: hashedPassword,
      isAdmin: true,
      requirePasswordChange: false,
    });

    console.log(`Admin user created! New password: ${defaultPassword}`);
  } else {
    const newPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: hashedPassword, requirePasswordChange: false })
      .where(eq(users.username, "admin"));

    console.log(`Admin password reset! New password: ${newPassword}`);
  }
}

resetAdmin()
  .then(() => {
    console.log("Admin password reset complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error resetting admin password:", error);
    process.exit(1);
  });
