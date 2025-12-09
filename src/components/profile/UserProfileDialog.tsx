import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type UserProfile = {
  stream: string;
  tenthPercentage: string;
  academicInterests: string;
  extraCurricular: string[];
  cityPreference: string;
  accommodation: string;
  careerGoals: string;
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

export const UserProfileDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    stream: "",
    tenthPercentage: "",
    academicInterests: "",
    extraCurricular: [],
    cityPreference: "",
    accommodation: "",
    careerGoals: "",
    studyStyle: "",
    budgetRange: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      // Show dialog on first visit
      setOpen(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    toast({
      title: "Profile Saved",
      description: "Your preferences will help personalize your AI experience.",
    });
    setOpen(false);
  };

  const toggleExtraCurricular = (activity: string) => {
    setProfile(prev => ({
      ...prev,
      extraCurricular: prev.extraCurricular.includes(activity)
        ? prev.extraCurricular.filter(a => a !== activity)
        : [...prev.extraCurricular, activity]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
          size="icon"
        >
          <User className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Your Profile</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Help us personalize your college guidance experience
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stream */}
          <div className="space-y-2">
            <Label htmlFor="stream">Current Stream</Label>
            <Select value={profile.stream} onValueChange={(val) => setProfile(prev => ({ ...prev, stream: val }))}>
              <SelectTrigger id="stream">
                <SelectValue placeholder="Select your stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="arts">Arts/Humanities</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 10th Percentage */}
          <div className="space-y-2">
            <Label htmlFor="percentage">10th Class Percentage</Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              value={profile.tenthPercentage}
              onChange={(e) => setProfile(prev => ({ ...prev, tenthPercentage: e.target.value }))}
              placeholder="e.g., 85"
            />
          </div>

          {/* Academic Interests */}
          <div className="space-y-2">
            <Label htmlFor="interests">Academic Interests & Favorite Subjects</Label>
            <Input
              id="interests"
              value={profile.academicInterests}
              onChange={(e) => setProfile(prev => ({ ...prev, academicInterests: e.target.value }))}
              placeholder="e.g., Physics, Mathematics, Creative Writing"
            />
          </div>

          {/* Extra-curricular Activities */}
          <div className="space-y-2">
            <Label>Extra-curricular Interests</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {EXTRA_CURRICULAR_OPTIONS.map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={activity}
                    checked={profile.extraCurricular.includes(activity)}
                    onCheckedChange={() => toggleExtraCurricular(activity)}
                  />
                  <label
                    htmlFor={activity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {activity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* City Preference */}
          <div className="space-y-2">
            <Label htmlFor="city">City Life Preference</Label>
            <Select value={profile.cityPreference} onValueChange={(val) => setProfile(prev => ({ ...prev, cityPreference: val }))}>
              <SelectTrigger id="city">
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

          {/* Accommodation */}
          <div className="space-y-2">
            <Label htmlFor="accommodation">Accommodation Preference</Label>
            <Select value={profile.accommodation} onValueChange={(val) => setProfile(prev => ({ ...prev, accommodation: val }))}>
              <SelectTrigger id="accommodation">
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

          {/* Career Goals */}
          <div className="space-y-2">
            <Label htmlFor="career">Career Goals (Optional)</Label>
            <Input
              id="career"
              value={profile.careerGoals}
              onChange={(e) => setProfile(prev => ({ ...prev, careerGoals: e.target.value }))}
              placeholder="e.g., Software Engineer, Doctor, Entrepreneur"
            />
          </div>

          {/* Study Style */}
          <div className="space-y-2">
            <Label htmlFor="study">Study Style Preference</Label>
            <Select value={profile.studyStyle} onValueChange={(val) => setProfile(prev => ({ ...prev, studyStyle: val }))}>
              <SelectTrigger id="study">
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

          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budget">Annual Budget Range (Optional)</Label>
            <Select value={profile.budgetRange} onValueChange={(val) => setProfile(prev => ({ ...prev, budgetRange: val }))}>
              <SelectTrigger id="budget">
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const getUserProfile = (): UserProfile | null => {
  const saved = localStorage.getItem("userProfile");
  return saved ? JSON.parse(saved) : null;
};
