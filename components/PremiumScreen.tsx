import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Crown, MessageCircle, Zap, Shield, Users, Star, Check } from "lucide-react";

interface PremiumScreenProps {
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function PremiumScreen({ onBack, isPremium, onUpgrade }: PremiumScreenProps) {
  const features = [
    {
      icon: MessageCircle,
      title: "Unlimited Chats",
      description: "Chat as long as you want without time limits",
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: "No Ads",
      description: "Enjoy an uninterrupted, clean experience",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Message Control",
      description: "Choose whether to save important conversations",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Priority Matching",
      description: "Get connected faster with priority queue",
      color: "bg-yellow-500"
    },
    {
      icon: Star,
      title: "Exclusive Features",
      description: "Access to beta features and special perks",
      color: "bg-pink-500"
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show your support with a special badge",
      color: "bg-indigo-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      savings: null,
      popular: false
    },
    {
      name: "Yearly",
      price: "$79.99",
      period: "per year",
      savings: "Save 33%",
      popular: true
    }
  ];

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
        <h2 className="text-white">Premium</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 px-6 pb-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-accent rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-white text-2xl mb-2">Safetalk Premium</h3>
            <p className="text-purple-200">
              Unlock the full potential of anonymous conversations
            </p>
          </div>
          
          {isPremium && (
            <Badge className="bg-gradient-accent text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium Active
            </Badge>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-purple-900/20 border-purple-800 p-4">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">{feature.title}</h4>
                  <p className="text-purple-200 text-sm">{feature.description}</p>
                </div>
                {isPremium && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        {!isPremium && (
          <div className="space-y-4">
            <h3 className="text-white text-center">Choose Your Plan</h3>
            <div className="grid grid-cols-1 gap-4">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`p-6 cursor-pointer transition-all border-2 ${
                    plan.popular
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-purple-800 bg-purple-900/10 hover:border-purple-600"
                  }`}
                >
                  <div className="text-center space-y-3">
                    {plan.popular && (
                      <Badge className="bg-gradient-accent text-white">
                        Most Popular
                      </Badge>
                    )}
                    <div>
                      <h4 className="text-white text-lg">{plan.name}</h4>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-white text-3xl font-bold">{plan.price}</span>
                        <span className="text-purple-200 text-sm">{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <p className="text-green-400 text-sm mt-1">{plan.savings}</p>
                      )}
                    </div>
                    <Button
                      onClick={onUpgrade}
                      className={`w-full rounded-2xl ${
                        plan.popular
                          ? "bg-gradient-accent hover:opacity-90 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      Select {plan.name}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Premium Stats */}
        {isPremium && (
          <Card className="bg-purple-900/20 border-purple-800 p-6">
            <h3 className="text-white mb-4">Your Premium Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-white text-2xl font-bold">∞</div>
                <div className="text-purple-200 text-sm">Unlimited chats</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">24/7</div>
                <div className="text-purple-200 text-sm">Priority support</div>
              </div>
            </div>
          </Card>
        )}

        {/* FAQ */}
        <Card className="bg-purple-900/20 border-purple-800 p-6">
          <h3 className="text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-white text-sm mb-1">Can I cancel anytime?</h4>
              <p className="text-purple-200 text-sm">Yes, you can cancel your subscription at any time from your account settings.</p>
            </div>
            <div>
              <h4 className="text-white text-sm mb-1">What happens to my chats?</h4>
              <p className="text-purple-200 text-sm">Chats remain anonymous and ephemeral. Premium just removes time limits.</p>
            </div>
            <div>
              <h4 className="text-white text-sm mb-1">Is my data safe?</h4>
              <p className="text-purple-200 text-sm">We prioritize privacy and security. Your conversations are encrypted and anonymous.</p>
            </div>
          </div>
        </Card>

        {/* Manage Subscription */}
        {isPremium && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full text-purple-300 hover:text-white hover:bg-purple-900/30"
            >
              Manage Subscription
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}