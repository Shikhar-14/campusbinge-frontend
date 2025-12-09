import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Save, FileText, Shield, AlertCircle, ArrowLeft, Upload, Camera } from "lucide-react";
import { DocumentSection } from "@/components/profile/DocumentSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { supabase } from "@/integrations/supabase/client";
import { BoardSelect } from "@/components/profile/BoardSelect";
import { TENTH_BOARDS, TWELFTH_BOARDS } from "@/data/schoolBoards";
import { CountryCodeSelect } from "@/components/profile/CountryCodeSelect";
import { NationalitySelect } from "@/components/profile/NationalitySelect";
import { EntranceTestsInput } from "@/components/profile/EntranceTestsInput";

export type UniversityProfile = {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  alternatePhone: string;
  
  // Academic Information
  tenthBoard: string;
  tenthSchool: string;
  tenthPercentage: string;
  tenthYearOfPassing: string;
  twelfthBoard: string;
  twelfthSchool: string;
  twelfthPercentage: string;
  twelfthStream: string;
  twelfthSubjects: string;
  twelfthYearOfPassing: string;
  entranceTests: Array<{ testName: string; score: string; isCustom?: boolean; }>;
  entranceExam: string; // Legacy field for backward compatibility
  entranceExamOther: string;
  entranceScore: string;
  
  // Category & Reservations
  category: string;
  isPWD: boolean;
  pwdType: string;
  annualFamilyIncome: string;
  
  // Parent/Guardian Information
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherPhoneCountryCode: string;
  fatherEmail: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  motherPhoneCountryCode: string;
  motherEmail: string;
  guardianName: string;
  guardianRelation: string;
  
  // Address Information
  permanentAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  
  // Documents (DigiLocker)
  aadhaarNumber: string;
  panNumber: string;
  documents: {
    photo: { id: string; name: string; url: string; uploadedAt: string; } | null;
    signature: { id: string; name: string; url: string; uploadedAt: string; } | null;
    aadhaar: { id: string; name: string; url: string; uploadedAt: string; } | null;
    pan: { id: string; name: string; url: string; uploadedAt: string; } | null;
    tenthCertificate: { id: string; name: string; url: string; uploadedAt: string; } | null;
    tenthMarksheet: { id: string; name: string; url: string; uploadedAt: string; } | null;
    twelfthCertificate: { id: string; name: string; url: string; uploadedAt: string; } | null;
    twelfthMarksheet: { id: string; name: string; url: string; uploadedAt: string; } | null;
    birthCertificate: { id: string; name: string; url: string; uploadedAt: string; } | null;
    incomeCertificate: { id: string; name: string; url: string; uploadedAt: string; } | null;
    casteCertificate: { id: string; name: string; url: string; uploadedAt: string; } | null;
    domicile: { id: string; name: string; url: string; uploadedAt: string; } | null;
    other: { id: string; name: string; url: string; uploadedAt: string; } | null;
  };
  
  // Preferences
  academicInterests: string;
  extraCurricular: string[];
  careerGoals: string;
  cityPreference: string;
  accommodation: string;
  studyStyle: string;
  budgetRange: string;
};

const EXTRA_CURRICULAR_OPTIONS = [
  "Sports (Cricket, Football, Basketball)",
  "Music & Dance",
  "Drama & Theatre",
  "Debating & Public Speaking",
  "Art & Photography",
  "Coding & Robotics",
  "Entrepreneurship & Business Clubs",
  "Social Service & NGO Work",
  "Literary Activities",
  "Cultural Events",
  "Environmental Clubs",
  "Gaming & Esports",
];

