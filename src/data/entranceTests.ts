export interface EntranceTest {
  name: string;
  fullName: string;
  conductingBody: string;
  category: "Engineering" | "Medical" | "Management" | "Law" | "Design" | "Architecture" | "Other";
  tier: string;
}

export const ENTRANCE_TESTS: EntranceTest[] = [
  // Engineering - Tier 1
  { name: "JEE Main", fullName: "Joint Entrance Examination Main", conductingBody: "NTA", category: "Engineering", tier: "Tier 1 - Most Important" },
  { name: "JEE Advanced", fullName: "Joint Entrance Examination Advanced", conductingBody: "IITs", category: "Engineering", tier: "Tier 1 - Most Important" },
  { name: "BITSAT", fullName: "Birla Institute of Technology and Science Admission Test", conductingBody: "BITS Pilani", category: "Engineering", tier: "Tier 1 - Premier Private" },
  
  // Engineering - Tier 2 Top Private
  { name: "VITEEE", fullName: "VIT Engineering Entrance Examination", conductingBody: "VIT University", category: "Engineering", tier: "Tier 2 - Top Private" },
  { name: "SRMJEEE", fullName: "SRM Joint Engineering Entrance Examination", conductingBody: "SRM Institute", category: "Engineering", tier: "Tier 2 - Top Private" },
  { name: "MET", fullName: "Manipal Entrance Test", conductingBody: "Manipal Academy", category: "Engineering", tier: "Tier 2 - Top Private" },
  
  // Engineering - Tier 2 State Exams
  { name: "COMEDK UGET", fullName: "Consortium of Medical, Engineering and Dental Colleges of Karnataka", conductingBody: "COMEDK", category: "Engineering", tier: "Tier 2 - State Private" },
  { name: "KCET", fullName: "Karnataka Common Entrance Test", conductingBody: "Karnataka Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "MHT CET", fullName: "Maharashtra Common Entrance Test", conductingBody: "Maharashtra Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "AP EAMCET", fullName: "Andhra Pradesh Engineering, Agriculture and Medical Common Entrance Test", conductingBody: "AP Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "TS EAMCET", fullName: "Telangana State Engineering, Agriculture and Medical Common Entrance Test", conductingBody: "Telangana Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "WBJEE", fullName: "West Bengal Joint Entrance Examination", conductingBody: "West Bengal Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "KEAM", fullName: "Kerala Engineering Architecture Medical", conductingBody: "Kerala Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "TNEA", fullName: "Tamil Nadu Engineering Admissions", conductingBody: "Tamil Nadu Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  { name: "UPSEE", fullName: "Uttar Pradesh State Entrance Examination", conductingBody: "UP Govt", category: "Engineering", tier: "Tier 2 - State Exam" },
  
  // Medical - Tier 1
  { name: "NEET-UG", fullName: "National Eligibility cum Entrance Test - Undergraduate", conductingBody: "NTA", category: "Medical", tier: "Tier 1 - Only Exam for Medical" },
  { name: "AIIMS-MBBS", fullName: "All India Institute of Medical Sciences MBBS", conductingBody: "AIIMS", category: "Medical", tier: "Tier 1 - Premier Government" },
  { name: "JIPMER", fullName: "Jawaharlal Institute of Postgraduate Medical Education and Research", conductingBody: "JIPMER Institute", category: "Medical", tier: "Tier 1 - Premier Government" },
  { name: "AFMC", fullName: "Armed Forces Medical College", conductingBody: "Armed Forces", category: "Medical", tier: "Tier 1 - Armed Forces" },
  
  // Management - Tier 1
  { name: "CAT", fullName: "Common Admission Test", conductingBody: "IIMs", category: "Management", tier: "Tier 1 - IIM Gateway" },
  { name: "XAT", fullName: "Xavier Aptitude Test", conductingBody: "XLRI", category: "Management", tier: "Tier 1 - Premier MBA" },
  { name: "SNAP", fullName: "Symbiosis National Aptitude Test", conductingBody: "Symbiosis", category: "Management", tier: "Tier 1 - Symbiosis Colleges" },
  { name: "NMAT", fullName: "NMIMS Management Aptitude Test", conductingBody: "GMAC", category: "Management", tier: "Tier 1 - NMIMS & Others" },
  { name: "CMAT", fullName: "Common Management Admission Test", conductingBody: "NTA", category: "Management", tier: "Tier 2 - Widely Accepted" },
  { name: "MAT", fullName: "Management Aptitude Test", conductingBody: "AIMA", category: "Management", tier: "Tier 2 - Widely Accepted" },
  
  // Law
  { name: "CLAT", fullName: "Common Law Admission Test", conductingBody: "Consortium of NLUs", category: "Law", tier: "Tier 1 - National Law Universities" },
  { name: "AILET", fullName: "All India Law Entrance Test", conductingBody: "NLU Delhi", category: "Law", tier: "Tier 1 - NLU Delhi" },
  { name: "LSAT India", fullName: "Law School Admission Test", conductingBody: "Pearson", category: "Law", tier: "Tier 2 - Private Law Colleges" },
  
  // Design
  { name: "UCEED", fullName: "Undergraduate Common Entrance Examination for Design", conductingBody: "IIT Bombay", category: "Design", tier: "Tier 1 - IIT Design Programs" },
  { name: "NID DAT", fullName: "National Institute of Design - Design Aptitude Test", conductingBody: "NID", category: "Design", tier: "Tier 1 - NID Institutes" },
  { name: "NIFT", fullName: "National Institute of Fashion Technology Entrance", conductingBody: "NIFT", category: "Design", tier: "Tier 1 - Fashion & Design" },
  { name: "CEED", fullName: "Common Entrance Examination for Design", conductingBody: "IIT Bombay", category: "Design", tier: "Tier 1 - Postgraduate Design" },
  
  // Architecture
  { name: "NATA", fullName: "National Aptitude Test in Architecture", conductingBody: "COA", category: "Architecture", tier: "Tier 1 - Architecture Programs" },
  { name: "JEE Main Paper 2", fullName: "Joint Entrance Examination Main - Architecture", conductingBody: "NTA", category: "Architecture", tier: "Tier 1 - NITs & IIITs Architecture" },
  
  // International
  { name: "SAT", fullName: "Scholastic Assessment Test", conductingBody: "College Board", category: "Other", tier: "International - US Universities" },
  { name: "ACT", fullName: "American College Testing", conductingBody: "ACT Inc", category: "Other", tier: "International - US Universities" },
  { name: "GRE", fullName: "Graduate Record Examination", conductingBody: "ETS", category: "Other", tier: "International - Graduate Programs" },
  { name: "GMAT", fullName: "Graduate Management Admission Test", conductingBody: "GMAC", category: "Other", tier: "International - MBA Programs" },
  { name: "TOEFL", fullName: "Test of English as a Foreign Language", conductingBody: "ETS", category: "Other", tier: "International - English Proficiency" },
  { name: "IELTS", fullName: "International English Language Testing System", conductingBody: "British Council", category: "Other", tier: "International - English Proficiency" },
  
  // Agriculture & Allied Sciences
  { name: "ICAR AIEEA UG", fullName: "ICAR All India Entrance Examination - Undergraduate", conductingBody: "ICAR", category: "Other", tier: "Tier 1 - Agriculture Programs" },
  { name: "ICAR AIEEA PG", fullName: "ICAR All India Entrance Examination - Postgraduate", conductingBody: "ICAR", category: "Other", tier: "Tier 1 - Agriculture PG Programs" },
  { name: "BCECE", fullName: "Bihar Combined Entrance Competitive Examination", conductingBody: "BCECE Board", category: "Other", tier: "Tier 2 - Agriculture State Exam" },
  
  // Pharmacy
  { name: "GPAT", fullName: "Graduate Pharmacy Aptitude Test", conductingBody: "NTA", category: "Other", tier: "Tier 1 - Pharmacy Postgraduate" },
  { name: "NIPER JEE", fullName: "National Institute of Pharmaceutical Education and Research Joint Entrance Examination", conductingBody: "NIPER", category: "Other", tier: "Tier 1 - Premier Pharmacy" },
  { name: "MHT CET Pharmacy", fullName: "Maharashtra Common Entrance Test - Pharmacy", conductingBody: "Maharashtra Govt", category: "Other", tier: "Tier 2 - State Pharmacy Exam" },
  
  // Hotel Management & Tourism
  { name: "NCHMCT JEE", fullName: "National Council for Hotel Management Joint Entrance Examination", conductingBody: "NCHMCT", category: "Other", tier: "Tier 1 - Hotel Management" },
  { name: "IIHM eCHAT", fullName: "International Institute of Hotel Management - eCulinary & Hospitality Aptitude Test", conductingBody: "IIHM", category: "Other", tier: "Tier 2 - Private Hotel Management" },
  
  // Mass Communication & Journalism
  { name: "IIMC Entrance", fullName: "Indian Institute of Mass Communication Entrance Exam", conductingBody: "IIMC", category: "Other", tier: "Tier 1 - Mass Communication" },
  { name: "MJMC JNU", fullName: "Master of Journalism and Mass Communication - JNU", conductingBody: "JNU", category: "Other", tier: "Tier 1 - Premier Mass Comm" },
  { name: "DUET Journalism", fullName: "Delhi University Entrance Test - Journalism", conductingBody: "Delhi University", category: "Other", tier: "Tier 2 - University Specific" },
  
  // Commerce & Economics
  { name: "IPM-AT", fullName: "Integrated Program in Management - Aptitude Test", conductingBody: "IIM Indore", category: "Other", tier: "Tier 1 - Integrated Management" },
  { name: "NPAT", fullName: "NMIMS Programs After Twelfth", conductingBody: "NMIMS", category: "Other", tier: "Tier 1 - Commerce & Liberal Arts" },
  { name: "DU JAT", fullName: "Delhi University Joint Admission Test", conductingBody: "Delhi University", category: "Other", tier: "Tier 2 - Commerce Programs" },
  { name: "CUET", fullName: "Common University Entrance Test", conductingBody: "NTA", category: "Other", tier: "Tier 1 - Central Universities" },
  
  // Humanities & Liberal Arts
  { name: "JNUEE", fullName: "Jawaharlal Nehru University Entrance Examination", conductingBody: "JNU", category: "Other", tier: "Tier 1 - Humanities & Social Sciences" },
  { name: "BHU UET", fullName: "Banaras Hindu University Undergraduate Entrance Test", conductingBody: "BHU", category: "Other", tier: "Tier 2 - Multi-discipline" },
  { name: "IPU CET", fullName: "Guru Gobind Singh Indraprastha University Common Entrance Test", conductingBody: "GGSIPU", category: "Other", tier: "Tier 2 - Multi-discipline" },
  
  // Veterinary Science
  { name: "AIPVT", fullName: "All India Pre-Veterinary Test", conductingBody: "VCI", category: "Other", tier: "Tier 1 - Veterinary Science" },
  
  // Fine Arts
  { name: "BFA Entrance", fullName: "Bachelor of Fine Arts Entrance", conductingBody: "Various Universities", category: "Other", tier: "Tier 2 - Fine Arts Programs" },
  
  // Aviation
  { name: "IGRUA Entrance", fullName: "Indira Gandhi Rashtriya Uran Akademi Entrance", conductingBody: "IGRUA", category: "Other", tier: "Tier 1 - Aviation/Pilot Training" },
];
