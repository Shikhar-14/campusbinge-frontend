import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  thread_count?: number;
  post_count?: number;
  latest_thread?: {
    title: string;
    created_at: string;
    user: {
      display_name: string;
    };
  };
};

export const ForumCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error } = await supabase
        .from("forum_categories" as any)
        .select("*")
        .order("display_order");

      if (error) throw error;

      // Fetch thread and post counts for each category
      const categoriesWithStats = await Promise.all(
        (categoriesData || []).map(async (category: any) => {
          // Get thread count
          const { count: threadCount } = await supabase
            .from("forum_threads" as any)
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);

          // Get latest thread
          const { data: latestThread } = await supabase
            .from("forum_threads" as any)
            .select(`
              title,
              created_at,
              profiles:user_id (display_name)
            `)
            .eq("category_id", category.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...category,
            thread_count: threadCount || 0,
            latest_thread: latestThread ? (() => {
              const thread = latestThread as Record<string, any>;
              return 'title' in thread ? {
                  title: thread.title,
                  created_at: thread.created_at,
                  user: {
                    display_name: thread.profiles?.display_name || "Anonymous",
                  },
                } : undefined;
            })() : undefined,
          };
        })
      );

      setCategories(categoriesWithStats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    // You can expand this with more icons
    return <MessageSquare className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
          onClick={() => navigate(`/forum/category/${category.id}`)}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {getIconComponent(category.icon)}
              </div>
              <CardTitle className="text-xl">{category.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {category.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{category.thread_count} threads</span>
                </div>
              </div>
              <Badge variant="secondary">{category.display_order}</Badge>
            </div>
            {category.latest_thread && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Latest:</p>
                <p className="text-sm font-medium line-clamp-1 mt-1">
                  {category.latest_thread.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {category.latest_thread.user.display_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
