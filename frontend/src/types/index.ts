export interface ProcessedFile {
  url: string;
  name: string;
  type: 'image' | 'text' | 'audio';
  file: File;
  data?: ImageData; // For images
  textContent?: string; // For text files
}
