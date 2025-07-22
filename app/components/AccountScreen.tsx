import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, User, Settings, Gift, Crown, LogOut, Coins, Users, Star, Edit3, Check, X, Clock, Zap } from "lucide-react";
import { useState } from "react";

interface AccountScreenProps {
  username: string;
  credits: number;
  isPremium: boolean;
  dailyFreeTimeRemaining: number;
  paidTimeAvailable: number;
  onBack: () => void;
  onShowReferral: () => void;
  onShowRewards: () => void;
  onLogout: () => void;
  onUpdateUsername: (newUsername: string) => void;
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

export function AccountScreen({ 
  username, 
  credits, 
  isPremium, 
  dailyFreeTimeRemaining,
  paidTimeAvailable,
  onBack, 
  onShowReferral, 
  onShowRewards, 
  onLogout,
  onUpdateUsername 
}: AccountScreenProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const handleSaveUsername = () => {
    if (newUsername.trim() && newUsername !== username) {
      onUpdateUsername(newUsername.trim());
    }
    setIsEditingUsername(false);
  };

  const handleCancelEdit = () => {
    setNewUsername(username);
    setIsEditingUsername(false);
  };

  const creditMinutes = credits * 6; // 1 credit = 6 minutes
  const totalTimeAvailable = dailyFreeTimeRemaining + paidTimeAvailable;

  return (
    <div className="min-h-screen dark gradient-secondary">
      {/* Header */}
      <div className="bg-purple-900/20 border-b border-purple-800">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-purple-200 hover:text-white hover:bg-purple-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          
          <h1 className="text-white text-lg">My Account</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-purple-200 hover:text-white hover:bg-purple-900/20"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-purple-900/20 rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              {isEditingUsername ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-purple-900/30 border-purple-800 text-white"
                    placeholder="Enter username"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveUsername}
                    className="bg-green-600 hover:bg-green-700 p-2"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-purple-700 text-purple-200 p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-white text-xl">{username}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingUsername(true)}
                    className="p-1 text-purple-300 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2 mt-1">
                {isPremium ? (
                  <Badge className="bg-gradient-accent text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-purple-700 text-purple-200">
                    Freemium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Time & Credits Balance */}
        <div className="bg-purple-900/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Time & Credits
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Time Breakdown */}
            {isPremium ? (
              <div className="bg-purple-900/30 rounded-xl p-4 text-center">
                <div className="text-2xl text-white mb-1">∞</div>
                <div className="text-purple-200 text-sm">Unlimited Chat Time</div>
                <div className="text-purple-400 text-xs mt-1">Premium Member</div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Today's Free Time */}
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 text-sm">Today's Free Time</span>
                    </div>
                    <span className="text-blue-400">{formatTime(dailyFreeTimeRemaining)}</span>
                  </div>
                  <div className="text-blue-200 text-xs">Resets daily • Used automatically first</div>
                </div>
                
                {/* Paid Time Available */}
                <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm">Paid Time Available</span>
                    </div>
                    <span className="text-green-400">{formatTime(paidTimeAvailable)}</span>
                  </div>
                  <div className="text-green-200 text-xs">From credits • Click "Use my credits" to add more</div>
                </div>
                
                {/* Total Available */}
                <div className="bg-purple-900/30 rounded-xl p-4 border-t border-purple-800">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Total Available</span>
                    <span className="text-white text-lg">{formatTime(totalTimeAvailable)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Credits */}
            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm">Credits</span>
                </div>
                <span className="text-yellow-400 text-lg">{credits}</span>
              </div>
              <div className="text-yellow-200 text-xs">
                = {formatTime(creditMinutes * 60)} potential chat time
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-white text-lg">Quick Actions</h3>
          
          <Button
            onClick={onShowReferral}
            variant="outline"
            className="w-full h-14 border-purple-700 text-left justify-start hover:bg-purple-900/30"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white">Referral Program</div>
                <div className="text-purple-200 text-sm">Invite friends & earn rewards</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={onShowRewards}
            variant="outline"
            className="w-full h-14 border-purple-700 text-left justify-start hover:bg-purple-900/30"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-white">My Rewards</div>
                <div className="text-purple-200 text-sm">Manage your giftable credits</div>
              </div>
            </div>
          </Button>

          {!isPremium && (
            <Button
              className="w-full h-14 bg-gradient-accent hover:opacity-90 text-white"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white">Upgrade to Premium</div>
                  <div className="text-white/80 text-sm">Unlimited chats & exclusive features</div>
                </div>
              </div>
            </Button>
          )}
        </div>

        <Separator className="bg-purple-800" />

        {/* Settings Section */}
        <div className="space-y-3">
          <h3 className="text-white text-lg flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </h3>
          
          <div className="bg-purple-900/20 rounded-2xl p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">App Version</div>
                  <div className="text-purple-400 text-xs">Safetalk v1.0.0</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Account Type</div>
                  <div className="text-purple-400 text-xs">
                    {isPremium ? "Premium Member" : "Freemium User"}
                  </div>
                </div>
                {isPremium && (
                  <Badge className="bg-gradient-accent text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full border-red-700 text-red-400 hover:bg-red-900/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}