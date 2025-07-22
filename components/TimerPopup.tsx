import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Clock, Star, Zap, Crown } from "lucide-react";

interface TimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onExtendTime: (option: string) => void;
  onGoToPremium: () => void;
}

export function TimerPopup({ isOpen, onClose, credits, onExtendTime, onGoToPremium }: TimerPopupProps) {
  const timeOptions = [
    {
      id: "30min",
      duration: "30 min",
      cost: 5,
      icon: Clock,
      color: "bg-blue-500"
    },
    {
      id: "1hour",
      duration: "1 hour",
      cost: 10,
      icon: Zap,
      color: "bg-purple-500"
    },
    {
      id: "24hour",
      duration: "24h pass",
      cost: 20,
      icon: Star,
      color: "bg-yellow-500"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl">
            Time's up!
          </DialogTitle>
          <DialogDescription className="text-center text-purple-200">
            Your chat session has ended. Choose an option to continue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Clock Icon */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <p className="text-purple-200 text-sm mt-2">
              Your chat session has ended
            </p>
          </div>

          {/* Credits Display */}
          <div className="bg-purple-900/50 rounded-2xl p-4 text-center">
            <div className="text-purple-200 text-sm">Your credits</div>
            <div className="text-white text-2xl font-bold">{credits}</div>
          </div>

          {/* Time Extension Options */}
          <div className="space-y-3">
            <h3 className="text-purple-200 text-sm">Continue chatting</h3>
            {timeOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={`w-full h-14 border-purple-700 hover:bg-purple-900/30 ${
                  credits >= option.cost ? "opacity-100" : "opacity-50"
                }`}
                disabled={credits < option.cost}
                onClick={() => onExtendTime(option.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center`}>
                      <option.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">{option.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-200 text-sm">{option.cost}</span>
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Premium Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-purple-800"></div>
              <span className="text-purple-400 text-sm">or</span>
              <div className="flex-1 h-px bg-purple-800"></div>
            </div>
            
            <Button
              onClick={onGoToPremium}
              className="w-full h-14 bg-gradient-accent hover:opacity-90 text-white rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Go Premium</div>
                  <div className="text-sm opacity-90">Unlimited chats</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Buy Credits */}
          <Button
            variant="ghost"
            className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
            onClick={() => {}}
          >
            Buy more credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}