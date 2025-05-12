import { PrismaClient } from "@/prisma/app/generated/prisma/client"
import sampleData from "./sample-data"

async function main() {
  const prisma = new PrismaClient()

  // Clear existing data
  await prisma.product.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Seed products
  await prisma.product.createMany({ data: sampleData.products })
  await prisma.user.createMany({ data: sampleData.users })

  console.log("DB seeded successfully.")
}

main()
