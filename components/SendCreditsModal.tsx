import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Gift, Clock, Heart, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SendCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftableCredits: number;
  partnerName: string;
  onSendCredits: (amount: number) => void;
}

export function SendCreditsModal({ 
  isOpen, 
  onClose, 
  giftableCredits,
  partnerName,
  onSendCredits 
}: SendCreditsModalProps) {
  const [creditsToSend, setCreditsToSend] = useState(1);
  const [isSending, setIsSending] = useState(false);

  const minutesEquivalent = creditsToSend * 6; // 1 credit = 6 minutes

  const handleSend = () => {
    setIsSending(true);
    
    setTimeout(() => {
      onSendCredits(creditsToSend);
      setIsSending(false);
      onClose();
    }, 1500);
  };

  const handleSliderChange = (value: number[]) => {
    setCreditsToSend(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-lg flex items-center justify-center space-x-2">
            <Gift className="w-5 h-5 text-pink-400" />
            <span>Send Credits</span>
          </DialogTitle>
          <DialogDescription className="text-center text-purple-200">
            Your chat partner has reached their daily limit. Help them keep chatting!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alert */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-200 text-sm">
                <span className="font-medium">{partnerName}</span> has reached their daily limit. 
                Would you like to send them credits to keep chatting?
              </p>
            </div>
          </div>

          {/* Available Credits */}
          <div className="text-center">
            <div className="text-purple-300 text-sm mb-1">Your giftable credits</div>
            <div className="text-2xl text-white">{giftableCredits}</div>
          </div>

          {/* Credit Amount Selector */}
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-purple-200 text-sm">Credits to send</label>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditsToSend(Math.max(1, creditsToSend - 1))}
                  disabled={creditsToSend <= 1}
                  className="w-8 h-8 p-0 border-purple-700"
                >
                  -
                </Button>
                
                <div className="text-center min-w-[60px]">
                  <div className="text-2xl text-white">{creditsToSend}</div>
                  <div className="text-purple-300 text-xs">credits</div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditsToSend(Math.min(giftableCredits, creditsToSend + 1))}
                  disabled={creditsToSend >= giftableCredits}
                  className="w-8 h-8 p-0 border-purple-700"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Slider */}
            <div className="px-2">
              <Slider
                value={[creditsToSend]}
                onValueChange={handleSliderChange}
                max={giftableCredits}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-purple-400 mt-1">
                <span>1</span>
                <span>{giftableCredits}</span>
              </div>
            </div>

            {/* Conversion Display */}
            <div className="bg-purple-900/30 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 text-sm">Time equivalent</span>
              </div>
              <div className="text-lg text-white">
                {creditsToSend} credit{creditsToSend !== 1 ? 's' : ''} = {minutesEquivalent} minutes
              </div>
              <p className="text-purple-300 text-xs mt-1">
                You're offering {minutesEquivalent} extra minutes of chat time
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSend}
              disabled={isSending || creditsToSend < 1 || creditsToSend > giftableCredits}
              className="w-full bg-gradient-accent hover:opacity-90 text-white disabled:opacity-50"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>🎁 Send Credits</span>
                </div>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              disabled={isSending}
              className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
            >
              Cancel
            </Button>
          </div>

          {/* Gift Rules */}
          <div className="bg-purple-900/30 rounded-2xl p-3">
            <div className="flex items-start space-x-2">
              <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <div className="text-purple-200 text-xs space-y-1">
                <p>• Only 1 gift allowed per chat session</p>
                <p>• Credits are transferred immediately</p>
                <p>• Help create meaningful connections</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}