import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Form } from "./-form";
import { Chat } from "./-chat";

import { createFileRoute } from "@tanstack/react-router";
import { FormContextProvider } from "@/components/forms/context";

export const Route = createFileRoute("/_authenticated/form/$id/edit/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams({});

  return (
    <main className="h-screen overflow-hidden">
      <FormContextProvider id={params.id}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={60}
            minSize={30}
            maxSize={75}
            className="bg-background flex flex-col gap-10 pt-10 items-center lg:min-w-2/3 h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent "
          >
            <div className="overflow-y-scroll w-full items-center flex flex-col gap-10 pt-10">
              <Form id={params.id} />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="overflow-y-scroll w-full h-full items-center flex flex-col gap-10 pt-10">
            <div className="overflow-y-scroll w-full h-full items-center flex flex-col gap-10 pt-10">
              <Chat />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </FormContextProvider>
    </main>
  );
}
