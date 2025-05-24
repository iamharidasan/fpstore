"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Cart, CartItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions"

const AddToCart = ({ cart, item }: { item: CartItem; cart: Cart }) => {
  const router = useRouter()
  const { toast } = useToast()

  const [isPending, startTransition] = useTransition()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item)
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        })
        return
      }
      toast({
        description: res.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go to Cart
          </ToastAction>
        ),
      })
    })
  }

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      })
      return
    })
  }

  const existItem =
    cart && cart.items.find((i) => i.productId === item.productId)

  return existItem ? (
    <div>
      <Button type="button" onClick={handleRemoveFromCart} variant="outline">
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" onClick={handleAddToCart} variant="outline">
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus />
          Add to Cart
        </>
      )}
    </Button>
  )
}

export default AddToCart
