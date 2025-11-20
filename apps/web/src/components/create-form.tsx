import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@informal-tsstart/backend/convex/_generated/api";

const createFormSchema = z.object({
  title: z.string().min(2, "form title must be at least 2 characters"),
  description: z.string().optional(),
  requiresAuth: z.boolean(),
});

function CreateForm() {
  const mutate = useConvexMutation(api.forms.create);
  const forms = useForm({
    defaultValues: {
      title: "",
      description: "",
      requiresAuth: false,
    },
    validators: {
      onSubmit: createFormSchema,
    },
    onSubmit: ({ value }) => {
      mutate({
        ...value,
      });
    },
  });

  return (

  );
}
