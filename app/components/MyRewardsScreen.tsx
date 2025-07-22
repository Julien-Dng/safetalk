import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Gift, Coins, Star, Crown, Palette, Zap, Trophy, Info } from "lucide-react";

interface MyRewardsScreenProps {
  onBack: () => void;
  giftableCredits: number;
  isPremium: boolean;
  onConvertCredits: () => void;
}

export function MyRewardsScreen({ 
  onBack, 
  giftableCredits, 
  isPremium,
  onConvertCredits 
}: MyRewardsScreenProps) {
  const canConvert = giftableCredits >= 15;
  const rewardsAvailable = Math.floor(giftableCredits / 15);

  const availableRewards = [
    {
      id: "theme",
      name: "Cosmic Theme",
      description: "Exclusive galaxy-inspired dark theme",
      icon: Palette,
      cost: 1,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "badge",
      name: "Premium Badge",
      description: "Show your supporter status",
      icon: Crown,
      cost: 1,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "boost",
      name: "Visibility Boost",
      description: "Higher priority in matching for 7 days",
      icon: Zap,
      cost: 2,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "vip",
      name: "VIP Status",
      description: "Special recognition and perks for 30 days",
      icon: Trophy,
      cost: 3,
      color: "from-purple-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header */}
      <div className="bg-purple-900/20 border-b border-purple-800 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-purple-200 hover:text-white hover:bg-purple-900/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <h1 className="text-white text-xl">My Rewards</h1>
          
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Credits Available to Offer */}
        <Card className="dark bg-purple-900/30 border-purple-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white text-lg">Credits Available to Offer</h3>
                <p className="text-purple-300 text-sm">Help others continue their conversations</p>
              </div>
            </div>

            <div className="bg-purple-900/50 rounded-2xl p-4">
              <div className="text-center mb-3">
                <div className="text-3xl text-yellow-400 mb-1">{giftableCredits}</div>
                <div className="text-purple-200 text-sm">Giftable credits</div>
              </div>
              
              {isPremium ? (
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-purple-200 text-sm">
                      You can send credits to your chat partner if they're on a free plan and their session ends.
                    </p>
                  </div>
                  
                  {giftableCredits === 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-200 text-sm">
                        💡 You need giftable credits to use this feature. Earn more through referrals or purchases.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Badge className="bg-gradient-accent text-white px-3 py-1">
                    Premium Feature
                  </Badge>
                  <p className="text-purple-300 text-sm mt-2">
                    Upgrade to Premium to gift credits to other users
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Convert Unused Credits */}
        {isPremium && (
          <Card className="dark bg-purple-900/30 border-purple-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white text-lg">Convert Unused Credits</h3>
                  <p className="text-purple-300 text-sm">Turn credits into exclusive rewards</p>
                </div>
              </div>

              <div className="bg-purple-900/50 rounded-2xl p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-200 text-sm">Progress to next reward</span>
                    <span className="text-purple-200 text-sm">
                      {giftableCredits}/15 credits
                    </span>
                  </div>
                  <Progress 
                    value={(giftableCredits % 15) / 15 * 100} 
                    className="h-2 bg-purple-900/50"
                  />
                </div>

                <div className="text-center mb-4">
                  <div className="text-purple-200 text-sm mb-1">Available rewards</div>
                  <div className="text-2xl text-white">{rewardsAvailable}</div>
                  <div className="text-purple-300 text-xs">15 credits = 1 reward</div>
                </div>

                <Button
                  onClick={onConvertCredits}
                  disabled={!canConvert}
                  className="w-full bg-gradient-accent hover:opacity-90 text-white disabled:opacity-50"
                >
                  {canConvert ? (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Use My Credits</span>
                    </div>
                  ) : (
                    <span>Need {15 - (giftableCredits % 15)} more credits</span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Available Rewards Preview */}
        {isPremium && rewardsAvailable > 0 && (
          <Card className="dark bg-purple-900/30 border-purple-700 p-6">
            <div className="space-y-4">
              <h3 className="text-white text-lg">Available Rewards</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {availableRewards.map((reward) => {
                  const IconComponent = reward.icon;
                  const canAfford = rewardsAvailable >= reward.cost;
                  
                  return (
                    <div
                      key={reward.id}
                      className={`p-3 rounded-2xl border ${
                        canAfford 
                          ? 'border-purple-600 bg-purple-900/20' 
                          : 'border-purple-800 bg-purple-900/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${reward.color} bg-opacity-20`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white text-sm">{reward.name}</h4>
                            <Badge 
                              variant="outline" 
                              className="border-purple-600 text-purple-200 text-xs"
                            >
                              {reward.cost} reward{reward.cost !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <p className="text-purple-300 text-xs">{reward.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Premium Upgrade CTA for Free Users */}
        {!isPremium && (
          <Card className="dark bg-gradient-accent/20 border-purple-600 p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-white text-lg">Unlock Rewards</h3>
                <p className="text-purple-200 text-sm">
                  Upgrade to Premium to access giftable credits, exclusive rewards, and help other users continue their conversations.
                </p>
              </div>
              
              <Button className="bg-gradient-accent hover:opacity-90 text-white">
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}