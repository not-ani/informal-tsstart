import { useQuery } from "@tanstack/react-query";
import { FormDetails } from "./details";
import { FormFields } from "./field";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";

export function Form({ id }: { id: string }) {
  const { data: formDetails } = useQuery(
    convexQuery(api.forms.get, { formId: id as Id<"forms"> })
  );
  if (!formDetails) {
    return <div>Form not found</div>;
  }
  return (
    <div className="w-2/3 md:w-4/5 lg:w-5/8  px-4 ">
      <FormDetails id={id} />
      <div className="mt-10">
        <FormFields
          id={id}
          defaultRequired={formDetails.defaultRequired ?? false}
        />
      </div>
    </div>
  );
}
