import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { ProcessedFile } from "@/components/SteganographyApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { SteganographyService } from "@/lib/steganography";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Steganalysis = () => {
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ suspicionLevel: number; analysis: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExtract = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    if (uploadedFile.type !== 'image' || !uploadedFile.data) {
      toast.error("Only image files support data extraction currently");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setExtractedData(null);

    try {
      const stegoService = new SteganographyService();
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 100);

      const data = await stegoService.extractData(
        uploadedFile.data,
        password || undefined
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (data) {
        setExtractedData(data);
        toast.success("Hidden data extracted!");
      } else {
        toast.error("No hidden data found");
      }

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to extract data'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    if (uploadedFile.type !== 'image' || !uploadedFile.data) {
      toast.error("Only image files support analysis currently");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setAnalysisResult(null);

    try {
      const stegoService = new SteganographyService();
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 90));
      }, 150);

      const result = await stegoService.analyzeImage(uploadedFile.data);

      clearInterval(progressInterval);
      setProgress(100);

      setAnalysisResult(result);
      
      if (result.suspicionLevel > 0.5) {
        toast.warning(`High suspicion of hidden data (${Math.round(result.suspicionLevel * 100)}%)`);
      } else {
        toast.success(`Low suspicion of hidden data (${Math.round(result.suspicionLevel * 100)}%)`);
      }

    } catch (error) {
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">File-in-File Steganalysis</h2>
        <p className="text-muted-foreground">Detect and extract hidden data from images, audio, and text files</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Upload Suspicious File</CardTitle>
            <CardDescription>Upload a file to analyze or extract data from</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload 
              onFileUpload={setUploadedFile}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>

        {/* Actions Section */}
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Analysis Tools</CardTitle>
            <CardDescription>Extract data or analyze the image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="extract-password">Password (if encrypted)</Label>
              <div className="relative">
                <Input
                  id="extract-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..."
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

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleExtract}
                disabled={!uploadedFile || isProcessing}
                className="w-full"
              >
                Extract Data
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!uploadedFile || isProcessing}
                variant="secondary"
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>

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

        {/* Extracted Data */}
        {extractedData && (
          <Card className="shadow-material lg:col-span-2">
            <CardHeader>
              <CardTitle>Extracted Data</CardTitle>
              <CardDescription>Hidden message found in the image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={extractedData}
                readOnly
                className="min-h-[150px] font-mono"
              />
              <div className="text-sm text-success bg-success/10 p-3 rounded-lg border border-success/20">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Hidden data successfully extracted
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <Card className="shadow-material lg:col-span-2">
            <CardHeader>
              <CardTitle>Analysis Report</CardTitle>
              <CardDescription>Statistical analysis of the image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                analysisResult.suspicionLevel > 0.7 
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : analysisResult.suspicionLevel > 0.4
                  ? 'bg-warning/10 border-warning/20 text-warning'
                  : 'bg-success/10 border-success/20 text-success'
              }`}>
                {analysisResult.suspicionLevel > 0.5 ? (
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                )}
                <span className="font-semibold">
                  {analysisResult.suspicionLevel > 0.7 ? 'HIGH' : analysisResult.suspicionLevel > 0.4 ? 'MEDIUM' : 'LOW'}
                </span>
                {' '}suspicion of hidden data
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span className="font-semibold">{Math.round(analysisResult.suspicionLevel * 100)}%</span>
                </div>
                <Progress value={analysisResult.suspicionLevel * 100} />
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>{analysisResult.analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Steganalysis;
