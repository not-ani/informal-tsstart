import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";
import { ResponseForm } from "./-responses/responses";

export const Route = createFileRoute("/_authenticated/form/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const { data } = useQuery(
    convexQuery(api.forms.getFormContext, {
      formId: params.id as Id<"forms">,
    })
  );

  if (!data) {
    return <div>loading</div>;
  }

  return (
    <div className="h-screen relative container mx-auto">
      <h1 className="text-4xl font-bold pt-10"> {data.form.name} </h1>
      <ResponseForm fields={data.fields} formId={data.form._id} />
    </div>
  );
}
