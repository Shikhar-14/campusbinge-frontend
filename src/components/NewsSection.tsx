import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Newspaper, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

export const NewsSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchNews = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("news");
      
      if (error) {
        console.error("Error fetching news:", error);
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to refresh news",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.articles) {
        setArticles(data.articles);
        if (showToast) {
          toast({
            title: "News Updated",
            description: `Loaded ${data.articles.length} latest articles`,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to refresh news",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      if (showToast) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Newspaper className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">Latest News for Students</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold">Latest News for Students</h2>
          <Badge variant="outline" className="ml-auto">
            <Clock className="w-3 h-3 mr-1" />
            Auto-updates every 5 min
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() => window.open(article.url, '_blank')}
            >
              {article.urlToImage && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {article.source.name}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
