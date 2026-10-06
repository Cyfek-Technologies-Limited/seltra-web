// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  console.log("✅ Using enum roles: ADVERTISER, PUBLISHER, ADMIN, MODERATOR");

  // Create sample users with enum roles - USE THE ENUM VALUES DIRECTLY
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      passwordHash: "$2b$10$K7L1OJ45.4U2d.6A5Qd5E.A6Qd5E.A6Qd5E.A6Qd5E.A6Qd5E",
      roles: ["ADMIN"], // This should work with the new client
      emailVerified: new Date(),
    },
  });

  const publisherUser = await prisma.user.upsert({
    where: { email: "publisher@example.com" },
    update: {},
    create: {
      email: "publisher@example.com",
      username: "publisher",
      passwordHash: "$2b$10$K7L1OJ45.4U2d.6A5Qd5E.A6Qd5E.A6Qd5E.A6Qd5E.A6Qd5E",
      roles: ["PUBLISHER"],
      emailVerified: new Date(),
    },
  });

  const advertiserUser = await prisma.user.upsert({
    where: { email: "advertiser@example.com" },
    update: {},
    create: {
      email: "advertiser@example.com",
      username: "advertiser",
      passwordHash: "$2b$10$K7L1OJ45.4U2d.6A5Qd5E.A6Qd5E.A6Qd5E.A6Qd5E.A6Qd5E",
      roles: ["ADVERTISER"],
      emailVerified: new Date(),
    },
  });

  console.log("✅ Sample users created with enum roles");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
