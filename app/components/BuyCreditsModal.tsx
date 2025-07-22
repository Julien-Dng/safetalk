import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Coins, Crown, Clock } from "lucide-react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onPurchase: (option: string, credits: number) => void;
}

export function BuyCreditsModal({ 
  isOpen, 
  onClose, 
  currentCredits, 
  onPurchase 
}: BuyCreditsModalProps) {
  const creditOptions = [
    { id: "5credits", credits: 5, time: "30 min", description: "Quick boost" },
    { id: "15credits", credits: 15, time: "1h 30m", description: "Extended chat" },
    { id: "30credits", credits: 30, time: "3 hours", description: "Long session" },
    { id: "50credits", credits: 50, time: "5 hours", description: "Full day" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-purple-900/95 border-purple-700 text-white max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
            <Coins className="w-6 h-6 text-purple-400" />
          </div>
          <DialogTitle className="text-xl text-white">
            Buy Credits
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Get more chat time with credits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Current Credits Display */}
          <div className="bg-purple-900/30 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-purple-200 text-sm">Current Credits</span>
            </div>
            <div className="text-2xl text-white">{currentCredits}</div>
          </div>

          {/* Credit Purchase Options */}
          <div className="space-y-3">
            {creditOptions.map((option) => (
              <Button
                key={option.id}
                onClick={() => onPurchase(option.id, option.credits)}
                variant="outline"
                className="w-full p-4 h-auto border-purple-600 hover:bg-purple-900/30 text-left justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white">{option.credits} Credits</div>
                    <div className="text-purple-300 text-sm">{option.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-200 text-sm">{option.time}</div>
                  <div className="text-purple-400 text-xs">chat time</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Premium Upgrade Option */}
          <div className="mt-6 pt-4 border-t border-purple-800">
            <Button className="w-full bg-gradient-accent hover:opacity-90 text-white p-4 h-auto">
              <div className="flex items-center justify-center space-x-3">
                <Crown className="w-5 h-5 text-white" />
                <div>
                  <div className="text-white">Go Premium</div>
                  <div className="text-white/80 text-sm">Unlimited daily chat time</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Info Note */}
          <div className="bg-purple-900/30 rounded-2xl p-3">
            <div className="text-purple-200 text-xs text-center">
              💡 1 credit = 6 minutes • Credits never expire
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-purple-300 hover:text-white hover:bg-purple-800/50"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}