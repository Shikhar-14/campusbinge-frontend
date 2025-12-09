import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star, GraduationCap, X, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CollegeData } from "@/data/collegesData";
import { CollegeComparison } from "./CollegeComparison";
import { Checkbox } from "@/components/ui/checkbox";

export const ShortlistView = () => {
  const [shortlistedColleges, setShortlistedColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("shortlisted_colleges")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shortlist:", error);
    } else {
      setShortlistedColleges(data.map(item => item.college_data as any as CollegeData));
    }
    setLoading(false);
  };

  const handleRemove = async (collegeId: string, collegeName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("shortlisted_colleges")
      .delete()
      .eq("user_id", user.id)
      .eq("college_id", collegeId);

    if (!error) {
      setShortlistedColleges(prev => prev.filter(c => c.id !== collegeId));
      setSelectedForComparison(prev => prev.filter(id => id !== collegeId));
      toast({
        title: "Removed from Shortlist",
        description: `${collegeName} has been removed from your shortlist`,
      });
    }
  };

  const handleCompareToggle = (collegeId: string) => {
    if (selectedForComparison.includes(collegeId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== collegeId));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison(prev => [...prev, collegeId]);
    } else {
      toast({
        title: "Maximum Selection Reached",
        description: "You can only compare 2 colleges at a time",
      });
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2) {
      setShowComparison(true);
    }
  };

  const college1 = shortlistedColleges.find(c => c.id === selectedForComparison[0]);
  const college2 = shortlistedColleges.find(c => c.id === selectedForComparison[1]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-6">
          <h1 className="text-3xl font-bold mb-2">Shortlist</h1>
          <p className="text-muted-foreground">Loading your shortlisted colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shortlist</h1>
            <p className="text-muted-foreground">
              {shortlistedColleges.length === 0 
                ? "Start shortlisting colleges from the Apply Direct section"
                : `${shortlistedColleges.length} college${shortlistedColleges.length !== 1 ? 's' : ''} shortlisted`
              }
            </p>
          </div>
          {selectedForComparison.length === 2 && (
            <Button onClick={handleCompare} className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Compare Selected
            </Button>
          )}
        </div>
      </div>

      {shortlistedColleges.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Colleges Shortlisted Yet</h3>
            <p className="text-muted-foreground">
              Browse colleges in the Apply Direct section and click the heart icon to add them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortlistedColleges.map((college) => {
            const isSelectedForComparison = selectedForComparison.includes(college.id);
            return (
              <Card key={college.id} className="glass-card overflow-hidden">
                <div className="w-full h-32 overflow-hidden relative">
                  <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                    onClick={() => handleRemove(college.id, college.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-base font-bold text-white line-clamp-1">{college.name}</h3>
                    {college.campusName && (
                      <p className="text-white/80 text-xs">{college.campusName}</p>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{college.city}, {college.state}</span>
                  </div>

                  {college.nirfRanking && (
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">{college.nirfRanking}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 glass p-2 rounded-lg">
                    <GraduationCap className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium">{college.courses.length} Courses</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Checkbox
                      checked={isSelectedForComparison}
                      onCheckedChange={() => handleCompareToggle(college.id)}
                      disabled={selectedForComparison.length >= 2 && !isSelectedForComparison}
                    />
                    <label className="text-xs text-muted-foreground cursor-pointer">
                      Compare
                    </label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showComparison && college1 && college2 && (
        <CollegeComparison
          college1={college1}
          college2={college2}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};
