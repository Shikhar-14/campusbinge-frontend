import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { EnhancedSidebar } from "./chat/EnhancedSidebar";
import { SidebarProvider } from "./ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    return localStorage.getItem('lastConversationId');
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('lastConversationId', currentConversationId);
    }
  }, [currentConversationId]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    localStorage.removeItem('lastConversationId');
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EnhancedSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={(id) => {
            setCurrentConversationId(id);
            navigate('/');
          }}
          onNewConversation={handleNewConversation}
        />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
