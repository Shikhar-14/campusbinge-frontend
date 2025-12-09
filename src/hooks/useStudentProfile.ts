import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UniversityProfile } from "@/pages/Profile";

export const useStudentProfile = () => {
  const [profile, setProfile] = useState<Partial<UniversityProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Load from localStorage if not authenticated
        const saved = localStorage.getItem("universityProfile");
        if (saved) {
          setProfile(JSON.parse(saved));
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        throw error;
      }

      if (data) {
        const mappedProfile: Partial<UniversityProfile> = {
          fullName: data.full_name || "",
          dateOfBirth: data.date_of_birth || "",
          gender: data.gender || "",
          nationality: data.nationality || "Indian",
          email: data.email || "",
          phone: data.phone || "",
          phoneCountryCode: data.phone_country_code || "+91",
          alternatePhone: data.alternate_phone || "",
          tenthBoard: data.tenth_board || "",
          tenthSchool: data.tenth_school_name || "",
          tenthPercentage: data.tenth_percentage?.toString() || "",
          tenthYearOfPassing: data.tenth_year?.toString() || "",
          twelfthBoard: data.twelfth_board || "",
          twelfthSchool: data.twelfth_school_name || "",
          twelfthPercentage: data.twelfth_percentage?.toString() || "",
          twelfthStream: data.twelfth_stream || "",
          twelfthSubjects: Array.isArray(data.twelfth_subjects) ? data.twelfth_subjects.join(", ") : "",
          twelfthYearOfPassing: data.twelfth_year?.toString() || "",
          entranceTests: Array.isArray(data.entrance_exams) 
            ? (data.entrance_exams as Array<{ testName: string; score: string; isCustom?: boolean; }>)
            : [],
          entranceExam: data.entrance_exams ? JSON.stringify(data.entrance_exams) : "",
          entranceExamOther: data.entrance_exam_other_specify || "",
          category: data.category || "",
          isPWD: data.is_pwd || false,
          pwdType: data.pwd_type || "",
          annualFamilyIncome: data.annual_family_income?.toString() || "",
          fatherName: data.father_name || "",
          fatherOccupation: data.father_occupation || "",
          fatherPhone: data.father_phone || "",
          fatherPhoneCountryCode: data.father_phone_country_code || "+91",
          fatherEmail: data.father_email || "",
          motherName: data.mother_name || "",
          motherOccupation: data.mother_occupation || "",
          motherPhone: data.mother_phone || "",
          motherPhoneCountryCode: data.mother_phone_country_code || "+91",
          motherEmail: data.mother_email || "",
          guardianName: data.guardian_name || "",
          guardianRelation: data.guardian_relation || "",
          permanentAddress: data.permanent_address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          country: data.country || "India",
          aadhaarNumber: data.aadhaar_number || "",
          panNumber: data.pan_number || "",
          documents: typeof data.documents === 'object' && data.documents !== null && !Array.isArray(data.documents)
            ? (data.documents as UniversityProfile["documents"])
            : {
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
          academicInterests: data.academic_interests || "",
          extraCurricular: Array.isArray(data.extra_curricular) ? data.extra_curricular : [],
          careerGoals: (data.career_goals || []).join(", "),
          cityPreference: (data.city_preferences || []).join(", "),
          accommodation: (data.accommodation_preferences || []).join(", "),
          studyStyle: (data.study_style_preferences || []).join(", "),
          budgetRange: (data.budget_ranges || []).join(", "),
        };
        setProfile(mappedProfile);
      }
    } catch (error) {
      console.error("Error in loadProfile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<UniversityProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Load existing profile and merge with new data
      const existingProfile = localStorage.getItem("universityProfile");
      const currentProfile = existingProfile ? JSON.parse(existingProfile) : {};
      const mergedProfile = { ...currentProfile, ...profileData };
      
      // Save merged profile to localStorage
      localStorage.setItem("universityProfile", JSON.stringify(mergedProfile));
      
      if (!user) {
        toast({
          title: "Saved Locally",
          description: "Profile saved to your browser. Sign in to sync across devices.",
        });
        setProfile(mergedProfile);
        return true;
      }
      
      // Load existing database profile to merge
      const { data: existingDbData } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Map to database format, only including fields that are provided
      const dbData: any = {
        user_id: user.id,
      };
      
      // Only add fields that are explicitly provided in profileData
      if (profileData.fullName !== undefined) dbData.full_name = profileData.fullName;
      if (profileData.dateOfBirth !== undefined) dbData.date_of_birth = profileData.dateOfBirth || null;
      if (profileData.gender !== undefined) dbData.gender = profileData.gender;
      if (profileData.nationality !== undefined) dbData.nationality = profileData.nationality;
      if (profileData.email !== undefined) dbData.email = profileData.email;
      if (profileData.phone !== undefined) dbData.phone = profileData.phone;
      if (profileData.phoneCountryCode !== undefined) dbData.phone_country_code = profileData.phoneCountryCode;
      if (profileData.alternatePhone !== undefined) dbData.alternate_phone = profileData.alternatePhone;
      if (profileData.tenthBoard !== undefined) dbData.tenth_board = profileData.tenthBoard;
      if (profileData.tenthSchool !== undefined) dbData.tenth_school_name = profileData.tenthSchool;
      if (profileData.tenthPercentage !== undefined) dbData.tenth_percentage = profileData.tenthPercentage ? parseFloat(profileData.tenthPercentage) : null;
      if (profileData.tenthYearOfPassing !== undefined) dbData.tenth_year = profileData.tenthYearOfPassing ? parseInt(profileData.tenthYearOfPassing) : null;
      if (profileData.twelfthBoard !== undefined) dbData.twelfth_board = profileData.twelfthBoard;
      if (profileData.twelfthSchool !== undefined) dbData.twelfth_school_name = profileData.twelfthSchool;
      if (profileData.twelfthPercentage !== undefined) dbData.twelfth_percentage = profileData.twelfthPercentage ? parseFloat(profileData.twelfthPercentage) : null;
      if (profileData.twelfthStream !== undefined) dbData.twelfth_stream = profileData.twelfthStream;
      if (profileData.twelfthSubjects !== undefined) dbData.twelfth_subjects = profileData.twelfthSubjects ? profileData.twelfthSubjects.split(",").map(s => s.trim()).filter(Boolean) : [];
      if (profileData.twelfthYearOfPassing !== undefined) dbData.twelfth_year = profileData.twelfthYearOfPassing ? parseInt(profileData.twelfthYearOfPassing) : null;
      if (profileData.entranceTests !== undefined) {
        // Save the new format directly
        dbData.entrance_exams = profileData.entranceTests || [];
      } else if (profileData.entranceExam !== undefined) {
        // Handle legacy entrance exams - convert string to array or parse existing JSON
        if (profileData.entranceExam) {
          try {
            // Try to parse as JSON first (for array format)
            dbData.entrance_exams = JSON.parse(profileData.entranceExam);
          } catch {
            // If not valid JSON, treat as single exam string and convert to array
            dbData.entrance_exams = [{ exam: profileData.entranceExam }];
          }
        } else {
          dbData.entrance_exams = [];
        }
      }
      if (profileData.entranceExamOther !== undefined) dbData.entrance_exam_other_specify = profileData.entranceExamOther;
      if (profileData.category !== undefined) dbData.category = profileData.category;
      if (profileData.isPWD !== undefined) dbData.is_pwd = profileData.isPWD;
      if (profileData.pwdType !== undefined) dbData.pwd_type = profileData.pwdType;
      if (profileData.annualFamilyIncome !== undefined) dbData.annual_family_income = profileData.annualFamilyIncome ? parseFloat(profileData.annualFamilyIncome) : null;
      if (profileData.fatherName !== undefined) dbData.father_name = profileData.fatherName;
      if (profileData.fatherOccupation !== undefined) dbData.father_occupation = profileData.fatherOccupation;
      if (profileData.fatherPhone !== undefined) dbData.father_phone = profileData.fatherPhone;
      if (profileData.fatherPhoneCountryCode !== undefined) dbData.father_phone_country_code = profileData.fatherPhoneCountryCode;
      if (profileData.fatherEmail !== undefined) dbData.father_email = profileData.fatherEmail;
      if (profileData.motherName !== undefined) dbData.mother_name = profileData.motherName;
      if (profileData.motherOccupation !== undefined) dbData.mother_occupation = profileData.motherOccupation;
      if (profileData.motherPhone !== undefined) dbData.mother_phone = profileData.motherPhone;
      if (profileData.motherPhoneCountryCode !== undefined) dbData.mother_phone_country_code = profileData.motherPhoneCountryCode;
      if (profileData.motherEmail !== undefined) dbData.mother_email = profileData.motherEmail;
      if (profileData.guardianName !== undefined) dbData.guardian_name = profileData.guardianName;
      if (profileData.guardianRelation !== undefined) dbData.guardian_relation = profileData.guardianRelation;
      if (profileData.permanentAddress !== undefined) dbData.permanent_address = profileData.permanentAddress;
      if (profileData.city !== undefined) dbData.city = profileData.city;
      if (profileData.state !== undefined) dbData.state = profileData.state;
      if (profileData.pincode !== undefined) dbData.pincode = profileData.pincode;
      if (profileData.country !== undefined) dbData.country = profileData.country;
      if (profileData.aadhaarNumber !== undefined) dbData.aadhaar_number = profileData.aadhaarNumber;
      if (profileData.panNumber !== undefined) dbData.pan_number = profileData.panNumber;
      if (profileData.documents !== undefined) dbData.documents = profileData.documents;
      if (profileData.academicInterests !== undefined) dbData.academic_interests = profileData.academicInterests;
      if (profileData.extraCurricular !== undefined) dbData.extra_curricular = profileData.extraCurricular;
      if (profileData.careerGoals !== undefined) dbData.career_goals = profileData.careerGoals?.split(",").map(g => g.trim()).filter(Boolean);
      if (profileData.cityPreference !== undefined) dbData.city_preferences = profileData.cityPreference?.split(",").map(c => c.trim()).filter(Boolean);
      if (profileData.accommodation !== undefined) dbData.accommodation_preferences = profileData.accommodation?.split(",").map(a => a.trim()).filter(Boolean);
      if (profileData.studyStyle !== undefined) dbData.study_style_preferences = profileData.studyStyle?.split(",").map(s => s.trim()).filter(Boolean);
      if (profileData.budgetRange !== undefined) dbData.budget_ranges = profileData.budgetRange?.split(",").map(b => b.trim()).filter(Boolean);

      const { error } = await supabase
        .from("student_profiles")
        .upsert(dbData, { onConflict: "user_id" });

      if (error) {
        console.error("Error saving profile:", error);
        throw error;
      }

      setProfile(mergedProfile);
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
      return true;
    } catch (error) {
      console.error("Error in saveProfile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if mandatory fields are filled
  const getMandatoryFieldsStatus = () => {
    if (!profile) return { complete: false, missing: [] };
    
    const mandatoryFields = [
      { key: "fullName", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "tenthBoard", label: "10th Board" },
      { key: "tenthPercentage", label: "10th Percentage" },
      { key: "twelfthBoard", label: "12th Board" },
      { key: "twelfthPercentage", label: "12th Percentage" },
      { key: "twelfthStream", label: "12th Stream" },
    ];

    const missing = mandatoryFields
      .filter(field => !profile[field.key as keyof UniversityProfile])
      .map(field => field.label);

    return {
      complete: missing.length === 0,
      missing,
      percentComplete: Math.round(((mandatoryFields.length - missing.length) / mandatoryFields.length) * 100)
    };
  };

  return {
    profile,
    loading,
    saveProfile,
    loadProfile,
    getMandatoryFieldsStatus,
  };
};
