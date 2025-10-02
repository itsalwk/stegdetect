import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { ProcessedImage } from "./SteganographyApp";

interface ImageUploadProps {
  onImageUpload: (image: ProcessedImage) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ onImageUpload, disabled }: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("Image file is too large (max 50MB)");
      return false;
    }
    
    return true;
  };

  const processImageFile = async (file: File) => {
    if (!validateImage(file)) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const url = URL.createObjectURL(file);
        
        onImageUpload({
          url,
          name: file.name,
          data: imageData
        });
        
        toast.success(`Image uploaded: ${file.name}`);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast.error("Failed to process image");
      console.error('Image processing error:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  }, [disabled, onImageUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Image Upload
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
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          {isDragOver ? (
            <FileCheck className="w-12 h-12 text-primary mx-auto" />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? 'Drop image here' : 'Drop your image here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse • PNG, JPEG, WEBP • Max 50MB
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>✓ Supports PNG, JPEG, WEBP formats</p>
        <p>✓ Preserves image quality for optimal steganography</p>
        <p>✓ Automatic format detection and validation</p>
      </div>
    </div>
  );
};