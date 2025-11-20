import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
export function FieldSelect({
  fieldType,
  setFieldType,
}: {
  fieldType: string;
  setFieldType: (fieldType: string) => void;
}) {
  const fieldTypeDisplayNames: { [key: string]: string } = {
    text: "Short Answer",
    number: "Number",
    date: "Date",
    time: "Time",
    checkbox: "Checkbox",
    select: "Dropdown",
    textarea: "Paragraph",
    MCQ: "Multiple Choice",
    file: "File Upload",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          {fieldType ? fieldTypeDisplayNames[fieldType] : "Select Field Type"}
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-sm font-semibold ">
          Field Types
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setFieldType("text")}>
            Short Answer
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFieldType("textarea")}>
            Paragraph
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setFieldType("number")}>
            Number
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFieldType("date")}>
            Date
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFieldType("time")}>
            Time
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setFieldType("checkbox")}>
            Checkbox
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFieldType("select")}>
            Dropdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFieldType("MCQ")}>
            Multiple Choice
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setFieldType("file")}>
            File Upload
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
