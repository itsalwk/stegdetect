import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, Check, File, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { StegoMode, ProcessedFile } from "./SteganographyApp";

interface FilePreviewProps {
  uploadedFile: ProcessedFile | null;
  processedFile: ProcessedFile | null;
  extractedData: string | null;
  mode: StegoMode;
}

export const FilePreview = ({
  uploadedFile,
  processedFile,
  extractedData,
  mode
}: FilePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDownload = (file: ProcessedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${file.name}`);
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

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderFilePreview = (file: ProcessedFile) => {
    if (file.type === 'image') {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-48 object-cover rounded-lg border border-border"
        />
      );
    } else if (file.type === 'text') {
      return (
        <div className="bg-muted/20 rounded-lg p-4 border border-border">
          <div className="text-sm font-mono text-foreground max-h-48 overflow-y-auto whitespace-pre-wrap">
            {file.textContent?.slice(0, 500)}
            {file.textContent && file.textContent.length > 500 && '...'}
          </div>
        </div>
      );
    } else if (file.type === 'audio') {
      return (
        <div className="bg-muted/20 rounded-lg p-6 border border-border flex items-center justify-center gap-4">
          <audio ref={audioRef} src={file.url} onEnded={() => setIsPlaying(false)} />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'} Audio
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <File className="w-5 h-5" />
        Preview & Results
      </h3>

      {/* Original File */}
      {uploadedFile && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Original File</h4>
          <div className="relative group">
            {renderFilePreview(uploadedFile)}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(uploadedFile)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {uploadedFile.name} • {uploadedFile.type.toUpperCase()}
          </p>
        </div>
      )}

      {/* Processed File (for hide mode) */}
      {processedFile && mode === "hide" && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">File with Hidden Data</h4>
          <div className="relative group">
            {renderFilePreview(processedFile)}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDownload(processedFile)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{processedFile.name}</p>
          <div className="text-xs text-success bg-success/10 p-2 rounded border border-success/20">
            ✓ Data successfully hidden in file
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
      {!uploadedFile && (
        <div className="text-center py-8 text-muted-foreground">
          <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Upload a file to get started</p>
        </div>
      )}

      {uploadedFile && !processedFile && !extractedData && mode === "hide" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Enter a message and click "Hide Data" to process</p>
        </div>
      )}

      {uploadedFile && !extractedData && mode === "extract" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Click "Extract Hidden Data" to reveal secrets</p>
        </div>
      )}

      {uploadedFile && mode === "analyze" && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Click "Analyze File" to detect hidden data</p>
        </div>
      )}
    </div>
  );
};