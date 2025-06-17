import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/use-pwa";

export default function InstallPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    showInstallPrompt, 
    installApp, 
    dismissPrompt 
  } = usePWA();

  if (!isInstallable || isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 slide-up">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Install YoBot® App</div>
                <div className="text-sm opacity-90">
                  Get quick access from your home screen
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={dismissPrompt}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={installApp}
                className="bg-white text-primary hover:bg-white/90"
              >
                Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