const Profile = () => {
  const { toast } = useToast();
  const { 
    profile: savedProfile, 
    loading: profileLoading, 
    saveProfile: saveToDatabase,
    getMandatoryFieldsStatus 
  } = useStudentProfile();
  
  const [profile, setProfile] = useState<UniversityProfile>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Indian",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    alternatePhone: "",
    tenthBoard: "",
    tenthSchool: "",
    tenthPercentage: "",
    tenthYearOfPassing: "",
    twelfthBoard: "",
    twelfthSchool: "",
    twelfthPercentage: "",
    twelfthStream: "",
    twelfthSubjects: "",
    twelfthYearOfPassing: "",
    entranceTests: [],
    entranceExam: "",
    entranceExamOther: "",
    entranceScore: "",
    category: "",
    isPWD: false,
    pwdType: "",
    annualFamilyIncome: "",
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherPhoneCountryCode: "+91",
    fatherEmail: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherPhoneCountryCode: "+91",
    motherEmail: "",
    guardianName: "",
    guardianRelation: "",
    permanentAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    aadhaarNumber: "",
    panNumber: "",
    documents: {
      photo: null,
      signature: null,
      aadhaar: null,
      pan: null,
      tenthCertificate: null,
      tenthMarksheet: null,
      twelfthCertificate: null,
      twelfthMarksheet: null,
      birthCertificate: null,
      incomeCertificate: null,
      casteCertificate: null,
      domicile: null,
      other: null,
    },
    academicInterests: "",
    extraCurricular: [],
    careerGoals: "",
    cityPreference: "",
    accommodation: "",
    studyStyle: "",
    budgetRange: "",
  });
  const [loading, setLoading] = useState(false);

  // Load profile from hook when available
  useEffect(() => {
    if (savedProfile && !profileLoading) {
      setProfile(prev => ({ 
        ...prev, 
        ...savedProfile,
        extraCurricular: Array.isArray(savedProfile.extraCurricular) ? savedProfile.extraCurricular : [],
        entranceTests: Array.isArray(savedProfile.entranceTests) ? savedProfile.entranceTests : []
      }));
    } else {
      // Fallback to localStorage if hook hasn't loaded yet
      const saved = localStorage.getItem("universityProfile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile({
            ...parsed,
            extraCurricular: Array.isArray(parsed.extraCurricular) ? parsed.extraCurricular : [],
            entranceTests: Array.isArray(parsed.entranceTests) ? parsed.entranceTests : []
          });
        } catch (e) {
          console.error("Error parsing saved profile:", e);
        }
      }
    }
  }, [savedProfile, profileLoading]);

  const handleSave = async () => {
    setLoading(true);
    await saveToDatabase(profile);
    setLoading(false);
  };

  const toggleExtraCurricular = (activity: string) => {
    setProfile(prev => {
      const current = Array.isArray(prev.extraCurricular) ? prev.extraCurricular : [];
      return {
        ...prev,
        extraCurricular: current.includes(activity)
          ? current.filter(a => a !== activity)
          : [...current, activity]
      };
    });
  };

  const connectDigiLocker = () => {
    // DigiLocker OAuth flow would be implemented here
    const digiLockerWindow = window.open("https://digilocker.gov.in/", "_blank", "noopener,noreferrer");
    
    if (digiLockerWindow) {
      toast({
        title: "DigiLocker Integration",
        description: "Opening DigiLocker in a new tab. Please complete authentication there.",
      });
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
        variant: "destructive",
      });
    }
  };

  const navigate = useNavigate();

  const handlePassportPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload photo",
          variant: "destructive",
        });
        return;
      }

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL (valid for 1 year)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('profile-documents')
        .createSignedUrl(fileName, 31536000);

      if (urlError || !signedUrlData) {
        throw new Error('Failed to generate access URL');
      }

      // Create document object
      const newDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        url: signedUrlData.signedUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Update both local state and save to database
      const updatedProfile = {
        ...profile,
        documents: {
          ...profile.documents,
          photo: newDoc
        }
      };
      
      setProfile(updatedProfile);
      await saveToDatabase(updatedProfile);

      toast({
        title: "Success",
        description: "Passport photo uploaded successfully",
      });

      event.target.value = '';
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <input
                type="file"
                id="passport-photo"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePassportPhotoUpload}
                className="hidden"
              />
              <label
                htmlFor="passport-photo"
                className="block w-24 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden group relative"
              >
                {profile.documents?.photo ? (
                  <>
                    <img
                      src={profile.documents.photo.url}
                      alt="Passport"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs text-center px-2">Upload Photo</span>
                  </div>
                )}
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold">ONE-Profile</h1>
              <p className="text-muted-foreground">Complete your university application profile</p>
            </div>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Personal</TabsTrigger>
              <TabsTrigger value="academic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Academic</TabsTrigger>
              <TabsTrigger value="family" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Family</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Documents</TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="As per official documents"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={profile.gender} onValueChange={(val) => setProfile(prev => ({ ...prev, gender: val }))}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <NationalitySelect
                      value={profile.nationality}
                      onChange={(val) => setProfile(prev => ({ ...prev, nationality: val }))}
                      placeholder="Select nationality"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex gap-2">
                      <CountryCodeSelect
                        value={profile.phoneCountryCode}
                        onChange={(val) => setProfile(prev => ({ ...prev, phoneCountryCode: val }))}
                      />
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="98765 43210"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      value={profile.alternatePhone}
                      onChange={(e) => setProfile(prev => ({ ...prev, alternatePhone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={profile.category} onValueChange={(val) => setProfile(prev => ({ ...prev, category: val }))}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC (Non-Creamy Layer)</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="ews">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPWD"
                        checked={profile.isPWD}
                        onCheckedChange={(checked) => setProfile(prev => ({ ...prev, isPWD: checked as boolean }))}
                      />
                      <label htmlFor="isPWD" className="text-sm font-medium">
                        Person with Disability (PWD)
                      </label>
                    </div>
                  </div>

                  {profile.isPWD && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pwdType">Type of Disability</Label>
                      <Input
                        id="pwdType"
                        value={profile.pwdType}
                        onChange={(e) => setProfile(prev => ({ ...prev, pwdType: e.target.value }))}
                        placeholder="Specify disability type"
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="income">Annual Family Income</Label>
                    <Select value={profile.annualFamilyIncome} onValueChange={(val) => setProfile(prev => ({ ...prev, annualFamilyIncome: val }))}>
                      <SelectTrigger id="income">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below-1">Below ₹1 Lakh</SelectItem>
                        <SelectItem value="1-2.5">₹1-2.5 Lakhs</SelectItem>
                        <SelectItem value="2.5-5">₹2.5-5 Lakhs</SelectItem>
                        <SelectItem value="5-8">₹5-8 Lakhs (EWS Limit)</SelectItem>
                        <SelectItem value="8-15">₹8-15 Lakhs</SelectItem>
                        <SelectItem value="above-15">Above ₹15 Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Permanent Address *</Label>
                    <Textarea
                      id="address"
                      value={profile.permanentAddress}
                      onChange={(e) => setProfile(prev => ({ ...prev, permanentAddress: e.target.value }))}
                      placeholder="House No., Street, Area"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={profile.pincode}
                      onChange={(e) => setProfile(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Academic Information */}
            <TabsContent value="academic">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Academic Information</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">10th Standard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="tenthBoard">Board *</Label>
                        <BoardSelect
                          value={profile.tenthBoard}
                          onChange={(val) => setProfile(prev => ({ ...prev, tenthBoard: val }))}
                          boards={TENTH_BOARDS}
                          placeholder="Select 10th board"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenthSchool">School Name *</Label>
                        <Input
                          id="tenthSchool"
                          value={profile.tenthSchool}
                          onChange={(e) => setProfile(prev => ({ ...prev, tenthSchool: e.target.value }))}
                          placeholder="Enter your school name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenthPercentage">Percentage/CGPA *</Label>
                        <Input
                          id="tenthPercentage"
                          value={profile.tenthPercentage}
                          onChange={(e) => setProfile(prev => ({ ...prev, tenthPercentage: e.target.value }))}
                          placeholder="e.g., 85.5%"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenthYear">Year of Passing *</Label>
                        <Input
                          id="tenthYear"
                          type="number"
                          value={profile.tenthYearOfPassing}
                          onChange={(e) => setProfile(prev => ({ ...prev, tenthYearOfPassing: e.target.value }))}
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">12th Standard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="twelfthBoard">Board *</Label>
                        <BoardSelect
                          value={profile.twelfthBoard}
                          onChange={(val) => setProfile(prev => ({ ...prev, twelfthBoard: val }))}
                          boards={TWELFTH_BOARDS}
                          placeholder="Select 12th board"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twelfthSchool">School Name *</Label>
                        <Input
                          id="twelfthSchool"
                          value={profile.twelfthSchool}
                          onChange={(e) => setProfile(prev => ({ ...prev, twelfthSchool: e.target.value }))}
                          placeholder="Enter your school name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twelfthStream">Stream</Label>
                        <Select value={profile.twelfthStream} onValueChange={(val) => setProfile(prev => ({ ...prev, twelfthStream: val }))}>
                          <SelectTrigger id="twelfthStream">
                            <SelectValue placeholder="Select stream" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="science">Science (PCM/PCB)</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                            <SelectItem value="arts">Arts/Humanities</SelectItem>
                            <SelectItem value="vocational">Vocational</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="twelfthSubjects">Subjects Studied in Class 12 *</Label>
                        <Textarea
                          id="twelfthSubjects"
                          value={profile.twelfthSubjects || ""}
                          onChange={(e) => setProfile(prev => ({ 
                            ...prev, 
                            twelfthSubjects: e.target.value
                          }))}
                          placeholder="e.g., Physics, Chemistry, Mathematics, English, Computer Science"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twelfthPercentage">Percentage/CGPA *</Label>
                        <Input
                          id="twelfthPercentage"
                          value={profile.twelfthPercentage}
                          onChange={(e) => setProfile(prev => ({ ...prev, twelfthPercentage: e.target.value }))}
                          placeholder="e.g., 90.5%"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twelfthYear">Year of Passing *</Label>
                        <Input
                          id="twelfthYear"
                          type="number"
                          value={profile.twelfthYearOfPassing}
                          onChange={(e) => setProfile(prev => ({ ...prev, twelfthYearOfPassing: e.target.value }))}
                          placeholder="2022"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Entrance Exams</h3>
                    <EntranceTestsInput
                      value={profile.entranceTests || []}
                      onChange={(tests) => setProfile(prev => ({ ...prev, entranceTests: tests }))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Family Information */}
            <TabsContent value="family">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Parent/Guardian Information</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Father's Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name *</Label>
                        <Input
                          id="fatherName"
                          value={profile.fatherName}
                          onChange={(e) => setProfile(prev => ({ ...prev, fatherName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fatherOccupation">Occupation</Label>
                        <Input
                          id="fatherOccupation"
                          value={profile.fatherOccupation}
                          onChange={(e) => setProfile(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="fatherPhone">Father's Phone Number</Label>
                        <div className="flex gap-2">
                          <CountryCodeSelect
                            value={profile.fatherPhoneCountryCode}
                            onChange={(val) => setProfile(prev => ({ ...prev, fatherPhoneCountryCode: val }))}
                          />
                          <Input
                            id="fatherPhone"
                            type="tel"
                            value={profile.fatherPhone}
                            onChange={(e) => setProfile(prev => ({ ...prev, fatherPhone: e.target.value }))}
                            placeholder="98765 43210"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="fatherEmail">Father's Email Address</Label>
                        <Input
                          id="fatherEmail"
                          type="email"
                          value={profile.fatherEmail}
                          onChange={(e) => setProfile(prev => ({ ...prev, fatherEmail: e.target.value }))}
                          placeholder="father@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Mother's Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="motherName">Mother's Name *</Label>
                        <Input
                          id="motherName"
                          value={profile.motherName}
                          onChange={(e) => setProfile(prev => ({ ...prev, motherName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="motherOccupation">Occupation</Label>
                        <Input
                          id="motherOccupation"
                          value={profile.motherOccupation}
                          onChange={(e) => setProfile(prev => ({ ...prev, motherOccupation: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="motherPhone">Mother's Phone Number</Label>
                        <div className="flex gap-2">
                          <CountryCodeSelect
                            value={profile.motherPhoneCountryCode}
                            onChange={(val) => setProfile(prev => ({ ...prev, motherPhoneCountryCode: val }))}
                          />
                          <Input
                            id="motherPhone"
                            type="tel"
                            value={profile.motherPhone}
                            onChange={(e) => setProfile(prev => ({ ...prev, motherPhone: e.target.value }))}
                            placeholder="98765 43210"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="motherEmail">Mother's Email Address</Label>
                        <Input
                          id="motherEmail"
                          type="email"
                          value={profile.motherEmail}
                          onChange={(e) => setProfile(prev => ({ ...prev, motherEmail: e.target.value }))}
                          placeholder="mother@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Guardian Details (if applicable)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="guardianName">Guardian's Name</Label>
                        <Input
                          id="guardianName"
                          value={profile.guardianName}
                          onChange={(e) => setProfile(prev => ({ ...prev, guardianName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guardianRelation">Relation</Label>
                        <Input
                          id="guardianRelation"
                          value={profile.guardianRelation}
                          onChange={(e) => setProfile(prev => ({ ...prev, guardianRelation: e.target.value }))}
                          placeholder="e.g., Uncle, Aunt"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Documents</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload documents or connect DigiLocker for verified documents
                    </p>
                  </div>
                  <Button onClick={connectDigiLocker} className="gap-2">
                    <Shield className="w-4 h-4" />
                    Connect DigiLocker
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Number</Label>
                      <Input
                        id="aadhaar"
                        value={profile.aadhaarNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                        placeholder="XXXX XXXX XXXX"
                        maxLength={12}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pan">PAN Number</Label>
                      <Input
                        id="pan"
                        value={profile.panNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, panNumber: e.target.value }))}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-6">Upload Documents</h3>
                    <div className="space-y-6">
                      {/* Identity Documents */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identity Documents</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <DocumentSection
                            title="Passport Size Photo"
                            documentType="photo"
                            icon="image"
                            document={profile.documents.photo}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, photo: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Signature"
                            documentType="signature"
                            icon="image"
                            document={profile.documents.signature}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, signature: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Aadhaar Card"
                            documentType="aadhaar"
                            icon="file"
                            document={profile.documents.aadhaar}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, aadhaar: doc }
                            }))}
                          />
                          <DocumentSection
                            title="PAN Card"
                            documentType="pan"
                            icon="file"
                            document={profile.documents.pan}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, pan: doc }
                            }))}
                          />
                        </div>
                      </div>

                      {/* Academic Documents */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Academic Documents</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <DocumentSection
                            title="10th Certificate"
                            documentType="tenth_certificate"
                            icon="file"
                            document={profile.documents.tenthCertificate}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, tenthCertificate: doc }
                            }))}
                          />
                          <DocumentSection
                            title="10th Marksheet"
                            documentType="tenth_marksheet"
                            icon="file"
                            document={profile.documents.tenthMarksheet}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, tenthMarksheet: doc }
                            }))}
                          />
                          <DocumentSection
                            title="12th Certificate"
                            documentType="twelfth_certificate"
                            icon="file"
                            document={profile.documents.twelfthCertificate}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, twelfthCertificate: doc }
                            }))}
                          />
                          <DocumentSection
                            title="12th Marksheet"
                            documentType="twelfth_marksheet"
                            icon="file"
                            document={profile.documents.twelfthMarksheet}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, twelfthMarksheet: doc }
                            }))}
                          />
                        </div>
                      </div>

                      {/* Other Documents */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Other Documents</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <DocumentSection
                            title="Birth Certificate"
                            documentType="birth_certificate"
                            icon="file"
                            document={profile.documents.birthCertificate}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, birthCertificate: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Income Certificate"
                            documentType="income_certificate"
                            icon="file"
                            document={profile.documents.incomeCertificate}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, incomeCertificate: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Caste Certificate"
                            documentType="caste_certificate"
                            icon="file"
                            document={profile.documents.casteCertificate}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, casteCertificate: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Domicile Certificate"
                            documentType="domicile"
                            icon="file"
                            document={profile.documents.domicile}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, domicile: doc }
                            }))}
                          />
                          <DocumentSection
                            title="Other Document"
                            documentType="other"
                            icon="file"
                            document={profile.documents.other}
                            onDocumentChange={(doc) => setProfile(prev => ({
                              ...prev,
                              documents: { ...prev.documents, other: doc }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Academic Preferences</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="interests">Academic Interests & Favorite Subjects</Label>
                    <Input
                      id="interests"
                      value={profile.academicInterests}
                      onChange={(e) => setProfile(prev => ({ ...prev, academicInterests: e.target.value }))}
                      placeholder="e.g., Physics, Mathematics, Creative Writing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Extra-curricular Interests</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {EXTRA_CURRICULAR_OPTIONS.map((activity) => (
                        <div key={activity} className="flex items-center space-x-2">
                          <Checkbox
                            id={activity}
                            checked={Array.isArray(profile.extraCurricular) && profile.extraCurricular.includes(activity)}
                            onCheckedChange={() => toggleExtraCurricular(activity)}
                          />
                          <label htmlFor={activity} className="text-sm font-medium">
                            {activity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="career">Career Goals</Label>
                    <Input
                      id="career"
                      value={profile.careerGoals}
                      onChange={(e) => setProfile(prev => ({ ...prev, careerGoals: e.target.value }))}
                      placeholder="e.g., Software Engineer, Doctor, Entrepreneur"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityPref">City Life Preference</Label>
                    <Select value={profile.cityPreference} onValueChange={(val) => setProfile(prev => ({ ...prev, cityPreference: val }))}>
                      <SelectTrigger id="cityPref">
                        <SelectValue placeholder="What's your ideal city vibe?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happening">Happening & Vibrant (Metro cities)</SelectItem>
                        <SelectItem value="moderate">Moderate (Tier 2 cities)</SelectItem>
                        <SelectItem value="quiet">Quiet & Peaceful (Small towns)</SelectItem>
                        <SelectItem value="flexible">Flexible / No preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accommodationPref">Accommodation Preference</Label>
                    <Select value={profile.accommodation} onValueChange={(val) => setProfile(prev => ({ ...prev, accommodation: val }))}>
                      <SelectTrigger id="accommodationPref">
                        <SelectValue placeholder="Where would you like to stay?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-campus">On-Campus Hostel</SelectItem>
                        <SelectItem value="off-campus">Off-Campus Apartment/PG</SelectItem>
                        <SelectItem value="home">Stay at Home</SelectItem>
                        <SelectItem value="flexible">Flexible / No preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studyStylePref">Study Style Preference</Label>
                    <Select value={profile.studyStyle} onValueChange={(val) => setProfile(prev => ({ ...prev, studyStyle: val }))}>
                      <SelectTrigger id="studyStylePref">
                        <SelectValue placeholder="How do you prefer to learn?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="practical">Practical & Hands-on</SelectItem>
                        <SelectItem value="theoretical">Theoretical & Research-oriented</SelectItem>
                        <SelectItem value="balanced">Balanced Approach</SelectItem>
                        <SelectItem value="project">Project-based Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetPref">Annual Budget Range</Label>
                    <Select value={profile.budgetRange} onValueChange={(val) => setProfile(prev => ({ ...prev, budgetRange: val }))}>
                      <SelectTrigger id="budgetPref">
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-2">Under ₹2 Lakhs</SelectItem>
                        <SelectItem value="2-5">₹2-5 Lakhs</SelectItem>
                        <SelectItem value="5-10">₹5-10 Lakhs</SelectItem>
                        <SelectItem value="10-20">₹10-20 Lakhs</SelectItem>
                        <SelectItem value="above-20">Above ₹20 Lakhs</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} size="lg" className="gap-2" disabled={loading}>
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save ONE-Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
