import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Smartphone, ArrowLeft, AlertCircle, User } from "lucide-react";
import { useState, useEffect } from "react";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33", format: "X XX XX XX XX" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44", format: "XXXX XXX XXX" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49", format: "XXX XXXXXXX" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34", format: "XXX XX XX XX" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39", format: "XXX XXX XXXX" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61", format: "XXX XXX XXX" },
];

export function PhoneAuthModal({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) {
  const [step, setStep] = useState<"phone" | "verification" | "username">("phone");
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Generate random placeholder username
  const generatePlaceholderUsername = () => {
    return "Anonymous" + Math.floor(Math.random() * 9000 + 1000);
  };

  // Initialize placeholder username
  useState(() => {
    setUsername(generatePlaceholderUsername());
  });

  // Format phone number based on selected country
  const formatPhoneNumber = (value: string, format: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    let cleanedIndex = 0;
    
    for (let i = 0; i < format.length && cleanedIndex < cleaned.length; i++) {
      if (format[i] === 'X') {
        formatted += cleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Basic validation - check if number has appropriate length
    const minLength = selectedCountry.code === "US" || selectedCountry.code === "CA" ? 10 : 8;
    const maxLength = 15;
    
    return cleaned.length >= minLength && cleaned.length <= maxLength;
  };

  // Validate verification code
  const validateVerificationCode = (code: string) => {
    return code.length === 6 && /^\d{6}$/.test(code);
  };

  // Validate username
  const validateUsername = (name: string) => {
    return name.trim().length >= 2 && name.trim().length <= 20;
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(30);
  };

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    
    // Simulate sending SMS
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep("verification");
    startResendTimer();
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateVerificationCode(verificationCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.3) { // 70% success rate
      // Success - move to username entry
      setIsLoading(false);
      setStep("username");
    } else {
      setError("Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateUsername(username)) {
      setError("Username must be between 2 and 20 characters");
      return;
    }

    setIsLoading(true);
    
    // Simulate final authentication step
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Complete authentication with chosen username
    onSuccess(username.trim());
    onClose();
    resetForm();
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError("");
    
    // Simulate resending SMS
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    startResendTimer();
  };

  const resetForm = () => {
    setStep("phone");
    setPhoneNumber("");
    setVerificationCode("");
    setUsername(generatePlaceholderUsername());
    setError("");
    setResendTimer(0);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleBack = () => {
    if (step === "username") {
      setStep("verification");
      setError("");
    } else if (step === "verification") {
      setStep("phone");
      setError("");
      setVerificationCode("");
    } else {
      handleClose();
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry.format);
    setPhoneNumber(formatted);
    if (error) setError(""); // Clear error when user types
  };

  const handleVerificationCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(cleaned);
    if (error) setError(""); // Clear error when user types
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (error) setError(""); // Clear error when user types
  };

  // Get step-specific content
  const getStepContent = () => {
    switch (step) {
      case "phone":
        return {
          title: "Phone Verification",
          description: "We'll send you a verification code"
        };
      case "verification":
        return {
          title: "Enter Code",
          description: `Code sent to ${selectedCountry.dialCode} ${phoneNumber}`
        };
      case "username":
        return {
          title: "Choose Username",
          description: "Pick a name for your Safetalk profile"
        };
    }
  };

  const stepContent = getStepContent();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-purple-900/95 border-purple-700 text-white max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1 text-purple-200 hover:text-white hover:bg-purple-900/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-xl text-white text-left">
                {stepContent.title}
              </DialogTitle>
              <DialogDescription className="text-purple-200 text-left">
                {stepContent.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 mt-6">
            {/* Country Selector */}
            <div className="space-y-2">
              <Label className="text-purple-200">Country</Label>
              <Select 
                value={selectedCountry.code} 
                onValueChange={(code) => {
                  const country = countries.find(c => c.code === code);
                  if (country) {
                    setSelectedCountry(country);
                    setPhoneNumber(""); // Clear phone number when country changes
                  }
                }}
              >
                <SelectTrigger className="bg-purple-900/30 border-purple-800 text-white rounded-2xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-900 border-purple-700 text-white">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center space-x-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-purple-300">{country.dialCode}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label className="text-purple-200">Phone Number</Label>
              <div className="flex space-x-2">
                <div className="flex items-center bg-purple-900/30 border border-purple-800 rounded-2xl px-3 h-12">
                  <span className="text-purple-200">{selectedCountry.dialCode}</span>
                </div>
                <div className="flex-1 relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="Enter your phone number"
                    className={`pl-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                      error ? 'border-red-500' : ''
                    }`}
                  />
                </div>
              </div>
              <p className="text-purple-400 text-xs">
                Format: {selectedCountry.dialCode} {selectedCountry.format.replace(/X/g, '0')}
              </p>
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Send Code Button */}
            <Button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl mt-6"
            >
              {isLoading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        ) : step === "verification" ? (
          <form onSubmit={handleVerificationSubmit} className="space-y-4 mt-6">
            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label className="text-purple-200">Verification Code</Label>
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => handleVerificationCodeChange(e.target.value)}
                placeholder="Enter 6-digit code"
                className={`text-center text-lg tracking-widest bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                  error ? 'border-red-500' : ''
                }`}
                maxLength={6}
              />
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            {/* Resend Code */}
            <div className="text-center pt-4 border-t border-purple-800">
              {resendTimer > 0 ? (
                <p className="text-purple-300 text-sm">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-purple-200 hover:text-white hover:bg-purple-900/20"
                >
                  Resend Code
                </Button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleUsernameSubmit} className="space-y-4 mt-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label className="text-purple-200">Choose your username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Anonymous2741"
                  className={`pl-10 bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 ${
                    error ? 'border-red-500' : ''
                  }`}
                  maxLength={20}
                />
              </div>
              <p className="text-purple-400 text-xs">
                This will be shown to other users during chats
              </p>
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={isLoading || !validateUsername(username)}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl mt-6"
            >
              {isLoading ? "Creating Account..." : "Continue"}
            </Button>

            {/* Info Note */}
            <div className="bg-purple-900/30 rounded-2xl p-3">
              <div className="text-purple-200 text-xs text-center">
                ✨ Your phone number is verified and secure
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}