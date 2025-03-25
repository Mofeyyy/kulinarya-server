import supabase from "./supabase.js";
import CustomError from "./customError.js";

const deleteSupabaseFile = async (fileUrl) => {
  if (!fileUrl) throw new CustomError("File URL is required", 400);

  const supabaseBaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/kulinarya-bucket/`;
  if (!fileUrl.startsWith(supabaseBaseUrl)) {
    throw new CustomError("Invalid file URL format", 400);
  }

  // Extract the file path relative to the bucket
  const filePath = fileUrl.replace(supabaseBaseUrl, "");

  if (!filePath) throw new CustomError("Invalid file path extracted", 400);

  // Delete the file from Supabase storage
  const { error } = await supabase.storage
    .from("kulinarya-bucket")
    .remove([filePath]);

  if (error)
    throw new CustomError(`Supabase Deletion Error: ${error.message}`, 400);

  console.log(`Successfully deleted file: ${filePath}`);
};

export default deleteSupabaseFile;
