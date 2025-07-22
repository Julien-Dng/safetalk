import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";

interface LoginScreenProps {
  onLogin: (username: string) => void;
  onSignUp: () => void;
}

export function LoginScreen({ onLogin, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      setError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate authentication API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random success/failure for demo (80% success rate)
    if (Math.random() > 0.2) {
      // Success - generate username from email
      const username = email.split('@')[0];
      onLogin(username);
    } else {
      setError("Invalid email or password. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(""); // Clear error when user types
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(""); // Clear error when user types
  };

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-6 pt-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl text-white font-medium">Safetalk</h1>
          <p className="text-purple-200 text-sm">Speak freely. Listen deeply.</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl text-white">Log in</h2>
            <p className="text-purple-200 text-sm">
              Welcome back to your safe space
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-purple-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Email address"
                  className={`pl-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                    error && !password ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label className="text-purple-200">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Password"
                  className={`pr-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                    error && password ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-purple-400 hover:text-white hover:bg-purple-900/20"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-accent hover:opacity-90 text-white h-12 rounded-2xl mt-6"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-purple-300 hover:text-white hover:bg-purple-900/20 text-sm"
              onClick={() => {
                // Handle forgot password
                console.log("Forgot password clicked");
              }}
            >
              Forgot your password?
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-4 py-4">
            <div className="flex-1 h-px bg-purple-800"></div>
            <span className="text-purple-400 text-sm">or</span>
            <div className="flex-1 h-px bg-purple-800"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-3">
            <p className="text-purple-300 text-sm">
              Don't have an account?{" "}
              <Button
                variant="ghost"
                onClick={onSignUp}
                className="text-purple-200 hover:text-white hover:bg-purple-900/20 p-0 h-auto underline underline-offset-4"
              >
                Sign up
              </Button>
            </p>
          </div>

          {/* App Info */}
          <div className="bg-purple-900/30 rounded-2xl p-4 text-center">
            <div className="text-purple-200 text-xs space-y-1">
              <p>🔒 Your conversations are anonymous and ephemeral</p>
              <p>💫 Safe space for authentic connections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}