import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { StegoMode, ProcessedImage } from "./SteganographyApp";

interface ImagePreviewProps {
  uploadedImage: ProcessedImage | null;
  processedImage: ProcessedImage | null;
  extractedData: string | null;
  mode: StegoMode;
}

export const ImagePreview = ({
  uploadedImage,
  processedImage,
  extractedData,
  mode
}: ImagePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${image.name}`);
  };

  const handleCopyText = async () => {
    if (!extractedData) return;
    
    try {
      await navigator.clipboard.writeText(extractedData);
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Preview & Results
      </h3>

      {/* Original Image */}
      {uploadedImage && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Original Image</h4>
          <div className="relative group">
            <img
              src={uploadedImage.url}
              alt="Original"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(uploadedImage)}
                className="cyber-glow"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{uploadedImage.name}</p>
        </div>
      )}

      {/* Processed Image (for hide mode) */}
      {processedImage && mode === "hide" && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Image with Hidden Data</h4>
          <div className="relative group">
            <img
              src={processedImage.url}
              alt="Processed"
              className="w-full h-48 object-cover rounded-lg border border-primary"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDownload(processedImage)}
                className="cyber-glow"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{processedImage.name}</p>
          <div className="text-xs text-success bg-success/10 p-2 rounded border border-success/20">
            ✓ Data successfully hidden in image
          </div>
        </div>
      )}

      {/* Extracted Data */}
      {extractedData && mode === "extract" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Extracted Secret Data</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="text-primary"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Textarea
            value={extractedData}
            readOnly
            className="min-h-[120px] bg-success/5 border-success/20 font-mono text-sm"
          />
          <div className="text-xs text-success bg-success/10 p-2 rounded border border-success/20">
            ✓ Hidden data successfully extracted
          </div>
        </div>
      )}

      {/* Instructions based on mode */}
      {!uploadedImage && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Upload an image to get started</p>
        </div>
      )}

      {uploadedImage && !processedImage && !extractedData && mode === "hide" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Enter a message and click "Hide Data" to process</p>
        </div>
      )}

      {uploadedImage && !extractedData && mode === "extract" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Click "Extract Hidden Data" to reveal secrets</p>
        </div>
      )}

      {uploadedImage && mode === "analyze" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Click "Analyze Image" to detect hidden data</p>
        </div>
      )}
    </div>
  );
};