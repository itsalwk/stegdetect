import { useCallback, useState } from "react";
import { Upload, FileText, Image as ImageIcon, Music, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { ProcessedFile } from "@/types";

interface FileUploadProps {
  onFileUpload: (file: ProcessedFile) => void;
  disabled?: boolean;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUpload = ({ 
  onFileUpload, 
  disabled, 
  label = "File Upload",
  accept = "image/*,.wav",
  maxSizeMB = 300
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'image/png',
      'audio/wav', 'audio/x-wav'
    ];
    
    if (!validTypes.some(type => file.type === type || file.name.endsWith(type.split('/')[1]))) {
      toast.error("Please upload a valid file (PNG or WAV)");
      return false;
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large (max ${maxSizeMB}MB)`);
      return false;
    }
    
    return true;
  };

  const getFileType = (file: File): 'image' | 'text' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) return 'audio';
    return 'text';
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const fileType = getFileType(file);
      const url = URL.createObjectURL(file);
      
      if (fileType === 'image') {
        onFileUpload({
          url,
          name: file.name,
          type: fileType,
          file
        });
        toast.success(`Image uploaded: ${file.name}`);
      } else if (fileType === 'text') {
        // Read text content
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload({
            url,
            name: file.name,
            type: fileType,
            file,
            textContent: content
          });
          toast.success(`Text file uploaded: ${file.name}`);
        };
        reader.readAsText(file);
      } else if (fileType === 'audio') {
        // For audio, just store the file
        onFileUpload({
          url,
          name: file.name,
          type: fileType,
          file
        });
        toast.success(`Audio file uploaded: ${file.name}`);
      }
    } catch (error) {
      toast.error("Failed to process file");
      console.error('File processing error:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <Upload className="w-5 h-5" />
        {label}
      </h3>
      
      <div
        className={`upload-zone p-8 text-center ${
          isDragOver ? 'drag-over' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          {isDragOver ? (
            <FileCheck className="w-12 h-12 text-primary mx-auto" />
          ) : (
            <div className="flex items-center justify-center gap-3">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? 'Drop file here' : 'Drop your file here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse • Image, Audio • Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>✓ Supports PNG (images)</p>
        <p>✓ Supports WAV (audio files)</p>
      </div>
    </div>
  );
};