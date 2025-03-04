// Imported Utilities
import CustomError from "./customError";
import supabase from "../utils/supabase.js";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------------------------------

const handleSupabaseUpload = async ({
  file,
  folder,
  allowedTypes,
  maxFileSize,
}) => {
  const fileExt = file.mime.split("/")[1];
  const fileSize = file.size;

  if (!allowedTypes.includes(fileExt)) {
    throw new CustomError(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      400
    );
  }

  if (fileSize > maxFileSize) {
    throw new CustomError(
      `File too large. Max size is ${maxSize / (1024 * 1024)}MB.`,
      400
    );
  }

  const fileName = `${folder}/${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("kulinarya-bucket")
    .upload(fileName, file.buffer, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error)
    throw new CustomError(`Error on uploading file: ${error.message}`, 500);

  return supabase.storage.from("kulinarya-bucket").getPublicUrl(fileName);
};

export default handleSupabaseUpload;
