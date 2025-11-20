import { convexQuery } from "@convex-dev/react-query";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";
import { useQuery } from "@tanstack/react-query";
import type { FunctionReturnType } from "convex/server";
import React from "react";

type FormContext = FunctionReturnType<typeof api.forms.get>;

export const FormContext = React.createContext<FormContext | null>(null);

export function FormContextProvider({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const formContext = useQuery(
    convexQuery(api.forms.get, { formId: id as Id<"forms"> })
  );

  if (!formContext || !formContext.data) {
    return <div>Form not found</div>;
  }

  return (
    <FormContext.Provider value={formContext.data}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = React.useContext(FormContext);

  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormContextProvider");
  }

  return context;
}
