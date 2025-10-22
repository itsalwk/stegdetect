import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { StegoControls } from "./StegoControls";
import { FilePreview } from "./FilePreview";
import { Header } from "./Header";
import { Card } from "@/components/ui/card";

export type StegoMode = "hide" | "extract" | "analyze";

export interface ProcessedFile {
  url: string;
  name: string;
  type: 'image' | 'text' | 'audio';
  file: File;
  data?: ImageData; // For images
  textContent?: string; // For text files
}

const SteganographyApp = () => {
  const [mode, setMode] = useState<StegoMode>("hide");
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <Card className="p-6 shadow-material">
            <FileUpload 
              onFileUpload={setUploadedFile}
              disabled={isProcessing}
            />
          </Card>

          {/* Controls Section */}
          <Card className="p-6 shadow-material">
            <StegoControls
              mode={mode}
              onModeChange={setMode}
              uploadedFile={uploadedFile}
              onProcessed={setProcessedFile}
              onExtracted={setExtractedData}
              isProcessing={isProcessing}
              onProcessingChange={setIsProcessing}
            />
          </Card>

          {/* Preview Section */}
          <Card className="p-6 shadow-material">
            <FilePreview
              uploadedFile={uploadedFile}
              processedFile={processedFile}
              extractedData={extractedData}
              mode={mode}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SteganographyApp;