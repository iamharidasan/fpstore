import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//Convert prisma object to JSON
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

//Format numbers with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".")
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`
}

//Format errors
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any): string {
  if (error.name === "ZodError") {
    //Handle zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    )
    return fieldErrors.join(". ")
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    //Handle prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Unknown field"
    return `A user with this ${
      field.chartAt(0).toUpperCase() + field.slice(1)
    } already exists`
  } else {
    //Handle other errors
    return typeof error === "string" ? error : JSON.stringify(error.message)
  }
}

//Round numbers to two decimal places
export function round2(value: number | string): number {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100
  } else {
    throw new Error("Value must be a number or a string representing a number")
  }
}
