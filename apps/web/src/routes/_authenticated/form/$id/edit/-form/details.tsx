import { useRef } from "react";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PermissionWrapper } from "./permission-wrapper";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import { useFormContext } from "@/components/forms/context";
import { useConvexMutation } from "@convex-dev/react-query";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
});
type FormDetails = {
  description?: string | undefined;
  name?: string | undefined;
};

export function FormDetails({ id }: { id: string }) {
  const updateForm = useConvexMutation(api.forms.update);
  const formDetails = useFormContext();
  console.log(formDetails);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formDetails?.name,
      description: formDetails?.description,
    },
  });

  // Debounced save function
  const debouncedSave = (values: z.infer<typeof formSchema>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await updateForm({
          formId: id as Id<"forms">,
          name: values.name,
          description: values.description,
        });
        toast("Your form has been updated");
      } catch (e) {
        console.error(e);
        // Optionally handle error
      }
    }, 600);
  };

  return (
    <PermissionWrapper
      formId={id}
      requiredPermission="edit"
      fallbackMessage="You need editor permissions to modify form details."
    >
      <Card className="w-full">
        <CardHeader className="w-full">
          <CardTitle className="flex flex-col gap-2">
            <Form {...form}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-8 p-2 !text-3xl w-full border-transparent bg-transparent text-left shadow-none hover:bg-input/10 focus-visible:border-none focus-visible:bg-transparent"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debouncedSave({
                              ...form.getValues(),
                              name: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="h-16 p-2 w-full border-transparent bg-transparent text-left shadow-none hover:bg-input/10 focus-visible:border-none focus-visible:bg-transparent"
                          placeholder="Description"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debouncedSave({
                              ...form.getValues(),
                              description: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardTitle>
        </CardHeader>
      </Card>
    </PermissionWrapper>
  );
}
