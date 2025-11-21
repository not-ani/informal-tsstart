import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";

export const ChatContainer = () => {
  return (
    <div>
      <div className="relative flex w-full flex-col gap-4">
        <input
          type="file"
          className="pointer-events-none fixed -top-4 -left-4 size-0.5 opacity-0"
          multiple
          tabIndex={-1}
        />
        <Textarea
          data-testid="multimodal-input"
          placeholder="Send a message..."
          className={cn(
            "bg-muted max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-8 !text-base dark:border-zinc-700",
          )}
          rows={1}
          autoFocus
        />

        <div className="absolute right-0 bottom-0 flex w-fit flex-row justify-end p-2">
          <Button
            data-testid="send-button"
            className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
            disabled={true}
          >
            <ArrowUpIcon size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
