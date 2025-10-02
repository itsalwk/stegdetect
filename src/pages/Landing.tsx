import { Button } from "@/components/ui/button";
import { Shield, Lock, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">StegDetect</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">How It Works</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">About</a>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              StegDetect
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              Hide. Detect. Secure.
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Advanced multimedia steganography and steganalysis tool. Hide secret messages in images or detect hidden data with cutting-edge algorithms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="min-w-[200px] shadow-material-lg">
                  Start Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-[200px] text-white border-white/30 hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need for secure steganography and advanced steganalysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-lg p-6 shadow-material card-hover border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Steganography</h3>
              <p className="text-muted-foreground">
                Hide secret messages and files within images using advanced LSB techniques with optional encryption.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-material card-hover border border-border">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Steganalysis</h3>
              <p className="text-muted-foreground">
                Detect hidden data in suspicious images with statistical analysis and pattern recognition.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-material card-hover border border-border">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Encryption</h3>
              <p className="text-muted-foreground">
                Password-protected encryption ensures your hidden messages remain secure even if discovered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple, secure, and powerful</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
                <p className="text-muted-foreground">
                  Choose an image file (PNG, JPEG, or WEBP) that you want to use for steganography or analysis.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Action</h3>
                <p className="text-muted-foreground">
                  Select to hide data, extract hidden messages, or analyze an image for suspicious patterns.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Results</h3>
                <p className="text-muted-foreground">
                  Download your steganographic image or view the extracted data and analysis results instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of users protecting their digital communications with StegDetect
            </p>
            <Link to="/auth">
              <Button size="lg" className="shadow-material-lg">
                Start Now - It's Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 StegDetect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
