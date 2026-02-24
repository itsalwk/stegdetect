import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const Landing = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans">
      
      {/* Global Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-sm">
          <div className="font-bold text-lg tracking-tight">StegDETECT</div>
          <div className="flex items-center gap-4">
             <Link to="/auth">
                <button className="bg-white text-black px-4 py-2 rounded-full font-medium transition-transform hover:scale-95 duration-200">
                  Log in
                </button>
             </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[720px] mx-auto px-6 pt-20 pb-24">
        
        <header className="mb-12">
          <div className="flex items-center space-x-4 text-sm text-white/50 mb-6 font-medium tracking-wide uppercase">
            <span>Product</span>
            <span>February 22, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8">Introducing StegDETECT</h1>
          <p className="text-lg md:text-xl leading-relaxed text-white/80 mb-6">
            We’ve trained a highly advanced model called StegDETECT which identifies covert data hidden within digital media. The forensic engine makes it possible for security researchers to uncover steganographic payloads, analyze modified bit-planes, challenge malicious masking techniques, and extract hidden communications.
          </p>
          <Link to="/auth">
            <button className="bg-white text-black px-5 py-3 rounded-full font-medium flex items-center gap-2 transition-transform hover:scale-95 duration-200 mb-8 mt-2">
              Try StegDETECT <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </header>

        <article className="prose prose-lg prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white prose-a:underline-offset-4">
          <p className="mb-6 font-normal text-white/80 text-[1.125rem]">
            StegDETECT is a sibling model to our Vision-Forensic suite, which is trained to follow deep pixel-level analysis instructions and provide detailed reports on media integrity.
          </p>
          <p className="mb-12 font-normal text-white/80 text-[1.125rem]">
            We are excited to introduce StegDETECT to get feedback from the cybersecurity community and learn about its capabilities against zero-day encoding methods. During the research preview, usage of the StegDETECT API is free.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-6 text-white mt-12">Samples</h2>

          <div className="border border-white/10 rounded-md overflow-hidden mb-12 bg-black">
            <div className="flex overflow-x-auto border-b border-white/10 px-4 bg-black">
              <button 
                onClick={() => setActiveTab("tab1")} 
                className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${activeTab === "tab1" ? "border-b-2 border-white text-white font-medium" : "text-white/50 hover:text-white"}`}
              >
                LSB Image Analysis
              </button>
              <button 
                onClick={() => setActiveTab("tab2")} 
                className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${activeTab === "tab2" ? "border-b-2 border-white text-white font-medium" : "text-white/50 hover:text-white"}`}
              >
                Audio Phase Coding
              </button>
            </div>

            <div className="bg-white/5 p-6 text-sm md:text-base text-white/90">

              <div className={`space-y-6 ${activeTab === "tab1" ? "block" : "hidden"}`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white/50">Analyst</div>
                  <div>Please scan <code className="bg-black border border-white/10 rounded px-1.5 py-0.5 text-xs text-white/80">suspect_image_04.png</code> for potential hidden payloads. I suspect it was modified using a spatial domain technique.</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white">StegDETECT</div>
                  <div>
                    <p className="mb-4">Scanning complete. I have detected anomalous statistical variances in the Least Significant Bits (LSB) of the blue channel.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white/50">Analyst</div>
                  <div>Can you extract the payload and determine its file type?</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white">StegDETECT</div>
                  <div className="w-full overflow-hidden">
                    <p className="mb-4">Yes. Extracting the modified bits reveals a file signature matching an encrypted ZIP archive. Here is the extraction log:</p>
                    <div className="bg-black text-white font-mono p-4 rounded-md text-sm mb-4 border border-white/10 overflow-x-auto whitespace-pre">
                      [INFO] LSB decoding initiated...
                      <br/>[INFO] Magic bytes detected: 50 4B 03 04
                      <br/>[SUCCESS] Payload extracted: hidden_archive.zip (4.2MB)
                    </div>
                    <p>The archive is password protected. Would you like me to run a dictionary attack against the header?</p>
                  </div>
                </div>
              </div>

              <div className={`space-y-6 ${activeTab === "tab2" ? "block" : "hidden"}`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white/50">Analyst</div>
                  <div>Analyze this <code className="bg-black border border-white/10 rounded px-1.5 py-0.5 text-xs text-white/80">.wav</code> file. The file size seems unusually large for a 10-second voice recording.</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white">StegDETECT</div>
                  <div>
                    <p>Running acoustic and structural analysis... I found no evidence of echo hiding, but there is a clear manipulation in the high-frequency range.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white/50">Analyst</div>
                  <div>What specific technique was used?</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="font-bold w-24 shrink-0 text-white">StegDETECT</div>
                  <div>
                    <p className="mb-4">The file exhibits characteristics of phase coding steganography between 15kHz and 18kHz. A continuous string of base64 encoded text has been embedded within the initial phase of the audio signal:</p>
                    <ul className="list-disc pl-5 space-y-2 text-white/80 mt-2">
                      <li><strong className="text-white">Method:</strong> Phase Coding</li>
                      <li><strong className="text-white">Carrier limit:</strong> 1.2 MB</li>
                      <li><strong className="text-white">Extracted Data:</strong> <code className="bg-black border border-white/10 rounded px-1.5 py-0.5 text-xs text-white/80">VGhlIG1lZXRpbmcgaXMgYXQgbWlkbmlnaHQu</code> (Decoded: "The meeting is at midnight.")</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 mt-12 text-white">Methods</h2>
          <p className="mb-6 font-normal text-white/80 text-[1.125rem]">
            We trained this model using highly optimized Convolutional Neural Networks (CNNs) and Spatial Rich Models (SRM). Unlike traditional heuristic tools, we trained an initial model using supervised learning on millions of carrier files—both clean media and files maliciously altered with various steganographic algorithms (such as LSB, F5, and OutGuess).
          </p>
          <p className="mb-6 font-normal text-white/80 text-[1.125rem]">
            To create a highly accurate detection boundary, we utilized deep residual networks capable of capturing the microscopic noise residuals introduced when data is hidden within images or audio. We performed several iterations of adversarial training to ensure the model can detect even highly masked or low-capacity payloads.
          </p>
        </article>
      </main>

      <footer className="border-t border-white/10 mt-12 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white/50 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">StegDETECT © 2026</div>
          <div className="flex space-x-6">Crafted @ Project11</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
