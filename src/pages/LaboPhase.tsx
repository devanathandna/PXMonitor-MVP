import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Pin, Send } from "lucide-react";

const LaboPhase = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setChatHistory([...chatHistory, { role: "user", text: message }]);
    setMessage("");
    
    // TODO: Integrate with MCP server
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log("File upload clicked");
  };

  const handlePin = () => {
    // TODO: Implement pin functionality
    console.log("Pin clicked");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header: Takes its own height */}
      <div className="text-center py-8 px-6 border-b">
        <h1 className="text-4xl font-bold font-montserrat mb-3 text-neonBlue">
          Labo Phase
        </h1>
        <p className="text-muted-foreground text-sm">
          MCP Server AI for Network diagnostics and System monitoring operations.
        </p>
      </div>

      {/* Chat Box: Fills remaining space and is scrollable */}
      <div className="flex-1 mx-auto w-full max-w-4xl px-6 overflow-y-auto scrollbar-hide">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with the Labo Phase AI...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-neonBlue text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area: Fixed at bottom, takes its own height */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-3 bg-muted rounded-3xl px-4 py-3 border border-border">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className="h-10 w-10 rounded-full hover:bg-muted-foreground/10"
              >
                <Upload size={20} />
              </Button>
            </div>

            {/* Message Input */}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Labo Phase..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-lg px-2 h-12"
            />

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!message.trim()}
              className="h-12 w-12 rounded-full bg-neonBlue hover:bg-neonBlue/90 shrink-0"
            >
              <Send size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboPhase;
