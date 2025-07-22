import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Star, Badge } from "lucide-react";
import { useState } from "react";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interlocutorName: string;
  onSubmitRating: (rating: number, comment: string) => void;
}

export function RatingPopup({ isOpen, onClose, interlocutorName, onSubmitRating }: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmitRating(rating, comment);
    
    // Reset form
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setIsSubmitting(false);
    onClose();
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-purple-900/95 border-purple-700 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-lg">
            How was your conversation with {interlocutorName}?
          </DialogTitle>
          <DialogDescription className="text-center text-purple-200">
            Rate your experience and help improve our community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center space-y-3">
            <p className="text-purple-200 text-sm">Rate your experience</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="transition-colors duration-200 hover:scale-110 transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-purple-400 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-purple-200 text-sm">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment Field */}
          <div className="space-y-3">
            <label className="text-purple-200 text-sm">
              Want to leave a short comment? (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this conversation..."
              className="bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-right">
              <span className="text-purple-400 text-xs">
                {comment.length}/200
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
            >
              Skip for now
            </Button>
          </div>

          {/* Privacy Note */}
          <div className="bg-purple-900/30 rounded-2xl p-3">
            <p className="text-purple-200 text-xs text-center">
              Ratings help us improve the Safetalk experience. Your feedback remains anonymous.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}