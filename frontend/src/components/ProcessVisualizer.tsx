import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Database, Lock, Search, Binary, ArrowRight } from "lucide-react";

export type ProcessStep = {
  id: string;
  label: string;
  icon: any;
  description: string;
  status: "pending" | "processing" | "completed";
};

interface ProcessVisualizerProps {
  steps: ProcessStep[];
  isActive: boolean;
}

export const ProcessVisualizer = ({ steps, isActive }: ProcessVisualizerProps) => {
  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-start max-w-2xl mx-auto">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0" />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isProcessing = step.status === "processing";
          const isCompleted = step.status === "completed";

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isProcessing ? 1.2 : 1,
                  backgroundColor: isCompleted ? "var(--primary)" : isProcessing ? "var(--background)" : "var(--muted)",
                  borderColor: isCompleted || isProcessing ? "var(--primary)" : "var(--border)",
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm`}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                  </motion.div>
                ) : (
                  <Icon className={`w-5 h-5 ${isCompleted ? "text-primary-foreground" : "text-muted-foreground"}`} />
                )}
              </motion.div>
              
              <div className="mt-3 text-center px-2">
                <p className={`text-xs font-bold uppercase tracking-tighter ${isProcessing ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                {isProcessing && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-primary/70 leading-tight mt-1 max-w-[80px]"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>

              {/* Bit Animation Overlay when Processing */}
              <AnimatePresence>
                {isProcessing && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0, x: (i - 2) * 10 }}
                        animate={{ y: -20, opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2,
                          ease: "easeOut"
                        }}
                        className="text-[10px] font-mono text-primary font-bold"
                      >
                        {Math.round(Math.random())}
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
