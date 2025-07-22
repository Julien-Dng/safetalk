import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export function EmailAuthModal({ isOpen, onClose, onSuccess }: EmailAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!username) {
        newErrors.username = "Username is required";
      } else if (username.length < 2) {
        newErrors.username = "Username must be at least 2 characters";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate authentication API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Success - use provided username or generate from email
    const finalUsername = isSignUp ? username : email.split('@')[0];
    onSuccess(finalUsername);
    
    setIsLoading(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setConfirmPassword("");
    setUsername("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-purple-900/95 border-purple-700 text-white max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 text-purple-200 hover:text-white hover:bg-purple-900/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-xl text-white text-left">
                {isSignUp ? "Create Account" : "Sign In"}
              </DialogTitle>
              <DialogDescription className="text-purple-200 text-left">
                {isSignUp 
                  ? "Join the Safetalk community" 
                  : "Welcome back to Safetalk"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-purple-200">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`pl-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Username Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2">
              <Label className="text-purple-200">Username</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={`bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                  errors.username ? 'border-red-500' : ''
                }`}
              />
              {errors.username && (
                <p className="text-red-400 text-xs">{errors.username}</p>
              )}
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="text-purple-200">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`pr-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-purple-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2">
              <Label className="text-purple-200">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`pr-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-purple-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl mt-6"
          >
            {isLoading 
              ? (isSignUp ? "Creating Account..." : "Signing In...") 
              : (isSignUp ? "Create Account" : "Sign In")
            }
          </Button>

          {/* Forgot Password Link (Sign In Only) */}
          {!isSignUp && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-purple-300 hover:text-white hover:bg-purple-900/20 text-sm"
                onClick={() => {
                  // Handle forgot password
                  console.log("Forgot password clicked");
                }}
              >
                Forgot password?
              </Button>
            </div>
          )}

          {/* Toggle between Sign In/Sign Up */}
          <div className="text-center pt-4 border-t border-purple-800">
            <p className="text-purple-300 text-sm mb-2">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={toggleMode}
              className="text-purple-200 hover:text-white hover:bg-purple-900/20"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}