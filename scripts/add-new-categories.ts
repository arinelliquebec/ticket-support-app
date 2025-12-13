// scripts/add-new-categories.ts
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Define new categories to add
const NEW_CATEGORIES = [
  {
    name: "Instalar programas",
    color: "#2DD4BF",
    description: "Software installation and setup requests",
  },
  {
    name: "Impressora",
    color: "#FB923C",
    description: "Printer configuration and troubleshooting",
  },
  {
    name: "Certificados",
    color: "#22C55E",
    description: "Digital certificate installation and issues",
  },
  {
    name: "Teclado",
    color: "#C084FC",
    description: "Keyboard-related issues and requests",
  },
  {
    name: "Problema com Sites",
    color: "#38BDF8",
    description: "Website access and functionality issues",
  },
];

async function addNewCategories() {
  console.log("Starting to add new categories...");

  try {
    for (const category of NEW_CATEGORIES) {
      // Check if the category already exists
      const existingCategory = await prisma.ticketCategory.findFirst({
        where: {
          name: {
            equals: category.name,
            mode: "insensitive", // Case-insensitive comparison
          },
        },
      });

      if (existingCategory) {
        console.log(
          `Category "${category.name}" already exists with ID: ${existingCategory.id}`
        );
      } else {
        // Create the new category
        const newCategory = await prisma.ticketCategory.create({
          data: category,
        });
        console.log(
          `Created new category "${category.name}" with ID: ${newCategory.id}`
        );
      }
    }

    console.log("All new categories processed successfully!");
  } catch (error) {
    console.error("Error adding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addNewCategories().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
