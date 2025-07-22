import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Clock, Crown, Coins, CreditCard } from "lucide-react";

interface LowTimeAlertProps {
  isOpen: boolean;
  onClose: () => void;
  freeTimeLeft: number;
  paidTimeLeft: number;
  credits: number;
  onBuyTime: (option: string, credits: number, minutes: number) => void;
  onUseCredits: () => void;
  onGoToPremium: () => void;
}

export function LowTimeAlert({ 
  isOpen, 
  onClose, 
  freeTimeLeft, 
  paidTimeLeft, 
  credits,
  onBuyTime,
  onUseCredits, 
  onGoToPremium 
}: LowTimeAlertProps) {

  const totalTimeLeft = freeTimeLeft + paidTimeLeft;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-purple-900/95 border-purple-700 text-white max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-red-400" />
          </div>
          <DialogTitle className="text-xl text-white">
            You're running out of time
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Want to continue?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {/* Buy Credits Button */}
          <Button
            onClick={() => {
              onClose();
              // This will open the buy credits modal
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto"
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Buy Credits</span>
            </div>
          </Button>

          {/* Use My Credits Button - Only show if user has credits */}
          {credits >= 5 && (
            <Button
              onClick={() => {
                onUseCredits();
                onClose();
              }}
              variant="outline"
              className="w-full border-green-600 text-green-300 hover:bg-green-900/30 p-4 h-auto"
            >
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-4 h-4" />
                <span>Use My Credits</span>
              </div>
            </Button>
          )}

          {/* Go Premium Option */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-purple-800"></div>
              <span className="text-purple-400 text-sm">or</span>
              <div className="flex-1 h-px bg-purple-800"></div>
            </div>
            
            <Button
              onClick={() => {
                onClose();
                onGoToPremium();
              }}
              className="w-full bg-gradient-accent hover:opacity-90 text-white p-4 h-auto"
            >
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Go Premium - Unlimited Daily Time</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}