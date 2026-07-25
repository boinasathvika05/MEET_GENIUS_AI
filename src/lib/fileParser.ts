export async function parseFileToText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'txt' || extension === 'md') {
      return await file.text();
    } 
    
    if (extension === 'docx' || extension === 'pdf') {
      const formData = new FormData();
      formData.append("file", file);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/api/parse-file`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to parse file.`);
      }
      
      const data = await response.json();
      return data.text;
    } 

    throw new Error(`Unsupported file type: .${extension}`);
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error(error instanceof Error ? error.message : `Failed to read .${extension} file.`);
  }
}
