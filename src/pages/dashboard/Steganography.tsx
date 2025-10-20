import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { ProcessedImage } from "@/components/SteganographyApp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Download } from "lucide-react";
import { SteganographyService } from "@/lib/steganography";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Steganography = () => {
  const [uploadedImage, setUploadedImage] = useState<ProcessedImage | null>(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleEmbedData = async () => {
    if (!uploadedImage || !message.trim()) {
      toast.error("Please upload an image and enter a message");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const stegoService = new SteganographyService();
      
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

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = result.width;
      canvas.height = result.height;
      ctx?.putImageData(result, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setProcessedImage({
            url,
            name: `stego_${uploadedImage.name}`,
            data: result
          });
          toast.success("Data embedded successfully!");
        }
      }, 'image/png');

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to hide data'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${image.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Steganography</h2>
        <p className="text-muted-foreground">Hide secret messages in images</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>Choose an image to hide your secret message</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageUpload={setUploadedImage}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>

        {/* Controls Section */}
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle>Secret Message</CardTitle>
            <CardDescription>Enter the data you want to hide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your secret message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isProcessing}
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="password">Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Encryption password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isProcessing}
                  className="pr-10"
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
              onClick={handleEmbedData}
              disabled={!uploadedImage || !message.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Embedding..." : "Embed Data"}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        {processedImage && (
          <Card className="glass-card rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Your image with hidden data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <img
                  src={processedImage.url}
                  alt="Processed"
                  className="w-full max-w-md mx-auto rounded-lg border border-border"
                />
              </div>
              <div className="flex justify-center">
                <Button onClick={() => handleDownload(processedImage)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              </div>
              <div className="text-sm text-success bg-success/10 p-3 rounded-xl border border-success/20 text-center">
                ✓ Data successfully hidden in image
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Steganography;
