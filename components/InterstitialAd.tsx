import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Play, Gift } from "lucide-react";
import { useState } from "react";

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  partnerChangeCount: number;
}

export function InterstitialAd({ 
  isOpen, 
  onClose, 
  onWatchAd, 
  partnerChangeCount 
}: InterstitialAdProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [watchComplete, setWatchComplete] = useState(false);

  const handleWatchAd = () => {
    setIsWatching(true);
    
    // Simulate 5-second ad
    setTimeout(() => {
      setIsWatching(false);
      setWatchComplete(true);
      onWatchAd();
      
      // Auto close after showing reward and trigger partner search
      setTimeout(() => {
        onClose();
        setWatchComplete(false);
      }, 1500);
    }, 5000);
  };

  // Prevent closing while watching or before watching
  const handleClose = () => {
    // Only allow closing after ad is complete
    if (watchComplete) {
      onClose();
      setWatchComplete(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-purple-900/95 border-purple-700 text-white max-w-sm mx-auto">
        {!isWatching && !watchComplete && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
              <DialogTitle className="text-xl text-white">
                Watch Ad to Continue
              </DialogTitle>
              <DialogDescription className="text-purple-200">
                You've switched partners {partnerChangeCount} times. Watch a short ad to earn 1 free credit and continue!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <Button
                onClick={handleWatchAd}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Watch Ad (5s)</span>
                  <Gift className="w-4 h-4 text-yellow-400" />
                </div>
              </Button>

              <div className="bg-purple-900/30 rounded-2xl p-3">
                <p className="text-purple-200 text-xs text-center">
                  🎯 Required to continue • Earn 1 credit • Support free access
                </p>
              </div>
            </div>
          </>
        )}

        {isWatching && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <DialogTitle className="text-lg text-white mb-2">
              Playing Ad...
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              This is a simulated rewarded video ad
            </DialogDescription>
            <div className="mt-4">
              <div className="w-full bg-purple-900/30 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-purple-300 text-xs mt-2">Please wait...</p>
            </div>
          </div>
        )}

        {watchComplete && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-lg text-white mb-2">
              🎉 Reward Earned!
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              +1 credit added • Finding new partner...
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}