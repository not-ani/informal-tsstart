/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Feild } from "@/lib/utils";

export function FieldContent({
  field,
  isChoiceField,
}: {
  field: Feild;
  isChoiceField: boolean;
}) {
  if (isChoiceField) {
    return <ChoiceFieldPreview field={field} />;
  }
  // Render a simplified preview when not active, or for non-choice fields when active
  const commonInputClass = "my-2 p-2 border rounded";
  switch (field.type) {
    case "text":
      return (
        <Input
          placeholder="Short answer text"
          disabled
          className={commonInputClass}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder="Number"
          disabled
          className={commonInputClass}
        />
      );
    case "date":
      return <Input type="date" disabled className={commonInputClass} />;
    case "time":
      return <Input type="time" disabled className={commonInputClass} />;
    case "checkbox": // Checkbox preview (non-interactive if not in ChoiceFieldContent)
      return (
        <div className="flex items-center space-x-2 my-2">
          <Input type="checkbox" disabled id={`prev-${field._id}`} />{" "}
          <label htmlFor={`prev-${field._id}`}>Checkbox</label>
        </div>
      );
    case "select": // Select preview
      return (
        <Input placeholder="Dropdown" disabled className={commonInputClass} />
      );
    case "textarea":
      return (
        <Textarea
          placeholder="Paragraph text"
          disabled
          className={commonInputClass}
        />
      );
    case "MCQ": // MCQ preview (non-interactive if not in ChoiceFieldContent)
      return (
        <Input
          placeholder="Multiple Choice"
          disabled
          className={commonInputClass}
        />
      );
    case "file":
      return <Input type="file" disabled className={commonInputClass} />;
    default:
      return (
        <div className="my-2 p-2">Unsupported field type for preview.</div>
      );
  }
}

function SortableItem({
  id,
  children,
  field,
}: {
  id: string | number;
  children: React.ReactNode;
  field: Feild;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // the number of options is > 1
  if (field.selectOptions && field.selectOptions.length > 1) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2"
      >
        <Button variant="ghost" size="icon" className="cursor-grab">
          <GripVerticalIcon className="w-4 h-4 text-gray-500" />
        </Button>
        {children}
      </div>
    );
  }
}

export function ChoiceFieldPreview({ field }: { field: Feild }) {
  const options = field.selectOptions || [];
  return (
    <div className="space-y-2 my-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          {field.type === "checkbox" && (
            <Input
              type="checkbox"
              readOnly
              name={`checkbox-${field._id}`}
              disabled
              className="cursor-not-allowed"
            />
          )}
          {field.type === "MCQ" && (
            <Input
              type="radio"
              readOnly
              name={`mcq-${field._id}`}
              disabled
              className="cursor-not-allowed"
            />
          )}
          <Input
            value={option.name}
            name={`option-${field._id}`}
            readOnly
            className="flex-grow"
            placeholder={`Option ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

export function ChoiceFieldContent({
  field,
  onUpdateOptions,
}: {
  field: Feild;
  onUpdateOptions: (options: { name: string; order: number }[]) => void;
}) {
  const [options, setOptions] = useState<
    { id: string; name: string; order: number }[]
  >(
    (field.selectOptions || []).map((opt, index) => ({
      ...opt,
      id: `option-${field._id}-${index}`,
    }))
  );
  const [newOption, setNewOption] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      const newOpt = {
        name: newOption.trim(),
        order: options.length + 1,
        id: `option-${field._id}-${options.length}`,
      };
      const updatedOptions = [...options, newOpt];
      setOptions(updatedOptions);
      onUpdateOptions(updatedOptions.map(({ id, ...rest }) => rest));
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, order: i + 1 }));
    setOptions(updatedOptions);
    onUpdateOptions(updatedOptions.map(({ id: _, ...rest }) => rest));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = options.map((opt, i) =>
      i === index ? { ...opt, name: value } : opt
    );
    setOptions(updatedOptions);
    onUpdateOptions(updatedOptions.map(({ id: _, ...rest }) => rest));
  };

  useEffect(() => {
    setOptions(
      (field.selectOptions || []).map((opt, index) => ({
        ...opt,
        id: `option-${field._id}-${index}`,
      }))
    );
  }, [field.selectOptions, field._id]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex).map((opt, i) => ({
          ...opt,
          order: i + 1,
        }));
        onUpdateOptions(newArray.map(({ id: _, ...rest }) => rest));
        return newArray;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={options.map((opt) => opt.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 my-2">
          {options.map((option, index) => (
            <SortableItem key={option.id} id={option.id} field={field}>
              <div className="flex items-center gap-2 w-full">
                {field.type === "checkbox" && (
                  <Input
                    type="checkbox"
                    disabled
                    className="cursor-not-allowed"
                  />
                )}
                {field.type === "MCQ" && (
                  <Input
                    type="radio"
                    disabled
                    name={`mcq-${field._id}`}
                    className="cursor-not-allowed"
                  />
                )}
                <Input
                  value={option.name}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-grow"
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                >
                  <Trash2Icon className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </SortableItem>
          ))}
          <div className="flex items-center gap-2 ml-10">
            {" "}
            {/* Added ml-10 to align with draggable items */}
            {field.type === "checkbox" && (
              <Input type="checkbox" disabled className="opacity-0" />
            )}
            {field.type === "MCQ" && (
              <Input type="radio" disabled className="opacity-0" />
            )}
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add new option"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent form submission if wrapped in a form
                  handleAddOption();
                }
              }}
              className="flex-grow"
            />
            <Button onClick={handleAddOption} variant="outline" size="sm">
              Add
            </Button>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
