import { Button } from "./ui/button";
import { ArrowLeft, MessageCircle, Ear, Users } from "lucide-react";
import { useState } from "react";

interface SetupScreenProps {
  onBack: () => void;
  onComplete: (role: string) => void;
}

export function SetupScreen({ onBack, onComplete }: SetupScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  const roles = [
    {
      id: "talk",
      title: "I want to talk",
      description: "Share what's on your mind",
      icon: MessageCircle,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      id: "listen", 
      title: "I want to listen",
      description: "Be there for someone else",
      icon: Ear,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      id: "both",
      title: "I'm open to both",
      description: "No preference • Go with the flow",
      icon: Users,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    }
  ];

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-purple-200 hover:text-white hover:bg-purple-900/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="w-full max-w-md text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-2xl text-white">
            How would you like to connect today?
          </h1>
          <p className="text-purple-200">
            Choose your preferred role for meaningful conversations
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-purple-400 bg-purple-900/30"
                    : "border-purple-800 bg-purple-900/10 hover:bg-purple-900/20 hover:border-purple-600"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white text-lg font-medium">
                      {role.title}
                    </h3>
                    <p className="text-purple-300 text-sm">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full h-12 bg-gradient-accent hover:opacity-90 text-white rounded-2xl disabled:opacity-50"
        >
          Continue
        </Button>

        {/* Helper Text */}
        <p className="text-purple-400 text-sm">
          💡 You can change your preference anytime in settings
        </p>
      </div>
    </div>
  );
}