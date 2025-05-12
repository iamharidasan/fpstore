import { PrismaClient } from "@/prisma/app/generated/prisma/client"
import sampleData from "./sample-data"

async function main() {
  const prisma = new PrismaClient()

  // Clear existing data
  await prisma.product.deleteMany()

  // Seed products
  await prisma.product.createMany({ data: sampleData.products })

  console.log("DB seeded successfully.")
}

main()
