"use server"

import { CartItem } from "@/types"
import { prisma } from "@/db/prisma"
import { cookies } from "next/headers"
import { convertToPlainObject, formatError, round2 } from "../utils"
import { auth } from "@/auth"
import { cartItemSchema, insertCartSchema } from "../validators"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/prisma/app/generated/prisma/client"

//Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export async function addItemToCart(data: CartItem) {
  try {
    //Check if the cart cookie exists
    const sessionCartId = (await cookies()).get("sessionCartId")?.value
    if (!sessionCartId) throw new Error("Cart session not found")

    //Get Session User ID
    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    //Get Cart
    const cart = await getMyCart()

    //Parse and validate the item
    const item = cartItemSchema.parse(data)

    //Find Product in db
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    })
    if (!product) throw new Error("Product not found")

    if (!cart) {
      //Create a new cart if it doesn't exist
      const newCart = insertCartSchema.parse({
        userId: userId,
        sessionCartId: sessionCartId,
        items: [item],
        ...calcPrice([item]),
      })

      console.log(newCart)

      //Add the new cart to the database
      await prisma.cart.create({
        data: newCart,
      })

      //Revalidate the path
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`,
      }
    } else {
      //Check if the item already exists in the cart
      const existingItem = (cart.items as CartItem[]).find(
        (cartItem) => cartItem.productId === item.productId
      )

      if (existingItem) {
        //Update the existing item quantity
        if (product.stock < existingItem.qty + 1) {
          throw new Error("Not enough stock for this product")
        }
        ;(cart.items as CartItem).find(
          (cartItem) => cartItem.productId === item.productId
        )!.qty = existingItem.qty + 1
      } else {
        if (product.stock < 1) {
          throw new Error("Not enough stock for this product")
        }
        //Add the new item to the cart
        cart.items.push(item)
      }

      //Update the cart in the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      })

      //Revalidate the path
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? "updated in" : "added to"
        } cart`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

export async function getMyCart() {
  //Check if the cart cookie exists
  const sessionCartId = (await cookies()).get("sessionCartId")?.value
  if (!sessionCartId) throw new Error("Cart session not found")

  //Get Session User ID
  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  //Get the cart from the database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  })

  if (!cart) return undefined

  //Convert decimals and return the cart
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  })
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value
    if (!sessionCartId) throw new Error("Cart session not found")

    // Get Product from the database
    const product = await prisma.product.findFirst({
      where: { id: productId },
    })
    if (!product) throw new Error("Product not found")

    //Get the cart
    const cart = await getMyCart()
    if (!cart) throw new Error("Cart not found")

    //Check if the item exists in the cart
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    )
    if (!exist) throw new Error("Item not found")

    if (exist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== productId
      )
    } else {
      // Decrease the quantity of the item
      ;(cart.items as CartItem[]).find(
        (x) => x.productId === productId
      )!.qty -= 1
    }

    //Update the cart in the database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    })

    //Revalidate the path
    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message: `${product.name} removed from cart`,
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
