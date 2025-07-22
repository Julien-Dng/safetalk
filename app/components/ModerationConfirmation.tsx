import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription } from "./ui/dialog";
import { CheckCircle, UserX, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ModerationConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  type: "block" | "report" | null;
  interlocutorName: string;
}

export function ModerationConfirmation({ 
  isOpen, 
  onClose, 
  type, 
  interlocutorName 
}: ModerationConfirmationProps) {
  
  // Auto-close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case "block":
        return <UserX className="w-8 h-8 text-yellow-400" />;
      case "report":
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-400" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case "block":
        return {
          title: "User Blocked",
          message: `${interlocutorName} has been blocked.`,
          subtitle: "You won't be matched with them again."
        };
      case "report":
        return {
          title: "Report Submitted",
          message: "Thank you. The user has been reported.",
          subtitle: "Our team will review this report shortly."
        };
      default:
        return {
          title: "Action Complete",
          message: "Action completed successfully.",
          subtitle: ""
        };
    }
  };

  const { title, message, subtitle } = getMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogDescription className="sr-only">
          Moderation action confirmation dialog
        </DialogDescription>
        
        <div className="text-center space-y-4 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h3 className="text-white text-lg">{title}</h3>
            <p className="text-purple-200">{message}</p>
            {subtitle && (
              <p className="text-purple-300 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Auto-close indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-xs">Closing automatically...</span>
          </div>

          {/* Manual close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}