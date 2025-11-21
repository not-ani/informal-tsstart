import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  CheckCircle,
  Wrench,
  Database,
  Search,
  User,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon } from "lucide-react";

// Fake chat data
const fakeChatData = [
  {
    id: 1,
    type: "user" as const,
    content: "Can you help me create a customer feedback form?",
    timestamp: "2:34 PM",
  },
  {
    id: 2,
    type: "assistant" as const,
    content:
      "I'll help you create a customer feedback form. Let me gather some information about your existing forms and then we can build a comprehensive feedback form together.",
    timestamp: "2:35 PM",
  },
  {
    id: 3,
    type: "tool" as const,
    toolName: "database_query",
    state: "result" as const,
    result: {
      forms: [
        { id: "form_1", title: "Customer Feedback", responses: 127 },
        { id: "form_2", title: "Event Registration", responses: 89 },
        { id: "form_3", title: "Product Survey", responses: 234 },
      ],
      totalForms: 3,
      totalResponses: 450,
    },
  },
  {
    id: 4,
    type: "tool" as const,
    toolName: "search_files",
    state: "result" as const,
    result: {
      files: [
        { name: "form_config.json", size: "2.3KB", type: "configuration" },
        { name: "response_data.csv", size: "15.7KB", type: "data" },
        { name: "analytics_report.pdf", size: "1.2MB", type: "report" },
      ],
      totalFiles: 3,
      totalSize: "1.2MB",
    },
  },
  {
    id: 5,
    type: "assistant" as const,
    content:
      "Perfect! I found your existing forms and configuration files. Based on your current setup, I can help you create a customer feedback form that integrates well with your existing system. Would you like me to start building the form structure?",
    timestamp: "2:36 PM",
  },
];

// Get icon for specific tool types
function getToolIcon(toolName: string) {
  const name = toolName.toLowerCase();

  if (
    name.includes("database") ||
    name.includes("db") ||
    name.includes("query")
  ) {
    return <Database className="h-4 w-4 text-primary" />;
  }
  if (name.includes("search") || name.includes("find")) {
    return <Search className="h-4 w-4 text-primary" />;
  }

  return <Wrench className="h-4 w-4 text-primary" />;
}

interface ChatMessageProps {
  message: (typeof fakeChatData)[0];
}

function ChatMessage({ message }: ChatMessageProps) {
  const [isResultExpanded, setIsResultExpanded] = useState(false);

  const formatJSON = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  if (message.type === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-4"
      >
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 text-sm">
            {message.content}
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (message.type === "assistant") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-start mb-4"
      >
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Bot className="h-4 w-4" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-2 text-sm">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  if (message.type === "tool") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="my-2"
      >
        <Card className="border-l-4 border-l-primary bg-muted/30 hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                {getToolIcon(message.toolName)}
                <span className="font-mono text-sm group-hover:text-primary transition-colors">
                  {message.toolName}
                </span>
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-chart-1/20 text-chart-1 border-chart-1/30"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResultExpanded(!isResultExpanded)}
                className="h-auto p-2 justify-start w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group-hover:bg-muted/30"
              >
                <motion.div
                  animate={{ rotate: isResultExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3 w-3 mr-1" />
                </motion.div>
                View Result
              </Button>

              {isResultExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-chart-1/10 border border-chart-1/20 rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-chart-1">
                      Tool Result
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-chart-1/10"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono text-chart-1">
                    {formatJSON(message.result)}
                  </pre>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}

export function AIChatDemo() {
  return (
    <div className="absolute left-[-104px] top-[-100px] inline-flex w-[600px] flex-col items-start justify-start overflow-hidden rounded-xl">
      <div className="flex flex-col h-full max-w-full bg-background border rounded-lg shadow-sm scale-75 origin-bottom-right">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Ask me anything about your forms
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {fakeChatData.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t">
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
                "bg-muted max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-8 !text-base dark:border-zinc-700"
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
      </div>
    </div>
  );
}

