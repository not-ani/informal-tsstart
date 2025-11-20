import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { autoCompleteSchema, type FieldType } from "@/lib/utils";
import { FieldCard } from "./card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";
import { api } from "@informal-tsstart/backend/convex/_generated/api";

export function FormFields({
  id,
  defaultRequired,
}: {
  id: string;
  defaultRequired: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<Id<"form_fields"> | null>(
    null
  );
  const { object, submit } = useObject({
    api: "/api/complete",
    schema: autoCompleteSchema,
  });
  const { data: formFields } = useQuery(
    convexQuery(api.form_fields.getFormFields, { formId: id })
  );
  const deleteField = useConvexMutation(api.form_fields.deleteField);
  const updateField = useConvexMutation(api.form_fields.updateField);

  const addField = useConvexMutation(api.form_fields.addField);
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && formFields) {
      const oldIndex = formFields.findIndex((field) => field._id === active.id);
      const newIndex = formFields.findIndex((field) => field._id === over?.id);
      const newOrder = arrayMove(formFields, oldIndex, newIndex);
      // Optimistically update the UI
      // TODO: You might want to revert this change if the mutation fails
      // queryClient.setQueryData(['formFields', id], newOrder);

      newOrder.forEach((field, index) => {
        if (field.order !== index + 1) {
          updateField({
            fieldId: field._id,
            order: index + 1,
            formId: id as Id<"forms">,
          });
        }
      });
    }
  }

  function handleTypeChange(type: string): void {
    if (selectedItem) {
      updateField({
        fieldId: selectedItem,
        type: type as FieldType,
        formId: id as Id<"forms">,
      });
    }
  }

  function handleDeleteField(fieldId: Id<"form_fields">): void {
    deleteField({ fieldId });
    if (selectedItem === fieldId) {
      setSelectedItem(null);
      setEditingFieldName(null);
    }
  }

  async function createField() {
    const newFieldId = await addField({
      formId: id,
      name: "New Field",
      type: "text",
      order: formFields?.length ? formFields.length + 1 : 1,
      required: defaultRequired,
    });
    if (newFieldId) {
      setSelectedItem(newFieldId);
      // Reset editing field name to the initial value for new fields
      setEditingFieldName("New Field");
    }
  }

  function handleFieldNameChange(newName: string) {
    if (selectedItem && editingFieldName !== null) {
      updateField({
        fieldId: selectedItem,
        name: newName,
        formId: id as Id<"forms">,
      });
      submit({
        formId: id,
        fieldId: selectedItem,
        content: newName,
      });
      if (object && object.type) {
        handleTypeChange(object.type);
      }
    }
  }

  function handleSaveFieldName() {
    if (selectedItem && editingFieldName !== null) {
      handleFieldNameChange(editingFieldName);
      submit({
        formId: id,
        fieldId: selectedItem,
        content: editingFieldName,
      });
      if (object && object.type) {
        handleTypeChange(object.type);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={formFields ? formFields.map((field) => field._id) : []}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4 w-full">
          {formFields &&
            formFields.map((field) => (
              <FieldCard
                key={field._id}
                field={field}
                isActive={selectedItem === field._id}
                onSelect={() => {
                  setSelectedItem(field._id);
                  setEditingFieldName(field.name);
                }}
                onDelete={() => handleDeleteField(field._id)}
                onTypeChange={(newType) =>
                  updateField({
                    fieldId: field._id,
                    type: newType as FieldType,
                    formId: id as Id<"forms">,
                  })
                }
                editingFieldName={
                  selectedItem === field._id ? editingFieldName : null
                }
                onEditingFieldNameChange={
                  selectedItem === field._id ? setEditingFieldName : () => {}
                }
                onSaveFieldName={handleSaveFieldName}
                onUpdateOptions={(options: { name: string; order: number }[]) =>
                  updateField({
                    fieldId: field._id,
                    selectOptions: options,
                    formId: id as Id<"forms">,
                  })
                }
              />
            ))}
          <Button
            className=" w-full h-10 bg-transparent border-dashed border-2 border-gray-300"
            variant="outline"
            onClick={createField}
          >
            <PlusIcon className="w-4 h-4" />
            Create Field
          </Button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
