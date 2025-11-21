import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVerticalIcon } from "lucide-react";


// Demo field data
const demoFields = [
  {
    id: "1",
    name: "Full Name",
    type: "text",
    isActive: true,
  },
  {
    id: "2", 
    name: "Email Address",
    type: "text",
    isActive: false,
  },
  
];

function FieldContent({ field }: { field: typeof demoFields[0] }) {
  const isChoiceField = ["MCQ", "select", "checkbox"].includes(field.type);
  const commonInputClass = "my-2 p-2 border rounded";

  if (isChoiceField) {
    return (
      <div className="space-y-2 my-2">
       
      </div>
    );
  }

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
    case "textarea":
      return (
        <Textarea
          placeholder="Paragraph text"
          disabled
          className={commonInputClass}
        />
      );
    default:
      return (
        <div className="my-2 p-2">Unsupported field type for preview.</div>
      );
  }
}

function FieldCard({ field }: { field: typeof demoFields[0] }) {
  return (
    <Card
      className={`${field.isActive ? "border-2 border-primary" : ""} w-full bg-card`}
    >
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab flex-shrink-0"
          >
            <GripVerticalIcon className="w-5 h-5" />
          </Button>
          {field.isActive ? (
            <Input
              value={field.name}
              className="text-lg font-semibold w-full"
            />
          ) : (
            <CardTitle className="text-lg truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {field.name}
            </CardTitle>
          )}
        </div>
       
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <FieldContent field={field} />
      </CardContent>
    </Card>
  );
}

export function FieldCardsDemo() {
  return (
    <div className="w-full top-[-200px] mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Form Builder Demo</h2>
        <p className="text-muted-foreground">
          Drag and drop field cards to create your perfect form
        </p>
      </div>
      
      <div className="grid gap-4">
        {demoFields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button className="bg-primary hover:bg-primary/90">
          Add New Field
        </Button>
      </div>
    </div>
  );
} 