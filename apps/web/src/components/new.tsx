import { Button } from "@/components/ui/button";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";

export const New = () => {
  const createForm = useConvexMutation(api.forms.create);
  const router = useNavigate();

  const handleCreateClick = async () => {
    const newFormId = await createForm({});
    router({
      to: `/form/$id/edit`,
      params: {
        id: newFormId,
      },
    });
    return;
  };

  return (
    <Button className="bg-primary" onClick={handleCreateClick}>
      Create Form
    </Button>
  );
};
