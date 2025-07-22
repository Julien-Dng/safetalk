import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Gift, Clock, Heart, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface GiftCreditsAlertProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onGiftCredits: (amount: number) => void;
  giftableCredits: number;
}

export function GiftCreditsAlert({ 
  isOpen, 
  onClose, 
  partnerName,
  onGiftCredits,
  giftableCredits 
}: GiftCreditsAlertProps) {
  const [creditsToGift, setCreditsToGift] = useState(1);
  const [isGifting, setIsGifting] = useState(false);

  const handleGift = () => {
    setIsGifting(true);
    
    setTimeout(() => {
      onGiftCredits(creditsToGift);
      setIsGifting(false);
      onClose();
    }, 1500);
  };

  const minutesEquivalent = creditsToGift * 6; // 1 credit = 6 minutes

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-lg flex items-center justify-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Partner Low on Time</span>
          </DialogTitle>
          <DialogDescription className="text-center text-purple-200">
            Your chat partner is about to run out of time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alert Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200">
                <p className="text-sm">
                  <span className="font-medium">{partnerName}</span> is about to run out of time. 
                  Would you like to offer them credits to continue?
                </p>
              </div>
            </div>
          </div>

          {/* Credit Amount Selector */}
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-purple-200 text-sm">Credits to gift</label>
              <div className="flex items-center justify-center space-x-4 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditsToGift(Math.max(1, creditsToGift - 1))}
                  disabled={creditsToGift <= 1 || isGifting}
                  className="w-8 h-8 p-0 border-purple-700"
                >
                  -
                </Button>
                
                <div className="text-center min-w-[60px]">
                  <div className="text-2xl text-white">{creditsToGift}</div>
                  <div className="text-purple-300 text-xs">credits</div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditsToGift(Math.min(5, creditsToGift + 1))}
                  disabled={creditsToGift >= 5 || isGifting}
                  className="w-8 h-8 p-0 border-purple-700"
                >
                  +
                </Button>
              </div>
              
              {/* Quick selection buttons */}
              <div className="flex justify-center space-x-2 mt-3">
                {[1, 2, 3, 5].map((amount) => (
                  <Button
                    key={amount}
                    variant={creditsToGift === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreditsToGift(amount)}
                    disabled={isGifting}
                    className="w-8 h-8 p-0 text-xs border-purple-700"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Equivalent */}
            <div className="bg-purple-900/30 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 text-sm">Gift equivalent</span>
              </div>
              <div className="text-lg text-white">
                {creditsToGift} credit{creditsToGift !== 1 ? 's' : ''} = {minutesEquivalent} minutes
              </div>
              <p className="text-purple-300 text-xs mt-1">
                You're offering {minutesEquivalent} extra minutes of chat time
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGift}
              disabled={isGifting || creditsToGift < 1 || creditsToGift > giftableCredits}
              className="w-full bg-gradient-accent hover:opacity-90 text-white disabled:opacity-50"
            >
              {isGifting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Gifting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>🎁 Gift {creditsToGift} Credit{creditsToGift !== 1 ? 's' : ''}</span>
                </div>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              disabled={isGifting}
              className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
            >
              Not Now
            </Button>
          </div>

          {/* Gift Rules */}
          <div className="bg-purple-900/30 rounded-2xl p-3">
            <div className="flex items-start space-x-2">
              <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <div className="text-purple-200 text-xs space-y-1">
                <p>• Only 1 gift allowed per chat session</p>
                <p>• Credits are transferred immediately</p>
                <p>• Available credits: {giftableCredits}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}