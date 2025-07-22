import { Button } from "./ui/button";
import { Smartphone, Mail } from "lucide-react";
import { EmailAuthModal } from "./EmailAuthModal";
import { PhoneAuthModal } from "./PhoneAuthModal";
import { useState } from "react";

interface SignInScreenProps {
  onSignIn: (username: string) => void;
}

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleEmailAuth = (emailUsername: string) => {
    onSignIn(emailUsername);
  };

  const handlePhoneAuth = (phoneUsername: string) => {
    onSignIn(phoneUsername);
  };

  const handleGoogleAuth = () => {
    // Simulate Google authentication
    const randomUsername = "GoogleUser" + Math.floor(Math.random() * 1000);
    onSignIn(randomUsername);
  };

  const handleAppleAuth = () => {
    // Simulate Apple authentication  
    const randomUsername = "AppleUser" + Math.floor(Math.random() * 1000);
    onSignIn(randomUsername);
  };

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-4">
        <h2 className="text-white">Sign In</h2>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl text-white">Welcome back</h3>
            <p className="text-purple-200 text-sm">
              Choose how you'd like to sign in
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-3">
            <Button
              className="w-full bg-white text-gray-900 hover:bg-gray-100 h-12 rounded-2xl flex items-center justify-center space-x-3"
              onClick={handleGoogleAuth}
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">G</span>
              </div>
              <span>Continue with Google</span>
            </Button>

            <Button
              className="w-full bg-black text-white hover:bg-gray-800 h-12 rounded-2xl flex items-center justify-center space-x-3"
              onClick={handleAppleAuth}
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs">🍎</span>
              </div>
              <span>Continue with Apple</span>
            </Button>

            <Button
              className="w-full bg-purple-600 text-white hover:bg-purple-700 h-12 rounded-2xl flex items-center justify-center space-x-3"
              onClick={() => setShowPhoneModal(true)}
            >
              <Smartphone className="w-5 h-5" />
              <span>Continue with Phone</span>
            </Button>

            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 rounded-2xl flex items-center justify-center space-x-3"
              onClick={() => setShowEmailModal(true)}
            >
              <Mail className="w-5 h-5" />
              <span>Continue with Email</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Email Authentication Modal */}
      <EmailAuthModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={handleEmailAuth}
      />

      {/* Phone Authentication Modal */}
      <PhoneAuthModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={handlePhoneAuth}
      />
    </div>
  );
}