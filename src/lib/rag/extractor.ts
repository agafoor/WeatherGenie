import * as mammoth from "mammoth";

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case "pdf": {
      // unpdf is a serverless-safe PDF extractor built on Mozilla PDF.js.
      // Unlike pdf-parse, it does not read test files at module evaluation
      // time and works correctly when bundled by Turbopack on Vercel.
      const { extractText: pdfExtractText } = await import("unpdf");
      const { text } = await pdfExtractText(new Uint8Array(buffer), {
        mergePages: true,
      });
      return text ?? "";
    }
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
