import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import type { FieldDef } from "../../lib";
import type { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MCQField({
  def,
  control,
}: {
  def: FieldDef;
  control: Control;
}) {
  return (
    <FormField
      key={def._id}
      control={control}
      name={def.name}
      render={({ field }) => (
        <FormItem>
          <Card className="w-full">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div />

                <FormLabel>
                  <CardTitle className="text-lg truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    {field.name}
                  </CardTitle>
                </FormLabel>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto justify-end sm:justify-start"></div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {def.selectOptions?.map((opt) => (
                    <SelectItem
                      key={`${opt.name}-${opt.order}-select`}
                      value={opt.name}
                    >
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
