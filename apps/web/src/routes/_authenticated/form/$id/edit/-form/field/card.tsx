import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2Icon, GripVerticalIcon } from "lucide-react";
import { FieldSelect } from "./select";
import { FieldContent, ChoiceFieldContent } from "./content";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@informal-tsstart/backend/convex/_generated/api";

type Field = FunctionReturnType<typeof api.form_fields.getFormFields>[number];

export function FieldCard({
  field,
  isActive,
  onSelect,
  onDelete,
  onTypeChange,
  editingFieldName,
  onEditingFieldNameChange,
  onSaveFieldName,
  onUpdateOptions,
}: {
  field: Field;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTypeChange: (newType: string) => void;
  editingFieldName: string | null;
  onEditingFieldNameChange: (name: string) => void;
  onSaveFieldName: () => void;
  onUpdateOptions: (options: { name: string; order: number }[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isChoiceField = ["MCQ", "select", "checkbox"].includes(field.type);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        onClick={onSelect}
        className={`${isActive ? "border-2 border-primary" : ""} w-full bg-card`}
      >
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              {...listeners}
              className="cursor-grab flex-shrink-0"
            >
              <GripVerticalIcon className="w-5 h-5" />
            </Button>
            {isActive ? (
              <Input
                key={field._id}
                value={editingFieldName ?? field.name}
                onChange={(e) => onEditingFieldNameChange(e.target.value)}
                onBlur={onSaveFieldName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission if wrapped in one
                    onSaveFieldName();
                  }
                }}
                className="text-lg font-semibold w-full" // Removed min-w-64, let flex handle it
              />
            ) : (
              <CardTitle className="text-lg truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                {field.name}
              </CardTitle>
            )}
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto justify-end sm:justify-start">
            <FieldSelect fieldType={field.type} setFieldType={onTypeChange} />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-shrink-0"
            >
              <Trash2Icon className="w-5 h-5 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isActive ? (
            isChoiceField ? (
              <ChoiceFieldContent
                field={field}
                onUpdateOptions={onUpdateOptions}
              />
            ) : (
              <FieldContent isChoiceField={isChoiceField} field={field} />
            )
          ) : // Preview when not active - can be simpler or same as active based on UX
          // For now, keeping it consistent with active view for simplicity of preview
          isChoiceField ? (
            <ChoiceFieldContent
              field={field}
              onUpdateOptions={onUpdateOptions}
            /> // Or a dedicated preview component
          ) : (
            <FieldContent isChoiceField={isChoiceField} field={field} /> // Or a dedicated preview component
          )}
        </CardContent>
      </Card>
    </div>
  );
}
