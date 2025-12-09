import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInterface } from "@/components/ChatInterface";
import { EnhancedSidebar } from "@/components/chat/EnhancedSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const AIAssistant = () => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    // Load last conversation from localStorage on mount
    return localStorage.getItem('lastConversationId');
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Save conversation ID to localStorage whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('lastConversationId', currentConversationId);
    }
  }, [currentConversationId]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    localStorage.removeItem('lastConversationId');
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <EnhancedSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={handleNewConversation}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistant;
