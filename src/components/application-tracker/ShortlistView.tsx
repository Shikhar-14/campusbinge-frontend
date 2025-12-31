// src/components/application-tracker/ShortlistView.tsx
/**
 * Shortlist View - Updated with Start Application flow
 * 
 * Shows shortlisted colleges with ability to:
 * - View college details
 * - Compare 2 colleges
 * - Start application (moves to applications list)
 * - Remove from shortlist
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  MapPin,
  Star,
  GraduationCap,
  X,
  ArrowLeftRight,
  Play,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CollegeComparison } from "./CollegeComparison";
import {
  createApplicationFromShortlist,
  checkApplicationExists,
} from "@/integrations/supabase/applications";
import type { CollegeData } from "@/data/collegesData";

export const ShortlistView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [shortlistedColleges, setShortlistedColleges] = useState<CollegeData[]>([]);
  const [shortlistIds, setShortlistIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Start Application Dialog State
  const [showStartAppDialog, setShowStartAppDialog] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<CollegeData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  
  // Track which colleges already have applications
  const [existingApps, setExistingApps] = useState<Set<string>>(new Set());

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
    } else if (data) {
      // Cast the JSON data to CollegeData
      const colleges = data.map(item => item.college_data as unknown as CollegeData);
      setShortlistedColleges(colleges);
      
      // Map college_id to shortlist row id
      const idMap: Record<string, string> = {};
      data.forEach(item => {
        idMap[item.college_id] = item.id;
      });
      setShortlistIds(idMap);
      
      // Check which colleges already have applications
      await checkExistingApplications(colleges);
    }
    setLoading(false);
  };

  const checkExistingApplications = async (colleges: CollegeData[]) => {
    const existing = new Set<string>();
    
    for (const college of colleges) {
      for (const course of college.courses) {
        const result = await checkApplicationExists(college.name, course.name);
        if (result.exists) {
          existing.add(`${college.id}-${course.name}`);
        }
      }
    }
    
    setExistingApps(existing);
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

  // Start Application Flow
  const handleStartApplication = (college: CollegeData) => {
    setSelectedCollege(college);
    setSelectedCourse(college.courses[0]?.name || "");
    setShowStartAppDialog(true);
  };

  const handleCreateApplication = async () => {
    if (!selectedCollege || !selectedCourse) return;

    // Check if application already exists
    const key = `${selectedCollege.id}-${selectedCourse}`;
    if (existingApps.has(key)) {
      toast({
        title: "Application Exists",
        description: "You already have an application for this course",
      });
      setShowStartAppDialog(false);
      return;
    }

    setIsCreatingApp(true);

    const shortlistId = shortlistIds[selectedCollege.id];
    const result = await createApplicationFromShortlist(
      selectedCollege,
      selectedCourse,
      shortlistId
    );

    setIsCreatingApp(false);

    if (result.success) {
      toast({
        title: "Application Created!",
        description: `Started application for ${selectedCollege.name} - ${selectedCourse}`,
      });
      
      // Mark as having application
      setExistingApps(prev => new Set([...prev, key]));
      
      setShowStartAppDialog(false);
      
      // Navigate to applications tab
      navigate("/application-tracker", { 
        state: { activeTab: "applications" } 
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create application",
        variant: "destructive",
      });
    }
  };

  // Helper to check if any course has an application
  const hasAnyApplication = (college: CollegeData): boolean => {
    return college.courses.some(course => 
      existingApps.has(`${college.id}-${course.name}`)
    );
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
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shortlist</h1>
            <p className="text-muted-foreground">
              {shortlistedColleges.length === 0 
                ? "Start shortlisting colleges from Chat or Apply Direct section"
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

      {/* Empty State */}
      {shortlistedColleges.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Colleges Shortlisted Yet</h3>
            <p className="text-muted-foreground mb-4">
              Ask our AI assistant for college recommendations and click "Save" to add them here
            </p>
            <Button onClick={() => navigate("/")}>
              Go to Chat
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* College Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortlistedColleges.map((college) => {
            const isSelectedForComparison = selectedForComparison.includes(college.id);
            const hasApp = hasAnyApplication(college);
            
            return (
              <Card key={college.id} className="glass-card overflow-hidden">
                {/* Image Header */}
                <div className="w-full h-32 overflow-hidden relative">
                  <img 
                    src={college.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(college.name)}&size=400&background=6366f1&color=fff`} 
                    alt={college.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                    onClick={() => handleRemove(college.id, college.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Application Status Badge */}
                  {hasApp && (
                    <Badge className="absolute top-2 left-2 bg-green-500/90">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}

                  {/* College Name */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-base font-bold text-white line-clamp-1">{college.name}</h3>
                    {college.campusName && (
                      <p className="text-white/80 text-xs">{college.campusName}</p>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{college.city}, {college.state}</span>
                  </div>

                  {/* NIRF Ranking */}
                  {college.nirfRanking && (
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">{college.nirfRanking}</span>
                    </div>
                  )}

                  {/* Courses Count */}
                  <div className="flex items-center gap-2 glass p-2 rounded-lg">
                    <GraduationCap className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium">{college.courses.length} Courses</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {/* Compare Checkbox */}
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={isSelectedForComparison}
                        onCheckedChange={() => handleCompareToggle(college.id)}
                        disabled={selectedForComparison.length >= 2 && !isSelectedForComparison}
                      />
                      <label className="text-xs text-muted-foreground cursor-pointer">
                        Compare
                      </label>
                    </div>

                    {/* Start Application Button */}
                    <Button
                      size="sm"
                      variant={hasApp ? "secondary" : "default"}
                      className="gap-1"
                      onClick={() => handleStartApplication(college)}
                    >
                      {hasApp ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          View
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && college1 && college2 && (
        <CollegeComparison
          college1={college1}
          college2={college2}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Start Application Dialog */}
      <Dialog open={showStartAppDialog} onOpenChange={setShowStartAppDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Application</DialogTitle>
            <DialogDescription>
              {selectedCollege?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCollege?.courses.map((course) => {
                    const key = `${selectedCollege.id}-${course.name}`;
                    const hasExisting = existingApps.has(key);
                    
                    return (
                      <SelectItem 
                        key={course.name} 
                        value={course.name}
                        disabled={hasExisting}
                      >
                        <div className="flex items-center gap-2">
                          <span>{course.name}</span>
                          {hasExisting && (
                            <Badge variant="secondary" className="text-xs">
                              Applied
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && selectedCollege && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p><span className="font-medium">Course:</span> {selectedCourse}</p>
                {selectedCollege.courses.find(c => c.name === selectedCourse)?.fees && (
                  <p>
                    <span className="font-medium">Fees:</span>{" "}
                    ₹{selectedCollege.courses.find(c => c.name === selectedCourse)?.fees.toLocaleString("en-IN")}/year
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartAppDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApplication} 
              disabled={!selectedCourse || isCreatingApp}
            >
              {isCreatingApp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};