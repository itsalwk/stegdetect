import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { ProcessedFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Search, AlertTriangle, CheckCircle, File as FileIcon, Music, Download, Zap, Binary, Info } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ProcessVisualizer, ProcessStep } from "@/components/ProcessVisualizer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addHistoryEntry } from "@/lib/supabase";

const Steganalysis = () => {
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const [password, setPassword] = useState("");
  const [nBits, setNBits] = useState([4]);
  const [showPassword, setShowPassword] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [extractedFile, setExtractedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ suspicion_level: number; analysis: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "scan", label: "Scanning", icon: Search, description: "Reading bits...", status: "pending" },
    { id: "features", label: "Features", icon: Zap, description: "Extracting PoVs...", status: "pending" },
    { id: "ml", label: "ML Detect", icon: Binary, description: "Running Inference...", status: "pending" },
  ]);

  const updateStep = (id: string, status: ProcessStep["status"]) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  useEffect(() => {
    return () => {
      // Cleanup Object URLs when component unmounts
      if (extractedFile && extractedFile.url.startsWith("blob:")) {
        URL.revokeObjectURL(extractedFile.url);
      }
    };
  }, [extractedFile]);

  const handleExtract = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setExtractedData(null);
    setExtractedFile(null);

    try {
      const result = await api.extractData(
        uploadedFile.file,
        password || undefined,
        nBits[0]
      );

      let status = "Success";
      if (result.type === 'text') {
        setExtractedData(result.content);
        toast.success("Hidden data extracted!");
      } else {
        // Blob handling
        const url = URL.createObjectURL(result);
        const isImage = result.type.startsWith('image/');
        const isAudio = result.type.startsWith('audio/');
        const fileType = isImage ? 'image' : isAudio ? 'audio' : 'file';
        const extension = isImage ? 'png' : isAudio ? 'wav' : 'bin';
        
        setExtractedFile({
          url,
          name: `extracted_data.${extension}`,
          type: fileType,
        });
        toast.success("Hidden file extracted successfully!");
      }

      await addHistoryEntry({
        filename: uploadedFile.name,
        type: "Extraction",
        status: status,
        details: {
          n_bits: nBits[0],
          is_text: result.type === 'text'
        }
      });

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to extract data'}`);
      await addHistoryEntry({
        filename: uploadedFile.name,
        type: "Extraction",
        status: "Error",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setAnalysisResult(null);
    setSteps(s => s.map(step => ({ ...step, status: "pending" })));

    try {
      // Step 1: Scan
      updateStep("scan", "processing");
      setProgress(20);
      await new Promise(r => setTimeout(r, 800));
      updateStep("scan", "completed");

      // Step 2: Features
      updateStep("features", "processing");
      setProgress(50);
      await new Promise(r => setTimeout(r, 800));
      updateStep("features", "completed");

      // Step 3: ML
      updateStep("ml", "processing");
      setProgress(80);

      const result = await api.analyzeImage(uploadedFile.file);

      updateStep("ml", "completed");
      setProgress(100);

      setAnalysisResult(result);
      
      const status = result.suspicion_level > 0.5 ? "Detected" : "Safe";

      await addHistoryEntry({
        filename: uploadedFile.name,
        type: "Steganalysis",
        status: status,
        details: {
          suspicion_level: result.suspicion_level,
          analysis: result.analysis
        }
      });

      if (result.suspicion_level > 0.5) {
        toast.warning(`High suspicion of hidden data (${Math.round(result.suspicion_level * 100)}%)`);
      } else {
        toast.success(`Low suspicion of hidden data (${Math.round(result.suspicion_level * 100)}%)`);
      }

    } catch (error) {
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSteps(s => s.map(step => ({ ...step, status: "pending" })));
      
      await addHistoryEntry({
        filename: uploadedFile.name,
        type: "Steganalysis",
        status: "Error",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Steganalysis</h2>
        <p className="text-muted-foreground font-medium">Extract hidden from image or audio</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-material rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Intercept carrier</CardTitle>
            <CardDescription>Upload a file to analyze or extract data from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload 
              onFileUpload={setUploadedFile}
              disabled={isProcessing}
              maxSizeMB={300}
            />
            {uploadedFile && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {uploadedFile.type === 'audio' ? <Music className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate">{uploadedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{uploadedFile.type}</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>Remove</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Section */}
        <Card className="shadow-material rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Extraction parameters</CardTitle>
            <CardDescription>Extract data or analyze the image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="extract-password">Vault Password (if encrypted)</Label>
              <div className="relative">
                <Input
                  id="extract-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isProcessing}
                  className="pr-10 h-11"
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



            {(isProcessing || progress === 100) && (
              <ProcessVisualizer steps={steps} isActive={isProcessing} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleExtract}
                disabled={!uploadedFile || isProcessing}
                className="w-full h-12 font-bold"
              >
                Extract Data
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!uploadedFile || uploadedFile.type === 'audio' || isProcessing}
                        variant="secondary"
                        className="w-full h-12 font-bold"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {uploadedFile?.type === 'audio' && (
                    <TooltipContent>
                      <p>Forensic analysis is currently only supported for images.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span>Scanning Carrier</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>



        {/* Extracted Data */}
        {(extractedData || extractedFile) && (
          <Card className="shadow-material lg:col-span-2 border-success/30 bg-success/5 p-6 rounded-2xl">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tighter text-success">Extraction Recovered</CardTitle>
              <CardDescription>Content found hidden within the carrier</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Carrier Image Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Original Carrier</div>
                  {uploadedFile?.type === 'image' ? (
                     <div className="bg-background rounded-xl p-2 border shadow-inner flex items-center justify-center min-h-[150px]">
                        <img src={URL.createObjectURL(uploadedFile.file)} alt="Carrier" className="w-full h-auto rounded-lg object-contain max-h-[300px]" />
                     </div>
                  ) : uploadedFile?.type === 'audio' ? (
                     <div className="bg-background rounded-xl p-6 border shadow-inner flex flex-col items-center justify-center min-h-[150px] gap-4">
                        <audio src={URL.createObjectURL(uploadedFile.file)} controls className="w-full" />
                        <div className="p-4 bg-primary/10 rounded-full text-primary">
                           <Music className="w-8 h-8" />
                        </div>
                     </div>
                  ) : null}
                </div>

                {/* Extracted Artifact Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-success">Recovered Artifact</div>
                  {extractedData ? (
                    <Textarea
                      value={extractedData}
                      readOnly
                      className="min-h-[150px] font-mono bg-background/50 text-base p-4 w-full h-full"
                    />
                  ) : extractedFile ? (
                    extractedFile.type === 'image' ? (
                      <div className="bg-background rounded-xl p-2 border border-success/30 shadow-inner flex items-center justify-center min-h-[150px]">
                        <img src={extractedFile.url} alt="Extracted" className="w-full h-auto rounded-lg object-contain max-h-[300px]" />
                      </div>
                    ) : extractedFile.type === 'audio' ? (
                      <div className="bg-background rounded-xl p-6 border border-success/30 shadow-inner flex flex-col items-center justify-center min-h-[150px] gap-4">
                        <audio src={extractedFile.url} controls className="w-full" />
                        <div className="p-4 bg-success/10 rounded-full text-success">
                           <Music className="w-8 h-8" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-background rounded-xl p-6 border border-success/30 shadow-inner flex flex-col items-center justify-center min-h-[150px] gap-4 h-full">
                        <FileIcon className="w-12 h-12 text-success opacity-50" />
                        <span className="text-sm font-medium text-muted-foreground">{extractedFile.name}</span>
                      </div>
                    )
                  ) : null}
                </div>

              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-success font-black uppercase tracking-widest bg-success/10 px-4 py-2 rounded-full border border-success/20 inline-block">
                  ✓ Hidden content successfully extracted
                </div>
                {extractedFile && (
                  <Button onClick={() => {
                    const a = document.createElement('a');
                    a.href = extractedFile.url;
                    a.download = extractedFile.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    toast.success(`Downloaded: ${extractedFile.name}`);
                  }} className="font-bold border-success/30 text-success hover:text-success hover:bg-success/10 bg-success/5" variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <Card className="shadow-material lg:col-span-2 rounded-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Forensic Report</CardTitle>
              <CardDescription>Statistical analysis of the carrier</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                analysisResult.suspicion_level > 0.7 
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : analysisResult.suspicion_level > 0.4
                  ? 'bg-warning/10 border-warning/20 text-warning'
                  : 'bg-success/10 border-success/20 text-success'
              }`}>
                {analysisResult.suspicion_level > 0.5 ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
                <div>
                  <span className="font-black text-2xl uppercase tracking-tighter">
                    {analysisResult.suspicion_level > 0.7 ? 'High Risk' : analysisResult.suspicion_level > 0.4 ? 'Moderate Risk' : 'Low Risk'}
                  </span>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Carrier Verdict</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Forensic Confidence</span>
                  <span>{Math.round(analysisResult.suspicion_level * 100)}%</span>
                </div>
                <Progress value={analysisResult.suspicion_level * 100} className="h-2" />
              </div>

              <div className="text-base font-medium text-muted-foreground bg-muted/30 p-6 rounded-2xl border border-border/50 leading-relaxed">
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
