import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

import { generateReactHelpers } from "@uploadthing/react";
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
