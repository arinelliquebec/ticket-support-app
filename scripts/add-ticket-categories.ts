// scripts/add-ticket-categories.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the categories to add
const categoriesToAdd = [
  {
    name: "Fone",
    color: "#F87171",
    description: "Issues with headphones or phone devices",
  },
  {
    name: "Hardware",
    color: "#60A5FA",
    description: "Computer hardware related issues",
  },
  {
    name: "Monitor",
    color: "#34D399",
    description: "Monitor or display related issues",
  },
  {
    name: "Mouse",
    color: "#A78BFA",
    description: "Mouse and pointing device issues",
  },
  {
    name: "AlterData",
    color: "#FBBF24",
    description: "AlterData software related issues",
  },
  {
    name: "3CX | Telefonia",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  {
    name: "Criação | Exclusão de Usuário",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  {
    name: "Domínio Web",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  { name: "Email", color: "#EC4899", description: "3CX phone system issues" },
  { name: "CRM", color: "#EC4899", description: "3CX phone system issues" },
  {
    name: "Sistema Financeiro",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  {
    name: "Rock Data",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  {
    name: "Confirme Online",
    color: "#EC4899",
    description: "3CX phone system issues",
  },
  { name: "D4SIGN", color: "#EC4899", description: "3CX phone system issues" },
  {
    name: "Outros",
    color: "#9CA3AF",
    description: "Other miscellaneous issues",
  },
];

async function addCategories() {
  console.log("Starting to add ticket categories...");

  let addedCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  for (const category of categoriesToAdd) {
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
addCategories()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
