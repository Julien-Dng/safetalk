import { Dialog, DialogContent, DialogDescription } from "./ui/dialog";
import { Gift, CheckCircle, Heart } from "lucide-react";
import { useEffect } from "react";

interface GiftConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  creditsReceived: number;
  fromPartner?: boolean;
  partnerName?: string;
}

export function GiftConfirmation({ 
  isOpen, 
  onClose, 
  creditsReceived,
  fromPartner = false,
  partnerName = ""
}: GiftConfirmationProps) {
  
  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const minutesEquivalent = creditsReceived * 6;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogDescription className="sr-only">
          Gift confirmation dialog
        </DialogDescription>
        
        <div className="text-center space-y-4 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-accent/20 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-white text-lg">
              {fromPartner ? "🎁 Credits Received!" : "✅ Credits Sent!"}
            </h3>
            <p className="text-purple-200">
              {fromPartner 
                ? `You've received ${creditsReceived} credits from your chat partner. Enjoy your continued conversation!`
                : `${creditsReceived} credits have been gifted to ${partnerName}. Your generosity helps keep conversations flowing!`
              }
            </p>
            
            <div className="bg-purple-900/30 rounded-2xl p-3 mt-3">
              <div className="text-white">
                {creditsReceived} credit{creditsReceived !== 1 ? 's' : ''} = {minutesEquivalent} minutes
              </div>
              <div className="text-purple-300 text-sm">
                {fromPartner ? "Added to your chat time" : "Gifted to your partner"}
              </div>
            </div>
          </div>

          {/* Auto-close indicator */}
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-purple-400 text-xs">Thank you for spreading kindness!</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}