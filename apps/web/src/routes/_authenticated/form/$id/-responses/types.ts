import type { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type QueryData = FunctionReturnType<typeof api.forms.getFormContext>;
