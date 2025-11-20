import type { api } from "@informal-tsstart/backend/convex/_generated/api";
import { type ClassValue, clsx } from "clsx";
import type { FunctionReturnType } from "convex/server";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "time"
  | "MCQ"
  | "checkbox"
  | "file";

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "number",
  "date",
  "time",
  "MCQ",
  "checkbox",
  "file",
]);

export const autoCompleteSchema = z.object({
  type: fieldTypeSchema,
});

export type Feild = FunctionReturnType<
  typeof api.form_fields.getFormFields
>[number];
