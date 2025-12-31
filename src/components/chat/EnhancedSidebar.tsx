import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Plus, Trash2, MoreVertical, Users, User, FileText, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import logo from "@/assets/campus-binge-logo.png";
import logoIcon from "@/assets/campus-binge-icon.png";
import bhAiLogo from "@/assets/bh-ai-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type EnhancedSidebarProps = {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
};

export const EnhancedSidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: EnhancedSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const [conversationsOpen, setConversationsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * ✅ FIX: Changed from "profiles" to "student_profiles"
   * The "profiles" table doesn't exist - we use "student_profiles" instead.
   */
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")  // ✅ FIXED: was "profiles"
        .select("full_name, city, state")  // Only select fields we need for display
        .eq("user_id", userId)
        .maybeSingle();  // Use maybeSingle() to handle case where profile doesn't exist

      if (error) {
        console.warn("Error loading profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error loading profile:", err);
    }
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  };

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Conversation deleted successfully",
    });

    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const navigationItems = [
    { icon: Sparkles, label: "Bh.AI", path: "/", customIcon: bhAiLogo },
    { icon: Users, label: "Forum", path: "/forum" },
    { icon: User, label: "ONE-Profile", path: "/profile" },
    { icon: FileText, label: "Application Tracker", path: "/application-tracker" },
  ];

  /**
   * ✅ FIX: Updated to use full_name from student_profiles
   * Previously used display_name from non-existent profiles table
   */
  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return user?.email || "User";
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r" 
      data-sidebar
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarHeader className="border-b pb-3">
        <div className="flex items-center justify-center transition-all duration-300">
          <img 
            src={open ? logo : logoIcon} 
            alt="Campus Binge" 
            className={cn(
              "cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 object-contain",
              open ? "h-16 w-auto opacity-100" : "h-10 w-10 shrink-0 opacity-100"
            )}
            onClick={() => navigate('/')}
            title="Campus Binge"
          />
        </div>
        <Button 
          onClick={onNewConversation} 
          className={cn(
            "shrink-0 transition-all duration-300 ease-in-out",
            open ? "w-full" : ""
          )} 
          size={open ? "default" : "icon"}
          title="New Chat"
        >
          <Plus className="h-4 w-4 transition-transform duration-200" />
          {open && (
            <span className="ml-2 animate-fade-in">New Chat</span>
          )}
        </Button>
      </SidebarHeader>

      <SidebarContent className="transition-all duration-300">
        <Collapsible
          open={conversationsOpen}
          onOpenChange={setConversationsOpen}
          className="transition-all duration-300"
        >
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 transition-colors">
                <SidebarGroupLabel className="transition-opacity duration-300 flex-1">
                  Conversations
                </SidebarGroupLabel>
                {open && (
                  conversationsOpen ? 
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" /> : 
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="transition-all duration-300">
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.map((conv, index) => (
                    <SidebarMenuItem 
                      key={conv.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-1 w-full transition-all duration-200">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 flex-shrink-0 transition-all duration-200",
                                !open && "opacity-0 w-0 h-0 overflow-hidden"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 animate-scale-in">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer transition-colors duration-150"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(conv.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conv.id)}
                          isActive={currentConversationId === conv.id}
                          tooltip={conv.title}
                          className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                        >
                          <MessageSquare className="w-4 h-4 transition-transform duration-200" />
                          {open && (
                            <span className="truncate animate-fade-in">
                              {conv.title}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupLabel className="transition-opacity duration-300">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.path}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                    className="transition-all duration-200 hover:scale-[1.02]"
                  >
                    {item.customIcon ? (
                      <img src={item.customIcon} alt={item.label} className="w-4 h-4 object-contain transition-transform duration-200" />
                    ) : (
                      <item.icon className="w-4 h-4 transition-transform duration-200" />
                    )}
                    {open && (
                      <span className="animate-fade-in">{item.label}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t transition-all duration-300">
          <div className="p-4">
            <div 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-all duration-300"
            >
              <Avatar className={cn(
                "flex-shrink-0 transition-all duration-300",
                !open && "h-10 w-10",
                open && "h-8 w-8"
              )}>
                {/* Note: student_profiles doesn't have avatar_url, using fallback */}
                <AvatarImage src="" alt={user.email || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                  {profile?.city && profile?.state && (
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.city}, {profile.state}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
