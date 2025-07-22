import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Share2, Users, Gift, Star, Crown, Copy } from "lucide-react";

interface ReferralScreenProps {
  onBack: () => void;
  isPremium: boolean;
  referralCount: number;
  totalRewards: number;
}

export function ReferralScreen({ onBack, isPremium, referralCount, totalRewards }: ReferralScreenProps) {
  const referralCode = "SAFE2024XYZ";
  const recentRewards = [
    { id: 1, type: "credits", amount: 5, date: "2 hours ago", from: "Anonymous456" },
    { id: 2, type: "credits", amount: 5, date: "1 day ago", from: "Anonymous123" },
    { id: 3, type: "premium", amount: 1, date: "3 days ago", from: "Anonymous789" },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Safetalk',
        text: 'Join me on Safetalk - anonymous, safe conversations',
        url: `https://safetalk.app/invite/${referralCode}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`https://safetalk.app/invite/${referralCode}`);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-purple-200 hover:text-white hover:bg-purple-900/20"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-white">Referral Program</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 px-6 pb-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-purple-900/20 border-purple-800 p-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-white text-2xl font-bold">{referralCount}</div>
              <div className="text-purple-200 text-sm">Referrals</div>
            </div>
          </Card>
          
          <Card className="bg-purple-900/20 border-purple-800 p-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div className="text-white text-2xl font-bold">{totalRewards}</div>
              <div className="text-purple-200 text-sm">Total Rewards</div>
            </div>
          </Card>
        </div>

        {/* Referral Code */}
        <Card className="bg-purple-900/20 border-purple-800 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-accent rounded-full flex items-center justify-center">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Your Referral Code</h3>
              <div className="bg-purple-900/50 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-white font-mono text-lg">{referralCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyReferralCode}
                  className="text-purple-200 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleShare}
              className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with Friends
            </Button>
          </div>
        </Card>

        {/* Rewards System */}
        <Card className="bg-purple-900/20 border-purple-800 p-6">
          <h3 className="text-white mb-4">How it Works</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">1</span>
              </div>
              <div>
                <p className="text-white">Share your referral code</p>
                <p className="text-purple-200 text-sm">Send to friends who want to join Safetalk</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">2</span>
              </div>
              <div>
                <p className="text-white">They sign up using your code</p>
                <p className="text-purple-200 text-sm">Both of you get rewards when they join</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">3</span>
              </div>
              <div>
                <p className="text-white">Earn credits &amp; perks</p>
                <p className="text-purple-200 text-sm">Get rewards for every successful referral</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rewards Breakdown */}
        <Card className="bg-purple-900/20 border-purple-800 p-6">
          <h3 className="text-white mb-4">Rewards per Referral</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Free Users</span>
              </div>
              <Badge variant="secondary">5 credits</Badge>
            </div>
            
            {isPremium && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">Premium Users</span>
                  </div>
                  <Badge className="bg-gradient-accent text-white">+1 day premium</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">Premium Bonus</span>
                  </div>
                  <Badge variant="secondary">1 credit/day</Badge>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Recent Rewards */}
        <Card className="bg-purple-900/20 border-purple-800 p-6">
          <h3 className="text-white mb-4">Recent Rewards</h3>
          <div className="space-y-3">
            {recentRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    reward.type === 'credits' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {reward.type === 'credits' ? (
                      <Gift className="w-4 h-4 text-white" />
                    ) : (
                      <Crown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      {reward.type === 'credits' ? `${reward.amount} credits` : `${reward.amount} day premium`}
                    </p>
                    <p className="text-purple-200 text-xs">
                      from {reward.from} • {reward.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}