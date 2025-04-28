"use server"
import { prisma } from "@/db/prisma"
import { convertToPlainObject } from "../utils"
import { LATEST_PRODUCTS_LIMIT } from "../constants"

//Get Latest Products
export const getLatestProducts = async () => {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  })
  return convertToPlainObject(data)
}

//Get Product by Slug
export const getProductBySlug = async (slug: string) => {
  const data = await prisma.product.findFirst({
    where: { slug: slug },
  })
  return convertToPlainObject(data)
}
