import { Shield, Eye, Lock } from "lucide-react";
export const Header = () => {
  return <header className="text-center space-y-6">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          
          
        </div>
        <Lock className="w-8 h-8 text-sketch-charcoal transform rotate-12" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-5xl font-bold sketch-title-text transform -rotate-1">StegDETECT
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-handwriting">
          Hand-drawn steganography tool for artists and creatives. Hide your secrets 
          in sketches with pencil-style encryption and artistic analysis.
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 sketch-underline">
          <div className="w-3 h-3 bg-success border border-sketch-charcoal transform rotate-45"></div>
          <span>Pencil Steganography</span>
        </div>
        <div className="flex items-center gap-2 sketch-underline">
          <div className="w-3 h-3 bg-primary border border-sketch-charcoal transform -rotate-12"></div>
          <span>Sketch Encryption</span>
        </div>
        <div className="flex items-center gap-2 sketch-underline">
          <div className="w-3 h-3 bg-accent border border-sketch-charcoal transform rotate-6"></div>
          <span>Artistic Analysis</span>
        </div>
      </div>
    </header>;
};