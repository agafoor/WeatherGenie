import * as mammoth from "mammoth";

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case "pdf": {
      // Import the internal module directly to avoid pdf-parse's index.js
      // entry point, which checks `!module.parent` and tries to load
      // ./test/data/05-versions-space.pdf — a path that doesn't exist when
      // Turbopack bundles the package on Vercel.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse");
      const result = await pdfParse(buffer);
      return result.text;
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
