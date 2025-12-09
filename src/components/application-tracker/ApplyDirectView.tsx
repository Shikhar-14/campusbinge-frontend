import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin, Calendar, CalendarIcon, Star, IndianRupee, CheckCircle, Clock, Sparkles, Building2, Heart, Search } from "lucide-react";
import { collegesData, type CollegeData } from "@/data/collegesData";
import { CollegeDetailsDialog } from "./CollegeDetailsDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AIApplicationAssistant } from "./AIApplicationAssistant";
import { AIFieldSuggestion } from "./AIFieldSuggestion";
import { supabase } from "@/integrations/supabase/client";

const applicationFormSchema = z.object({
  // Course Selection
  selectedCourse: z.string().min(1, "Please select a course"),
  
  // Course Type Selection
  courseLevel: z.enum(["ug", "pg"], { required_error: "Please select UG or PG" }),
  
  // Personal Information
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  
  // Academic Information
  currentEducation: z.enum(["10th", "12th", "undergraduate", "postgraduate"], { required_error: "Select education level" }),
  boardUniversity: z.string().trim().min(2, "Board/University required").max(200),
  percentage: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter valid percentage").refine(val => parseFloat(val) >= 0 && parseFloat(val) <= 100, "Must be 0-100"),
  passingYear: z.string().trim().regex(/^\d{4}$/, "Invalid year"),
  
  // Entrance Exam (if applicable)
  entranceExamTaken: z.enum(["yes", "no"], { required_error: "Required" }),
  examName: z.string().optional(),
  examScore: z.string().optional(),
  examRank: z.string().optional(),
  
  // Address
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500),
  city: z.string().trim().min(2, "City required").max(100),
  state: z.string().trim().min(2, "State required").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Invalid pincode"),
  
  // Parent/Guardian Information
  parentName: z.string().trim().min(2, "Parent/Guardian name required").max(100),
  parentPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  parentEmail: z.string().trim().email("Invalid email").max(255),
  parentOccupation: z.string().trim().min(2, "Occupation required").max(100),
  annualIncome: z.string().trim().min(1, "Annual income required"),
  
  // Additional Information
  previousSchool: z.string().trim().min(2, "School/College name required").max(200),
  extracurricular: z.string().max(1000).optional(),
  achievements: z.string().max(1000).optional(),
  whyThisUniversity: z.string().trim().min(50, "Please write at least 50 characters").max(1000),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

type ApplyDirectViewProps = {
  careerInfo?: {
    course?: string;
    colleges?: string[];
    careerPath?: string;
  };
};

export const ApplyDirectView = ({ careerInfo }: ApplyDirectViewProps) => {
  const [selectedCollege, setSelectedCollege] = useState<CollegeData | null>(null);
  const [showCollegeDetails, setShowCollegeDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch shortlisted colleges
  useEffect(() => {
    const fetchShortlisted = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("shortlisted_colleges")
        .select("college_id")
        .eq("user_id", user.id);

      if (data) {
        setShortlistedIds(new Set(data.map(item => item.college_id)));
      }
    };

    fetchShortlisted();
  }, []);

  // Flexible search function that handles partial matches and special characters
  const searchMatches = (college: CollegeData, query: string): boolean => {
    if (!query) return true;
    
    // Normalize strings: lowercase and remove special characters
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    const normalizedQuery = normalize(query);
    const normalizedName = normalize(college.name);
    const normalizedCity = normalize(college.city);
    const normalizedState = normalize(college.state);
    
    // Split query into words
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    
    // Check if all query words appear in the college name (in order, but not necessarily consecutive)
    const nameMatches = queryWords.every(word => normalizedName.includes(word));
    const cityMatches = queryWords.every(word => normalizedCity.includes(word));
    const stateMatches = queryWords.every(word => normalizedState.includes(word));
    
    return nameMatches || cityMatches || stateMatches;
  };

  // Filter and sort universities based on career info and search query
  const filteredUniversities = careerInfo?.colleges 
    ? collegesData
        .filter(uni => {
          const matchesCareer = careerInfo.colleges?.some(college => 
            uni.name.toLowerCase().includes(college.toLowerCase()) || 
            college.toLowerCase().includes(uni.name.toLowerCase())
          );
          const matchesSearch = searchMatches(uni, searchQuery);
          return matchesCareer && matchesSearch;
        })
        .sort((a, b) => {
          // Sort by matching order in career colleges list
          const aIndex = careerInfo.colleges?.findIndex(c => 
            a.name.toLowerCase().includes(c.toLowerCase()) || 
            c.toLowerCase().includes(a.name.toLowerCase())
          ) ?? 999;
          const bIndex = careerInfo.colleges?.findIndex(c => 
            b.name.toLowerCase().includes(c.toLowerCase()) || 
            c.toLowerCase().includes(b.name.toLowerCase())
          ) ?? 999;
          return aIndex - bIndex;
        })
    : collegesData.filter(uni => searchMatches(uni, searchQuery));

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      courseLevel: undefined,
      fullName: "",
      email: "",
      phone: "",
      gender: undefined,
      currentEducation: undefined,
      boardUniversity: "",
      percentage: "",
      passingYear: "",
      selectedCourse: "",
      entranceExamTaken: undefined,
      examName: "",
      examScore: "",
      examRank: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      parentOccupation: "",
      annualIncome: "",
      previousSchool: "",
      extracurricular: "",
      achievements: "",
      whyThisUniversity: "",
    },
  });

  const handleApplyClick = (college: CollegeData, courseName: string) => {
    setSelectedCollege(college);
    setSelectedCourse(courseName);
    
    // Auto-fill from ONE-Profile
    const savedProfile = localStorage.getItem("universityProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        
        // Auto-fill personal information
        if (profile.fullName) form.setValue("fullName", profile.fullName);
        if (profile.email) form.setValue("email", profile.email);
        if (profile.phone) form.setValue("phone", profile.phone);
        if (profile.dateOfBirth) form.setValue("dateOfBirth", new Date(profile.dateOfBirth));
        if (profile.gender) form.setValue("gender", profile.gender);
        
        // Auto-fill academic information
        if (profile.twelfthBoard) form.setValue("boardUniversity", profile.twelfthBoard);
        if (profile.twelfthPercentage) form.setValue("percentage", profile.twelfthPercentage);
        if (profile.twelfthYearOfPassing) form.setValue("passingYear", profile.twelfthYearOfPassing);
        
        // Auto-fill entrance exam
        if (profile.entranceExam) {
          form.setValue("entranceExamTaken", "yes");
          form.setValue("examName", profile.entranceExam);
          if (profile.entranceScore) form.setValue("examScore", profile.entranceScore);
        } else {
          form.setValue("entranceExamTaken", "no");
        }
        
        // Auto-fill address
        if (profile.permanentAddress) form.setValue("address", profile.permanentAddress);
        if (profile.city) form.setValue("city", profile.city);
        if (profile.state) form.setValue("state", profile.state);
        if (profile.pincode) form.setValue("pincode", profile.pincode);
        
        // Auto-fill parent information
        if (profile.fatherName) form.setValue("parentName", profile.fatherName);
        if (profile.fatherPhone) form.setValue("parentPhone", profile.fatherPhone);
        if (profile.fatherEmail) form.setValue("parentEmail", profile.fatherEmail);
        if (profile.fatherOccupation) form.setValue("parentOccupation", profile.fatherOccupation);
        if (profile.annualFamilyIncome) {
          // Map income range to form value
          const incomeMap: { [key: string]: string } = {
            "below-1": "Below ₹1 Lakh",
            "1-2.5": "₹1-2.5 Lakhs",
            "2.5-5": "₹2.5-5 Lakhs",
            "5-8": "₹5-8 Lakhs",
            "8-15": "₹8-15 Lakhs",
            "above-15": "Above ₹15 Lakhs"
          };
          form.setValue("annualIncome", incomeMap[profile.annualFamilyIncome] || profile.annualFamilyIncome);
        }
        
        // Auto-fill previous school
        if (profile.twelfthSchool) {
          form.setValue("previousSchool", profile.twelfthSchool);
        } else if (profile.tenthSchool) {
          form.setValue("previousSchool", profile.tenthSchool);
        }
        
        // Auto-fill preferences for essays
        if (profile.extraCurricular?.length > 0) {
          form.setValue("extracurricular", profile.extraCurricular.join(", "));
        }
        if (profile.careerGoals) {
          form.setValue("whyThisUniversity", `I am passionate about ${profile.careerGoals} and believe ${college.name} offers the perfect environment to achieve my goals.`);
        }
        
        toast({
          title: "Profile Auto-filled! ✨",
          description: "Your ONE-Profile data has been loaded. Review and complete any missing fields.",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    } else {
      toast({
        title: "Complete Your ONE-Profile",
        description: "Fill out your ONE-Profile to auto-fill applications faster! Visit the ONE-Profile page to complete your information.",
      });
    }
    
    form.setValue("selectedCourse", courseName);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    if (!selectedCollege) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit an application",
          variant: "destructive",
        });
        return;
      }

      // Create application in database
      const { data: application, error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          university: selectedCollege.name + (selectedCollege.campusName ? ` - ${selectedCollege.campusName}` : ""),
          country: "IN",
          portal: "DIRECT",
          course: selectedCourse,
          level: selectedCourse.toLowerCase().includes("mtech") || 
                 selectedCourse.toLowerCase().includes("mba") ||
                 selectedCourse.toLowerCase().includes("m.tech") ||
                 selectedCourse.toLowerCase().includes("m.sc") ? "PG" : "UG",
          term: format(new Date(), "yyyy"),
          deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), "yyyy-MM-dd"),
          fee_amount: 5000,
          fee_paid: false,
          current_status: "DRAFT",
          image_url: selectedCollege.image,
        })
        .select()
        .single();

      if (error) throw error;

      // Create an event for application creation
      await supabase.from("events").insert({
        application_id: application.id,
        type: "CREATED",
        detail: `Application created for ${selectedCollege.name}`,
      });

      toast({
        title: "Application Submitted Successfully! 🎉",
        description: `Your application to ${selectedCollege.name} for ${selectedCourse} has been saved. You can track it in the dashboard.`,
        duration: 5000,
      });

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const examTaken = form.watch("entranceExamTaken");

  const handleShortlist = async (college: CollegeData, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to shortlist colleges",
        variant: "destructive",
      });
      return;
    }

    const isShortlisted = shortlistedIds.has(college.id);

    if (isShortlisted) {
      // Remove from shortlist
      const { error } = await supabase
        .from("shortlisted_colleges")
        .delete()
        .eq("user_id", user.id)
        .eq("college_id", college.id);

      if (!error) {
        const newSet = new Set(shortlistedIds);
        newSet.delete(college.id);
        setShortlistedIds(newSet);
        toast({
          title: "Removed from Shortlist",
          description: `${college.name} has been removed from your shortlist`,
        });
      }
    } else {
      // Add to shortlist
      const { error } = await supabase
        .from("shortlisted_colleges")
        .insert([{
          user_id: user.id,
          college_id: college.id,
          college_name: college.name,
          college_data: college as any,
        }]);

      if (!error) {
        const newSet = new Set(shortlistedIds);
        newSet.add(college.id);
        setShortlistedIds(newSet);
        toast({
          title: "Added to Shortlist",
          description: `${college.name} has been added to your shortlist`,
        });
      } else if (error.code === "23505") {
        toast({
          title: "Already Shortlisted",
          description: `${college.name} is already in your shortlist`,
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold mb-2">
          {careerInfo?.careerPath ? `Apply for ${careerInfo.careerPath}` : 'Apply Directly'}
        </h1>
        <p className="text-muted-foreground">
          {careerInfo?.course 
            ? `Browse top universities for ${careerInfo.course}, ranked by best fit for your career path`
            : 'Browse universities and apply directly through our platform'}
        </p>
        {careerInfo?.colleges && careerInfo.colleges.length > 0 && (
          <div className="mt-4 p-4 glass rounded-lg">
            <p className="text-sm font-medium mb-2">Recommended Colleges (ranked best to least):</p>
            <div className="flex flex-wrap gap-2">
              {careerInfo.colleges.map((college, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {idx + 1}. {college}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search colleges by name, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUniversities.map((university, index) => {
          const isShortlisted = shortlistedIds.has(university.id);
          return (
            <Card 
              key={university.id} 
              className="glass-card overflow-hidden hover:scale-[1.02] transition-all cursor-pointer" 
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                setSelectedCollege(university);
                setShowCollegeDetails(true);
              }}
            >
              {/* University Image */}
              <div className="w-full h-32 overflow-hidden relative">
                <img src={university.image} alt={university.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                {/* Shortlist Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                  onClick={(e) => handleShortlist(university, e)}
                >
                  <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-primary text-primary' : ''}`} />
                </Button>

                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-base font-bold text-white line-clamp-1">{university.name}</h3>
                  {university.campusName && (
                    <p className="text-white/80 text-xs">{university.campusName}</p>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{university.city}, {university.state}</span>
                </div>

                {/* Ranking */}
                {university.nirfRanking && (
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium">{university.nirfRanking}</span>
                  </div>
                )}

                {/* Course Count */}
                <div className="flex items-center gap-2 glass p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium">{university.courses.length} Courses</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyClick(university, university.courses[0]?.name || "");
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* College Details Dialog */}
      <CollegeDetailsDialog
        college={selectedCollege}
        open={showCollegeDetails}
        onOpenChange={setShowCollegeDetails}
        onApplyCourse={(courseName) => {
          if (selectedCollege) {
            handleApplyClick(selectedCollege, courseName);
          }
        }}
      />

      {/* Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-2 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Apply to {selectedCollege?.name}</DialogTitle>
            <DialogDescription>
              Course: {selectedCourse} | {selectedCollege?.campusName}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Course Selection - At the Top */}
              <div className="p-4 glass rounded-lg space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Course Selection
                </h3>
                <FormField control={form.control} name="selectedCourse" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Which course are you applying to? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="Select the course you want to apply for" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCollege?.courses.map((course) => (
                          <SelectItem key={course.name} value={course.name}>
                            {course.name} - {course.duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <p className="text-xs text-muted-foreground">
                  💡 Select your course first - AI will provide course-specific suggestions for essay questions.
                </p>
                
                <FormField control={form.control} name="courseLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you applying for Undergraduate (UG) or Postgraduate (PG)? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="Select course level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ug">Undergraduate (UG)</SelectItem>
                        <SelectItem value="pg">Postgraduate (PG)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal glass", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="glass"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="currentEducation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Education Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="glass"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="10th">10th Grade</SelectItem>
                          <SelectItem value="12th">12th Grade</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="boardUniversity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board/University *</FormLabel>
                      <FormControl><Input placeholder="CBSE / ICSE / State Board" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="percentage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage/CGPA *</FormLabel>
                      <FormControl><Input placeholder="85.5" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="passingYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Year *</FormLabel>
                      <FormControl><Input placeholder="2024" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="previousSchool" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Previous School/College *</FormLabel>
                      <FormControl><Input placeholder="Delhi Public School" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Entrance Exam */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Entrance Exam Details</h3>
                <FormField control={form.control} name="entranceExamTaken" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Have you taken an entrance exam? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="glass"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {examTaken === "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="examName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Name</FormLabel>
                        <FormControl><Input placeholder="CUET/KCET/JEE" {...field} className="glass" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="examScore" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score</FormLabel>
                        <FormControl><Input placeholder="350" {...field} className="glass" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="examRank" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank (if applicable)</FormLabel>
                        <FormControl><Input placeholder="1234" {...field} className="glass" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Full Address *</FormLabel>
                      <FormControl><Textarea placeholder="House No., Street, Area" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl><Input placeholder="Mumbai" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl><Input placeholder="Maharashtra" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl><Input placeholder="400001" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="parentName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Name *</FormLabel>
                      <FormControl><Input placeholder="Parent Name" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="parentPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Phone *</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="parentEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Email *</FormLabel>
                      <FormControl><Input type="email" placeholder="parent@example.com" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="parentOccupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Occupation *</FormLabel>
                      <FormControl><Input placeholder="Business / Service" {...field} className="glass" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="annualIncome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Family Income *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="glass"><SelectValue placeholder="Select range" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="0-3">₹0 - ₹3 Lakhs</SelectItem>
                          <SelectItem value="3-6">₹3 - ₹6 Lakhs</SelectItem>
                          <SelectItem value="6-10">₹6 - ₹10 Lakhs</SelectItem>
                          <SelectItem value="10-15">₹10 - ₹15 Lakhs</SelectItem>
                          <SelectItem value="15+">₹15+ Lakhs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <FormField control={form.control} name="previousSchool" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous School/College Name *</FormLabel>
                    <FormControl><Input placeholder="Your previous institution" {...field} className="glass" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="extracurricular" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extracurricular Activities</FormLabel>
                    <FormControl><Textarea placeholder="Sports, Arts, Leadership roles, etc." {...field} className="glass" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="achievements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievements & Awards</FormLabel>
                    <FormControl><Textarea placeholder="Academic awards, competitions, certifications, etc." {...field} className="glass" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="whyThisUniversity" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Why do you want to join {selectedCollege?.name}? *</FormLabel>
                      {form.watch("selectedCourse") && (
                        <AIFieldSuggestion
                          fieldName="whyThisUniversity"
                          fieldLabel={`Why ${selectedCollege?.name}?`}
                          courseName={form.watch("selectedCourse")}
                          universityName={selectedCollege?.name || ""}
                          currentValue={field.value}
                          onSuggestionAccept={(suggestion) => field.onChange(suggestion)}
                          placeholder="Your motivation for this university and course"
                        />
                      )}
                    </div>
                    <FormControl><Textarea placeholder="Write at least 50 characters..." {...field} className="glass min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-3 pt-4">
                <AIApplicationAssistant
                  missingFields={Object.keys(form.formState.errors)}
                  onFieldFilled={(fieldName, value) => {
                    // @ts-ignore - dynamic field setting
                    form.setValue(fieldName, value);
                  }}
                />
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Application
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
