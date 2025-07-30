import { Shield, Eye, Lock } from "lucide-react";

export const Header = () => {
  return (
    <header className="text-center space-y-6">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          <Shield className="w-12 h-12 text-primary cyber-glow" />
          <Eye className="w-6 h-6 text-accent absolute top-3 left-3" />
        </div>
        <Lock className="w-8 h-8 text-cyber-purple" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-5xl font-bold stego-gradient-text">
          StegoVault
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Advanced image steganography and analysis tool. Hide secrets in plain sight 
          with military-grade encryption and real-time processing.
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full pulse-glow"></div>
          <span>LSB Steganography</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>AES Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <span>Real-time Analysis</span>
        </div>
      </div>
    </header>
  );
};