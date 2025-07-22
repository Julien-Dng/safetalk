import { Button } from "./ui/button";
import { Clock, AlertTriangle, Flame, Coins, CreditCard } from "lucide-react";

interface FloatingTimeAlertProps {
  isVisible: boolean;
  timeLeft: number; // in seconds
  credits: number;
  onBuyCredits: () => void;
  onUseCredits: () => void;
  onDismiss: () => void;
}

// Enhanced time formatting function
const formatTime = (seconds: number) => {
  if (seconds >= 3600) { // 1 hour or more
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function FloatingTimeAlert({ 
  isVisible, 
  timeLeft, 
  credits, 
  onBuyCredits, 
  onUseCredits, 
  onDismiss 
}: FloatingTimeAlertProps) {
  if (!isVisible) return null;

  const isVeryLow = timeLeft <= 60; // 1 minute or less
  const isLow = timeLeft <= 180; // 3 minutes or less

  const getAlertContent = () => {
    if (isVeryLow) {
      return {
        icon: <Flame className="w-5 h-5 text-red-400" />,
        title: "🔥 Only 1 minute left!",
        bgColor: "bg-red-900/90",
        borderColor: "border-red-600/50"
      };
    } else {
      return {
        icon: <Clock className="w-5 h-5 text-orange-400" />,
        title: `⏳ You're running out of time! (${formatTime(timeLeft)} left)`,
        bgColor: "bg-orange-900/90",
        borderColor: "border-orange-600/50"
      };
    }
  };

  const { icon, title, bgColor, borderColor } = getAlertContent();

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`${bgColor} ${borderColor} border backdrop-blur-sm rounded-2xl p-4 shadow-lg`}>
        <div className="flex items-center space-x-3 mb-3">
          {icon}
          <span className="text-white text-sm flex-1">{title}</span>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white/80 text-lg leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onBuyCredits}
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
          >
            <CreditCard className="w-3 h-3 mr-1.5" />
            Buy Credits
          </Button>
          
          {credits >= 5 && (
            <Button
              onClick={onUseCredits}
              size="sm"
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 h-8 text-xs"
            >
              <Coins className="w-3 h-3 mr-1.5" />
              Use My Credits
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}