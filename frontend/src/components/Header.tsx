import { Shield, Eye, Lock } from "lucide-react";
export const Header = () => {
  return <header className="text-center space-y-6">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          
          
        </div>
        <Lock className="w-8 h-8 text-sketch-charcoal transform rotate-12" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-foreground">
          StegDetect
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          File-in-File Steganography and Steganalysis Tool. Hide and detect secrets 
          across multimedia formats with advanced encryption.
        </p>
        <p className="text-lg font-semibold text-primary">
          Hide. Detect. Secure.
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span>Multi-Format Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Advanced Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <span>Steganalysis Detection</span>
        </div>
      </div>
    </header>;
};