import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Lock, Unlock, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { StegoMode, ProcessedImage } from "./SteganographyApp";
import { SteganographyService } from "@/lib/steganography";

interface StegoControlsProps {
  mode: StegoMode;
  onModeChange: (mode: StegoMode) => void;
  uploadedImage: ProcessedImage | null;
  onProcessed: (image: ProcessedImage) => void;
  onExtracted: (data: string) => void;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
}

export const StegoControls = ({
  mode,
  onModeChange,
  uploadedImage,
  onProcessed,
  onExtracted,
  isProcessing,
  onProcessingChange
}: StegoControlsProps) => {
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleHideData = async () => {
    if (!uploadedImage || !message.trim()) {
      toast.error("Please upload an image and enter a message");
      return;
    }

    onProcessingChange(true);
    setProgress(0);

    try {
      const stegoService = new SteganographyService();
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await stegoService.hideData(
        uploadedImage.data!,
        message,
        password || undefined
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Create blob URL for download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = result.width;
      canvas.height = result.height;
      ctx?.putImageData(result, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onProcessed({
            url,
            name: `hidden_${uploadedImage.name}`,
            data: result
          });
          toast.success("Data hidden successfully!");
        }
      }, 'image/png');

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to hide data'}`);
    } finally {
      onProcessingChange(false);
      setProgress(0);
    }
  };

  const handleExtractData = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image");
      return;
    }

    onProcessingChange(true);
    setProgress(0);

    try {
      const stegoService = new SteganographyService();
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 100);

      const extractedData = await stegoService.extractData(
        uploadedImage.data!,
        password || undefined
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (extractedData) {
        onExtracted(extractedData);
        toast.success("Data extracted successfully!");
      } else {
        toast.error("No hidden data found");
      }

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to extract data'}`);
    } finally {
      onProcessingChange(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image");
      return;
    }

    onProcessingChange(true);
    setProgress(0);

    try {
      const stegoService = new SteganographyService();
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 90));
      }, 150);

      const analysis = await stegoService.analyzeImage(uploadedImage.data!);

      clearInterval(progressInterval);
      setProgress(100);

      const suspicion = analysis.suspicionLevel;
      const message = `Analysis complete: ${suspicion > 0.7 ? 'HIGH' : suspicion > 0.4 ? 'MEDIUM' : 'LOW'} suspicion of hidden data (${Math.round(suspicion * 100)}%)`;
      
      if (suspicion > 0.5) {
        toast.warning(message);
      } else {
        toast.success(message);
      }

    } catch (error) {
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      onProcessingChange(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <Lock className="w-5 h-5" />
        Steganography Controls
      </h3>

      <Tabs value={mode} onValueChange={(value) => onModeChange(value as StegoMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hide" className="flex items-center gap-2">
            <EyeOff className="w-4 h-4" />
            Hide
          </TabsTrigger>
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Extract
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Analyze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hide" className="space-y-4">
          <div>
            <Label htmlFor="message">Secret Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your secret message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isProcessing}
              className="min-h-[100px] bg-input"
            />
          </div>

          <div>
            <Label htmlFor="password">Encryption Password (Optional)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password for encryption..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
                className="pr-10 bg-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleHideData}
            disabled={!uploadedImage || !message.trim() || isProcessing}
            className="w-full cyber-glow"
          >
            {isProcessing ? "Hiding Data..." : "Hide Data in Image"}
          </Button>
        </TabsContent>

        <TabsContent value="extract" className="space-y-4">
          <div>
            <Label htmlFor="extract-password">Decryption Password (if encrypted)</Label>
            <div className="relative">
              <Input
                id="extract-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password if data was encrypted..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
                className="pr-10 bg-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleExtractData}
            disabled={!uploadedImage || isProcessing}
            className="w-full"
            variant="secondary"
          >
            {isProcessing ? "Extracting Data..." : "Extract Hidden Data"}
          </Button>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Analyzes LSB patterns for anomalies</p>
            <p>• Detects statistical irregularities</p>
            <p>• Provides suspicion probability score</p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!uploadedImage || isProcessing}
            className="w-full"
            variant="outline"
          >
            {isProcessing ? "Analyzing..." : "Analyze Image"}
          </Button>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="cyber-glow" />
        </div>
      )}
    </div>
  );
};