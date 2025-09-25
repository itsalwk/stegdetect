import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { StegoControls } from "./StegoControls";
import { ImagePreview } from "./ImagePreview";
import { Header } from "./Header";
import { Card } from "@/components/ui/card";

export type StegoMode = "hide" | "extract" | "analyze";

export interface ProcessedImage {
  url: string;
  name: string;
  data?: ImageData;
}

const SteganographyApp = () => {
  const [mode, setMode] = useState<StegoMode>("hide");
  const [uploadedImage, setUploadedImage] = useState<ProcessedImage | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <Card className="sketch-card p-6 sketch-shadow">
            <ImageUpload 
              onImageUpload={setUploadedImage}
              disabled={isProcessing}
            />
          </Card>

          {/* Controls Section */}
          <Card className="sketch-card p-6 sketch-shadow">
            <StegoControls
              mode={mode}
              onModeChange={setMode}
              uploadedImage={uploadedImage}
              onProcessed={setProcessedImage}
              onExtracted={setExtractedData}
              isProcessing={isProcessing}
              onProcessingChange={setIsProcessing}
            />
          </Card>

          {/* Preview Section */}
          <Card className="sketch-card p-6 sketch-shadow">
            <ImagePreview
              uploadedImage={uploadedImage}
              processedImage={processedImage}
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