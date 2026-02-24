import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Download, Play, Pause, File as FileIcon, Music, Upload, Zap, Lock, Binary, Info } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ProcessVisualizer, ProcessStep } from "@/components/ProcessVisualizer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { uploadToSupabase, addHistoryEntry } from "@/lib/supabase";
import { ProcessedFile } from "@/types";

const Steganography = () => {
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const [secretType, setSecretType] = useState<"text" | "file">("text");
  const [message, setMessage] = useState("");
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [nBits, setNBits] = useState([4]);
  const [showPassword, setShowPassword] = useState(false);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "compress", label: "Compress", icon: Zap, description: "Shrinking payload...", status: "pending" },
    { id: "encrypt", label: "Encrypt", icon: Lock, description: "Securing data...", status: "pending" },
    { id: "embed", label: "Embed", icon: Binary, description: "LSB Injection...", status: "pending" },
  ]);

  const updateStep = (id: string, status: ProcessStep["status"]) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  useEffect(() => {
    return () => {
      // Cleanup Object URLs when component unmounts
      if (processedFile && processedFile.url.startsWith("blob:")) {
        URL.revokeObjectURL(processedFile.url);
      }
    };
  }, [processedFile]);

  const handleEmbedData = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a carrier file");
      return;
    }

    if (secretType === "text" && !message.trim()) {
      toast.error("Please enter a secret message");
      return;
    }

    if (secretType === "file" && !secretFile) {
      toast.error("Please select a secret file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Cleanup previous blob URL if exists before setting a new one
    if (processedFile && processedFile.url.startsWith("blob:")) {
      URL.revokeObjectURL(processedFile.url);
    }
    setProcessedFile(null);
    
    // Initializing steps
    setSteps(s => s.map(step => ({ ...step, status: "pending" })));

    try {
      // Step 1: Compress
      updateStep("compress", "processing");
      setProgress(20);
      await new Promise(r => setTimeout(r, 800));
      updateStep("compress", "completed");

      // Step 2: Encrypt
      updateStep("encrypt", "processing");
      setProgress(50);
      await new Promise(r => setTimeout(r, 800));
      updateStep("encrypt", "completed");

      // Step 3: Embed
      updateStep("embed", "processing");
      setProgress(80);

      const blob = await api.hideData(
        uploadedFile.file,
        secretFile,
        message,
        password || undefined,
        nBits[0]
      );

      updateStep("embed", "completed");
      setProgress(90);

      const isAudio = uploadedFile.type === 'audio';
      const extension = isAudio ? 'wav' : 'png';
      const mimeType = isAudio ? 'audio/wav' : 'image/png';
      const outputFilename = `stego_${uploadedFile.name.split('.')[0]}.${extension}`;
      const resultFile = new File([blob], outputFilename, { type: mimeType });

      // Upload to Supabase and save history
      let resultUrl = "";
      try {
        const publicUrl = await uploadToSupabase(resultFile);
        if (publicUrl) resultUrl = publicUrl;
      } catch (e) {
        console.warn("Failed to upload to Supabase, continuing with local URL");
      }

      await addHistoryEntry({
        filename: outputFilename,
        type: "Steganography",
        status: "Success",
        result_url: resultUrl,
        details: {
          n_bits: nBits[0],
          carrier_type: uploadedFile.type,
          payload_type: secretType
        }
      });

      const url = URL.createObjectURL(blob);
      setProcessedFile({
        url,
        name: outputFilename,
        type: isAudio ? 'audio' : 'image',
        file: resultFile,
      });
      
      setProgress(100);
      toast.success("Data embedded and history saved!");

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to hide data'}`);
      setSteps(s => s.map(step => ({ ...step, status: "pending" })));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (file: ProcessedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${file.name}`);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Steganography</h2>
          <p className="text-muted-foreground">Hide messages, audio, or images inside image or audio</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Step 1: Carrier Upload */}
        <Card className="shadow-material rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
               Carrier Media
            </CardTitle>
            <CardDescription>Select the image or audio file that will hide the secret</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              onFileUpload={setUploadedFile}
              disabled={isProcessing}
            />
            {uploadedFile && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {uploadedFile.type === 'audio' ? <Music className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{uploadedFile.type}</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>Remove</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Secret Payload */}
        <Card className="shadow-material rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
               Secret Payload
            </CardTitle>
            <CardDescription>What do you want to hide?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={secretType} onValueChange={(v) => setSecretType(v as "text" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Message</TabsTrigger>
                <TabsTrigger value="file">File (Audio/Image)</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="pt-4">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter secret text..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </TabsContent>
              <TabsContent value="file" className="pt-4 space-y-3">
                <Label>Select Secret File</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => document.getElementById('secret-file-input')?.click()}
                >
                   <input 
                     id="secret-file-input"
                     type="file"
                     className="hidden"
                     onChange={(e) => {
                     const file = e.target.files?.[0] || null;
                     if (file && file.size > 100 * 1024 * 1024) {
                       toast.error("Secret file is too large (max 100MB)");
                       return;
                     }
                     setSecretFile(file);
                   }}
                 />
                   {secretFile ? (
                     <div className="flex items-center justify-center gap-2 text-primary font-bold">
                        <FileIcon className="w-5 h-5" />
                        {secretFile.name}
                     </div>
                   ) : (
                     <div className="text-muted-foreground">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Click to upload secret file</p>
                     </div>
                   )}
                </div>
              </TabsContent>
            </Tabs>



            <div className="space-y-2">
              <Label htmlFor="password">Security Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Encryption password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <Button
              onClick={handleEmbedData}
              disabled={!uploadedFile || (secretType === 'text' ? !message.trim() : !secretFile) || isProcessing}
              className="w-full h-12 text-base font-bold shadow-lg"
            >
              {isProcessing ? "Processing Algorithm..." : "Hide Secret Data"}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span>Engine Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Result */}
        {processedFile && (
          <Card className="shadow-material rounded-2xl lg:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tighter text-primary">Artifact Ready</CardTitle>
              <CardDescription>Your secret is now hidden inside the carrier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="max-w-md mx-auto">
                {processedFile.type === 'image' ? (
                  <img
                    src={processedFile.url}
                    alt="Processed"
                    className="w-full h-auto rounded-lg border border-border shadow-xl"
                  />
                ) : (
                  <div className="bg-background rounded-2xl p-8 border border-border flex flex-col items-center gap-4 shadow-inner">
                    <audio ref={audioRef} src={processedFile.url} onEnded={() => setIsPlaying(false)} />
                    <div className="p-6 bg-primary/10 rounded-full text-primary animate-pulse-slow">
                       <Music className="w-16 h-16" />
                    </div>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={toggleAudio}
                      className="gap-2 rounded-full px-8"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isPlaying ? 'Pause' : 'Play'} Stego Audio
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-4 mt-6">
                <Button onClick={() => handleDownload(processedFile)} size="lg" className="px-10 rounded-full h-14 font-black text-lg">
                  <Download className="w-5 h-5 mr-3" />
                  Download Stego-File
                </Button>
                <div className="text-[10px] text-success font-black uppercase tracking-widest bg-success/10 px-4 py-2 rounded-full border border-success/20">
                  ✓ Operation Successful
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Steganography;
