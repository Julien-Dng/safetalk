import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AlertTriangle, Shield, UserX } from "lucide-react";

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  interlocutorName: string;
  onBlockUser: () => void;
  onReportUser: () => void;
}

export function ModerationModal({ 
  isOpen, 
  onClose, 
  interlocutorName, 
  onBlockUser, 
  onReportUser 
}: ModerationModalProps) {
  const handleBlockUser = () => {
    onBlockUser();
    onClose();
  };

  const handleReportUser = () => {
    onReportUser();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-lg">
            Moderation Options
          </DialogTitle>
          <DialogDescription className="text-center text-purple-200 text-sm">
            What would you like to do with {interlocutorName}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Block User Option */}
          <Button
            onClick={handleBlockUser}
            variant="outline"
            className="w-full h-14 border-purple-700 hover:bg-purple-900/30 text-left justify-start"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <UserX className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-white">Block this user</div>
                <div className="text-purple-200 text-sm">Prevent future matches</div>
              </div>
            </div>
          </Button>

          {/* Report User Option */}
          <Button
            onClick={handleReportUser}
            variant="outline"
            className="w-full h-14 border-red-700 hover:bg-red-900/30 text-left justify-start"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-white">Report this user</div>
                <div className="text-purple-200 text-sm">Report inappropriate behavior</div>
              </div>
            </div>
          </Button>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            Cancel
          </Button>

          {/* Safety Notice */}
          <div className="bg-purple-900/30 rounded-2xl p-3">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
              <p className="text-purple-200 text-xs">
                Your safety is our priority. All reports are reviewed by our moderation team.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}