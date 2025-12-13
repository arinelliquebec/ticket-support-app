// scripts/add-internet-category.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addInternetCategory() {
  console.log("Starting to add Internet category...");

  try {
    // Check if Internet category already exists
    const existing = await prisma.ticketCategory.findFirst({
      where: {
        name: {
          equals: "Internet",
          mode: "insensitive", // Case insensitive check
        },
      },
    });

    if (existing) {
      console.log(`Internet category already exists with ID: ${existing.id}`);
      return;
    }

    // Create the Internet category
    const newCategory = await prisma.ticketCategory.create({
      data: {
        name: "Internet",
        color: "#8B5CF6", // Purple color
        description: "Internet connection issues",
      },
    });

    console.log(`Created Internet category with ID: ${newCategory.id}`);
  } catch (error) {
    console.error("Error adding Internet category:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addInternetCategory().catch((e) => {
  console.error("Error running script:", e);
  process.exit(1);
});
