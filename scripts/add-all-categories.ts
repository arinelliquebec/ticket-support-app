// scripts/add-all-categories.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define all categories including the new ones
const allCategories = [
  // Existing categories
  {
    name: "3CX | Telefonia",
    color: "#EC4899",
    description: "3CX phone system and telephony issues",
  },
  {
    name: "Fone",
    color: "#F87171",
    description: "Issues with headphones or phone devices",
  },
  {
    name: "Monitor",
    color: "#34D399",
    description: "Monitor or display related issues",
  },
  {
    name: "Hardware",
    color: "#60A5FA",
    description: "Computer hardware related issues",
  },
  {
    name: "AlterData",
    color: "#FBBF24",
    description: "AlterData software related issues",
  },
  {
    name: "Internet",
    color: "#8B5CF6",
    description: "Internet connection issues",
  },
  {
    name: "Mouse",
    color: "#A78BFA",
    description: "Mouse and pointing device issues",
  },
  {
    name: "Outros",
    color: "#9CA3AF",
    description: "Other miscellaneous issues",
  },

  // New categories
  {
    name: "Email",
    color: "#4F46E5",
    description: "Email configuration and issues",
  },
  {
    name: "Domínio Web",
    color: "#0EA5E9",
    description: "Web domain management and issues",
  },
  {
    name: "Sistema Financeiro",
    color: "#10B981",
    description: "Financial system related issues",
  },
  {
    name: "D4SIGN",
    color: "#F59E0B",
    description: "D4SIGN digital signature service issues",
  },
  {
    name: "Criação | Exclusão de Usuário",
    color: "#EF4444",
    description: "User creation and deletion requests",
  },
  {
    name: "CRM",
    color: "#8B5CF6",
    description: "Customer Relationship Management system issues",
  },
  {
    name: "Rock Data",
    color: "#EC4899",
    description: "Rock Data platform related issues",
  },
  {
    name: "Confirme Online",
    color: "#6366F1",
    description: "Confirme Online service issues",
  },
];

async function addAllCategories() {
  console.log("Starting to add all ticket categories...");

  let addedCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  for (const category of allCategories) {
    try {
      // Check if category already exists
      const existing = await prisma.ticketCategory.findFirst({
        where: {
          name: {
            equals: category.name,
            mode: "insensitive", // Case insensitive check
          },
        },
      });

      if (existing) {
        console.log(
          `Category "${category.name}" already exists with ID: ${existing.id}`
        );
        existingCount++;
        continue;
      }

      // Create the category
      const newCategory = await prisma.ticketCategory.create({
        data: category,
      });

      console.log(
        `Created category "${newCategory.name}" with ID: ${newCategory.id}`
      );
      addedCount++;
    } catch (error) {
      console.error(`Error adding category "${category.name}":`, error);
      errorCount++;
    }
  }

  console.log("\nCategory addition completed:");
  console.log(`- Added: ${addedCount}`);
  console.log(`- Already existing: ${existingCount}`);
  console.log(`- Errors: ${errorCount}`);
}

// Run the function
addAllCategories()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
