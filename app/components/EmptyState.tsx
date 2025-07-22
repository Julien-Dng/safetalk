import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Users, Bot, Search, Clock, MessageCircle, User, Settings } from "lucide-react";

interface EmptyStateProps {
  onFindPartner: () => void;
  onChatWithAI: () => void;
  onResumeChat?: () => void;
  hasActiveSession?: boolean;
  activeSessionPartner?: string;
  onShowAccount: () => void; // New prop for account access
}

export function EmptyState({ 
  onFindPartner,
  onChatWithAI, 
  onResumeChat,
  hasActiveSession = false,
  activeSessionPartner,
  onShowAccount // New prop
}: EmptyStateProps) {
  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header with Account Access Button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAccount}
          className="text-purple-200 hover:text-white hover:bg-purple-900/20"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Illustration */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-white text-xl mb-2">
              {hasActiveSession ? "Ready to chat?" : "No one is available right now"}
            </h3>
            <p className="text-purple-200">
              {hasActiveSession 
                ? "You can resume your conversation or find a new chat partner."
                : "Don't worry, people join Safetalk throughout the day. You can try again in a few minutes."
              }
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Resume Chat Button - Only show if there's an active session */}
            {hasActiveSession && onResumeChat && (
              <Button
                onClick={onResumeChat}
                className="w-full bg-gradient-accent hover:opacity-90 h-12 rounded-2xl flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Resume Chat</span>
                {activeSessionPartner && (
                  <span className="text-purple-200 text-sm">
                    with {activeSessionPartner}
                  </span>
                )}
              </Button>
            )}

            {/* Find a partner Button */}
            <Button
              onClick={onFindPartner}
              className={`w-full ${
                hasActiveSession 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "bg-purple-600 hover:bg-purple-700"
              } h-12 rounded-2xl flex items-center justify-center space-x-2`}
            >
              <Search className="w-4 h-4" />
              <span>Find a partner</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-purple-800"></div>
              <span className="text-purple-400 text-sm">or</span>
              <div className="flex-1 h-px bg-purple-800"></div>
            </div>

            <Button
              onClick={onChatWithAI}
              variant="outline"
              className="w-full border-purple-700 text-purple-200 hover:bg-purple-900/30 h-12 rounded-2xl flex items-center justify-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Chat with AI Assistant</span>
            </Button>
          </div>

          {/* Active Session Info - Only show if there's an active session */}
          {hasActiveSession && activeSessionPartner && (
            <Card className="bg-purple-900/30 border-purple-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm">Active conversation</div>
                  <div className="text-purple-200 text-xs">{activeSessionPartner}</div>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-purple-900/20 border-purple-800 p-4">
            <h4 className="text-purple-200 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Best times to connect
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-300">Peak hours:</span>
                <span className="text-white">7-10 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Weekends:</span>
                <span className="text-white">Most active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time zones:</span>
                <span className="text-white">Global users</span>
              </div>
            </div>
          </Card>

          {/* Community Stats */}
          <div className="bg-purple-900/20 rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-white text-lg font-bold">2.1K</div>
                <div className="text-purple-200 text-xs">Active today</div>
              </div>
              <div>
                <div className="text-white text-lg font-bold">156</div>
                <div className="text-purple-200 text-xs">Online now</div>
              </div>
              <div>
                <div className="text-white text-lg font-bold">45K</div>
                <div className="text-purple-200 text-xs">Total chats</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-purple-400 text-sm">
            <p>New to Safetalk? Check out our</p>
            <Button variant="link" className="text-purple-300 p-0 h-auto">
              Community Guidelines
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}