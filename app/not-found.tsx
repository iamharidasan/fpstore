"use client"
import Image from "next/image"
import { APP_NAME } from "@/lib/constants"
import { Button } from "@/components/ui/button"

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Image
        src="/images/logo.svg"
        alt={`${APP_NAME} Logo`}
        width={48}
        height={48}
        priority={true}
      />
      <div className="p-6 w-1/3 rounded-lg shadow-md text-center">
        <h1 className="text-3xl mb-4 font-bold">Not Found</h1>
        <p className="text-destructive">Could not find the requested page.</p>
        <Button
          className="mt-4 ml-2"
          onClick={() => (window.location.href = "/")}
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default NotFound
