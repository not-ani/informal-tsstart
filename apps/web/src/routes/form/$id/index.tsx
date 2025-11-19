import { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Copy, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/form/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <FormEditor formId={params.id as Id<"forms">} />;
}

type QuestionType =
  | "short_text"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "date"
  | "time";

type Question = {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options: string[];
  hasOtherOption?: boolean;
};

type FormState = {
  title: string;
  description: string;
  requiresAuth: boolean;
  questions: Question[];
};

function FormEditor({ formId }: { formId: Id<"forms"> }) {
  const form = useQuery(api.forms.get, { id: formId });
  const updateForm = useMutation(api.forms.update);

  const [formState, setFormState] = useState<FormState | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (form && !formState) {
      setFormState({
        title: form.title,
        description: form.description || "",
        requiresAuth: form.requiresAuth,
        // biome-ignore lint/suspicious/noExplicitAny: Backend types are discriminated unions, frontend uses a unified type
        questions: form.questions.map((q: any) => ({
          id: q.id,
          type: q.type,
          title: q.title,
          required: q.required,
          options: q.options || [],
          hasOtherOption: q.hasOtherOption,
        })),
      });
      // Set first question as active if available
      if (form.questions.length > 0) {
        setActiveQuestionId(form.questions[0].id);
      }
    }
  }, [form, formState]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formState) {
      return;
    }
    setFormState({ ...formState, title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formState) {
      return;
    }
    setFormState({ ...formState, description: e.target.value });
  };

  const addQuestion = () => {
    if (!formState) {
      return;
    }
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: "multiple_choice",
      title: "",
      required: false,
      options: ["Option 1"],
    };
    setFormState({
      ...formState,
      questions: [...formState.questions, newQuestion],
    });
    setActiveQuestionId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    if (!formState) {
      return;
    }
    setFormState({
      ...formState,
      questions: formState.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (id: string) => {
    if (!formState) {
      return;
    }
    setFormState({
      ...formState,
      questions: formState.questions.filter((q) => q.id !== id),
    });
    if (activeQuestionId === id) {
      setActiveQuestionId(null);
    }
  };

  const duplicateQuestion = (question: Question) => {
    if (!formState) {
      return;
    }
    const newQuestion = { ...question, id: `q${Date.now()}` };
    const index = formState.questions.findIndex((q) => q.id === question.id);
    const newQuestions = [...formState.questions];
    newQuestions.splice(index + 1, 0, newQuestion);

    setFormState({ ...formState, questions: newQuestions });
    setActiveQuestionId(newQuestion.id);
  };

  const handleSave = async () => {
    if (!formState) {
      return;
    }
    try {
      await updateForm({
        id: formId,
        title: formState.title,
        description: formState.description || undefined,
        requiresAuth: formState.requiresAuth,
        questions: formState.questions.map((q) => {
          const base = {
            id: q.id,
            title: q.title,
            required: q.required,
          };

          if (
            q.type === "multiple_choice" ||
            q.type === "checkboxes" ||
            q.type === "dropdown"
          ) {
            return {
              ...base,
              type: q.type,
              options: q.options,
              hasOtherOption: q.hasOtherOption || false,
            };
          }

          return {
            ...base,
            type: q.type as "short_text" | "paragraph" | "date" | "time",
          };
        }),
      });
      toast.success("Form saved successfully!");
    } catch (error) {
      toast.error("Failed to save form");
      console.error(error);
    }
  };

  if (!formState) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 text-lg">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="mx-auto max-w-3xl pt-4">
        {/* Form Header */}
        <Card className="mb-4 border-t-8 border-t-purple-700">
          <CardHeader>
            <Input
              className="border-none px-0 font-normal text-3xl shadow-none focus-visible:ring-0"
              onChange={handleTitleChange}
              placeholder="Form Title"
              value={formState.title}
            />
            <Input
              className="border-none px-0 text-base shadow-none focus-visible:ring-0"
              onChange={handleDescriptionChange}
              placeholder="Form Description"
              value={formState.description}
            />
          </CardHeader>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {formState.questions.map((question) => (
            <div
              key={question.id}
              onClick={() => setActiveQuestionId(question.id)}
            >
              {activeQuestionId === question.id ? (
                <QuestionEditor
                  onDuplicate={() => duplicateQuestion(question)}
                  onRemove={() => removeQuestion(question.id)}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                  question={question}
                />
              ) : (
                <QuestionPreview question={question} />
              )}
            </div>
          ))}
        </div>

        {/* Floating Toolbar */}
        <div className="-translate-y-1/2 fixed top-1/2 right-4 flex flex-col gap-2 rounded-lg bg-white p-2 shadow-md md:right-[max(1rem,calc(50%-24rem-4rem))]">
          <Button
            onClick={addQuestion}
            size="icon"
            title="Add Question"
            variant="ghost"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Save Button Area */}
        <div className="fixed bottom-0 left-0 z-10 flex w-full justify-end gap-4 border-t bg-white p-4">
          <div className="mr-auto flex items-center gap-2">
            <Checkbox
              checked={formState.requiresAuth}
              id="auth-req"
              onCheckedChange={(c) =>
                setFormState({ ...formState, requiresAuth: !!c })
              }
            />
            <Label htmlFor="auth-req">Requires Login</Label>
          </div>
          <Button
            className="bg-purple-700 hover:bg-purple-800"
            onClick={handleSave}
          >
            Save Form
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionPreview({ question }: { question: Question }) {
  return (
    <Card className="cursor-pointer hover:bg-gray-50">
      <CardContent className="pt-6">
        <div className="mb-2 text-base">
          {question.title || "Question"}
          {question.required && <span className="text-red-500"> *</span>}
        </div>
        <div className="pointer-events-none opacity-50">
          {question.type === "short_text" && (
            <Input disabled placeholder="Short answer text" />
          )}
          {question.type === "paragraph" && (
            <div className="h-20 w-full rounded border border-dashed p-2 text-gray-400 text-sm">
              Long answer text
            </div>
          )}
          {(question.type === "multiple_choice" ||
            question.type === "checkboxes" ||
            question.type === "dropdown") && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div className="flex items-center gap-2" key={i}>
                  {question.type === "multiple_choice" && (
                    <div className="h-4 w-4 rounded-full border" />
                  )}
                  {question.type === "checkboxes" && (
                    <div className="h-4 w-4 rounded border" />
                  )}
                  {question.type === "dropdown" && i === 0 && (
                    <span className="text-gray-500 text-sm">Dropdown...</span>
                  )}
                  <span className="text-sm">{opt}</span>
                </div>
              ))}
            </div>
          )}
          {question.type === "date" && (
            <Input className="w-fit" disabled type="date" />
          )}
          {question.type === "time" && (
            <Input className="w-fit" disabled type="time" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionEditor({
  question,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    onUpdate({
      options: [...question.options, `Option ${question.options.length + 1}`],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <Card className="border-l-4 border-l-blue-600 shadow-lg">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <Input
            className="flex-1 rounded-none border-x-0 border-t-0 border-b bg-gray-50 px-0 font-medium text-base focus-visible:border-purple-700 focus-visible:border-b-2 focus-visible:ring-0"
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Question"
            value={question.title}
          />
          <div className="w-full md:w-60">
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) =>
                onUpdate({ type: e.target.value as QuestionType })
              }
              value={question.type}
            >
              <option value="short_text">Short answer</option>
              <option value="paragraph">Paragraph</option>
              <option value="multiple_choice">Multiple choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
            </select>
          </div>
        </div>

        {/* Options Editor */}
        {(question.type === "multiple_choice" ||
          question.type === "checkboxes" ||
          question.type === "dropdown") && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div className="flex items-center gap-2" key={index}>
                {question.type === "multiple_choice" && (
                  <div className="h-4 w-4 rounded-full border" />
                )}
                {question.type === "checkboxes" && (
                  <div className="h-4 w-4 rounded border" />
                )}
                {question.type === "dropdown" && (
                  <span className="w-4 text-sm">{index + 1}.</span>
                )}

                <Input
                  className="h-8 flex-1 rounded-none border-none px-0 shadow-none hover:border-b focus-visible:border-b focus-visible:ring-0"
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                />
                <Button
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                  onClick={() => removeOption(index)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              {question.type === "multiple_choice" && (
                <div className="h-4 w-4 rounded-full border opacity-0" />
              )}
              {question.type === "checkboxes" && (
                <div className="h-4 w-4 rounded border opacity-0" />
              )}
              {question.type === "dropdown" && (
                <span className="w-4 text-sm text-transparent">.</span>
              )}
              <Button
                className="h-auto p-0 font-normal text-blue-600 hover:bg-transparent hover:text-blue-700"
                onClick={addOption}
                size="sm"
                variant="ghost"
              >
                Add option
              </Button>
            </div>
          </div>
        )}

        <hr className="my-4" />

        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={onDuplicate}
            size="icon"
            title="Duplicate"
            variant="ghost"
          >
            <Copy className="h-5 w-5 text-gray-500" />
          </Button>
          <Button onClick={onRemove} size="icon" title="Delete" variant="ghost">
            <Trash2 className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="mx-2 h-6 w-[1px] bg-gray-300" />
          <div className="flex items-center gap-2">
            <Label className="text-sm" htmlFor={`required-${question.id}`}>
              Required
            </Label>
            <Checkbox
              checked={question.required}
              id={`required-${question.id}`}
              onCheckedChange={(c) => onUpdate({ required: !!c })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
