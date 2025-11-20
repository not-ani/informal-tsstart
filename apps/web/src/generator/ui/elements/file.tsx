import type { FC } from "react";
import type { FieldDef } from "../../lib";
import { useUploadThing } from "@/lib/uploadthing";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FileUploadField: FC<{
  def: FieldDef;
  control: Control;
}> = ({ def, control }) => {
  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {},
  });

  return (
    <FormField
      control={control}
      name={def.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{def.name}</FormLabel>
          <FormControl>
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
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      try {
                        const uploadedFiles = await startUpload(
                          Array.from(files)
                        );
                        if (uploadedFiles && uploadedFiles.length > 0) {
                          // Set the file URL in the form
                          field.onChange(uploadedFiles[0].ufsUrl);
                        }
                      } catch (error) {
                        console.error("Upload failed:", error);
                      }
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="text-sm text-gray-500">Uploading...</div>
                )}
                {field.value && (
                  <div className="text-sm text-green-600">
                    File uploaded: {field.value}
                  </div>
                )}
              </CardContent>
            </Card>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
