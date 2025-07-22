import { Button } from "./ui/button";
import { Shield, MessageCircle } from "lucide-react";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen dark gradient-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and App Name */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-accent rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Safetalk
          </h1>
          <p className="text-purple-200 text-lg">
            Speak freely. Listen deeply.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm">Anonymous conversations</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-purple-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm">Ephemeral messages</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-purple-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm">Safe space for everyone</span>
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          className="w-full bg-white text-purple-900 hover:bg-purple-50 h-12 rounded-2xl shadow-lg"
        >
          Continue
        </Button>

        {/* Footer */}
        <div className="text-center text-purple-300 text-xs space-y-1">
          <p>By continuing, you agree to our</p>
          <p>
            <span className="underline">Terms of Service</span> and{" "}
            <span className="underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}