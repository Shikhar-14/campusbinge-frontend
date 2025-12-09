import amityImage from "@/assets/amity-university.jpg";
import ashokaImage from "@/assets/ashoka-university.jpg";
import bitsImage from "@/assets/bits-pilani.jpg";
import jindalImage from "@/assets/jindal-university.jpg";
import manipalImage from "@/assets/manipal-university.jpg";
import shivNadarImage from "@/assets/shiv-nadar-university.jpg";
import upesImage from "@/assets/upes-dehradun.jpg";

export interface CollegeCourse {
  name: string;
  duration: string;
  fees: string;
  eligibility: string;
  entranceExam?: string;
  department?: string;
  level: "UG" | "PG" | "Diploma" | "PhD";
}

export interface CollegeData {
  id: string;
  name: string;
  campusName?: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  established: string;
  type: string;
  naacGrade?: string;
  nirfRanking?: string;
  approvals: string[];
  website: string;
  contact: {
    phone?: string;
    email?: string;
  };
  campusArea?: string;
  highlights: string[];
  courses: CollegeCourse[];
  image?: string;
}

export const collegesData: CollegeData[] = [
  {
    id: "christ-bgr",
    name: "CHRIST (Deemed to be University)",
    campusName: "Bangalore Bannerghatta Road Campus (BGR Campus)",
    location: "Hulimavu, Bannerghatta Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560076",
    established: "2016",
    type: "Deemed-to-be University / Private",
    naacGrade: "A+",
    nirfRanking: "90th Overall, 57th Management, 13th Law, 67th University",
    approvals: ["UGC", "AICTE", "NAAC"],
    website: "christuniversity.in/bangalore-bannerghatta-road-campus",
    contact: {
      email: "admissions.bgr@christuniversity.in, mail@christuniversity.in"
    },
    campusArea: "2.4 acres",
    image: manipalImage,
    highlights: [
      "A+ NAAC Grade",
      "NIRF Ranked 90th Overall",
      "Specialized BBA programs",
      "Strong MBA programs",
      "International accreditations"
    ],
    courses: [
      {
        name: "BBA (Finance & International Business)",
        duration: "3-4 years",
        fees: "₹9.96 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Finance & Economics)",
        duration: "3-4 years",
        fees: "₹9.72 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Strategy & Business Analytics)",
        duration: "3-4 years",
        fees: "₹9.72 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Tourism & Travel Management)",
        duration: "3-4 years",
        fees: "₹8.96 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Hons)",
        duration: "3-4 years",
        fees: "₹10.68-10.96 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc Psychology",
        duration: "3-4 years",
        fees: "₹6.24 Lakhs",
        eligibility: "10+2 with 55% aggregate",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc Psychology (Hons)",
        duration: "3-4 years",
        fees: "₹6 Lakhs",
        eligibility: "10+2 with 55% aggregate",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc Economics with Data Science)",
        duration: "3-4 years",
        fees: "Contact University",
        eligibility: "10+2 with 50% + Mathematics",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA Liberal Arts (Hons)",
        duration: "3-4 years",
        fees: "₹8.12 Lakhs",
        eligibility: "10+2 with 55% aggregate",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA (Various Specializations)",
        duration: "3-4 years",
        fees: "₹4.72-8.12 Lakhs",
        eligibility: "10+2 with 55% aggregate",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "MBA (Finance & International Business)",
        duration: "2 years",
        fees: "₹10.68 Lakhs",
        eligibility: "Graduation with 50% + CAT/MAT/XAT/CMAT/GMAT/GRE",
        entranceExam: "CAT/MAT/XAT/CMAT/ATMA/GMAT/GRE + WA + GD + MP + VA + AP + SA",
        level: "PG"
      },
      {
        name: "MA (Tourism & Hospitality Management)",
        duration: "2 years",
        fees: "₹4.2 Lakhs",
        eligibility: "Graduation with 50%",
        entranceExam: "CUET + MP + SA + PI",
        level: "PG"
      }
    ]
  },
  {
    id: "christ-central",
    name: "CHRIST (Deemed to be University)",
    campusName: "Central Campus",
    location: "Hosur Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560029",
    established: "1969",
    type: "Deemed-to-be University / Private",
    naacGrade: "A+",
    nirfRanking: "96th Overall, 63rd University",
    approvals: ["UGC", "AICTE", "NAAC"],
    website: "christuniversity.in",
    contact: {
      phone: "080-40129000"
    },
    campusArea: "25 acres",
    image: manipalImage,
    highlights: [
      "A+ NAAC Grade",
      "50+ UG programs",
      "44+ PG programs",
      "21+ PhD programs",
      "Multiple schools covering diverse academic disciplines"
    ],
    courses: [
      {
        name: "BA Communication and Media, English and Psychology",
        duration: "4 years",
        fees: "₹2.30 - 5.88 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        department: "Arts, Humanities and Social Sciences",
        level: "UG"
      },
      {
        name: "BA Economics, Political Science, Sociology",
        duration: "4 years",
        fees: "₹2.30 - 3.53 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        department: "Arts, Humanities and Social Sciences",
        level: "UG"
      },
      {
        name: "BA History, Economics, Political Science",
        duration: "4 years",
        fees: "₹2.30 - 4.00 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        department: "Arts, Humanities and Social Sciences",
        level: "UG"
      },
      {
        name: "BA Journalism, Psychology, English",
        duration: "4 years",
        fees: "₹2.30 - 4.73 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        department: "Arts, Humanities and Social Sciences",
        level: "UG"
      },
      {
        name: "BSc Biotechnology, Chemistry, Botany",
        duration: "4 years",
        fees: "₹3.30 - 12.48 Lakhs",
        eligibility: "10+2 with PCB/PCM",
        entranceExam: "CUET + SA + MP + PI",
        department: "Sciences",
        level: "UG"
      },
      {
        name: "BSc Computer Science, Mathematics, Electronics",
        duration: "4 years",
        fees: "₹3.30 - 12.48 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "CUET + SA + MP + PI",
        department: "Sciences",
        level: "UG"
      },
      {
        name: "BSc Computer Science, Mathematics, Statistics",
        duration: "4 years",
        fees: "₹3.30 - 12.48 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "CUET + SA + MP + PI",
        department: "Sciences",
        level: "UG"
      },
      {
        name: "BBA",
        duration: "3-4 years",
        fees: "₹8-12 Lakhs",
        eligibility: "10+2 from recognized board",
        entranceExam: "CUET + SA + MP + PI",
        department: "Business and Management",
        level: "UG"
      },
      {
        name: "BCom (Various Specializations)",
        duration: "3-4 years",
        fees: "₹3-10 Lakhs",
        eligibility: "10+2 with commerce",
        entranceExam: "CUET + SA + MP + PI",
        department: "Commerce Finance and Accountancy",
        level: "UG"
      },
      {
        name: "BA LLB",
        duration: "5 years",
        fees: "₹15-18 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CLAT/CUET",
        department: "Law",
        level: "UG"
      },
      {
        name: "BBA LLB",
        duration: "5 years",
        fees: "₹15-18 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CLAT/CUET",
        department: "Law",
        level: "UG"
      },
      {
        name: "MBA",
        duration: "2 years",
        fees: "₹10-12 Lakhs",
        eligibility: "Graduation with 50%",
        entranceExam: "CAT/MAT/XAT/CMAT",
        department: "Business and Management",
        level: "PG"
      },
      {
        name: "MCom",
        duration: "2 years",
        fees: "₹4-6 Lakhs",
        eligibility: "BCom with 50%",
        entranceExam: "CUET PG",
        department: "Commerce Finance and Accountancy",
        level: "PG"
      },
      {
        name: "MA (Various Specializations)",
        duration: "2 years",
        fees: "₹3-6 Lakhs",
        eligibility: "BA with 50%",
        entranceExam: "CUET PG",
        department: "Arts, Humanities and Social Sciences",
        level: "PG"
      },
      {
        name: "MSc (Various Specializations)",
        duration: "2 years",
        fees: "₹4-8 Lakhs",
        eligibility: "BSc with 50%",
        entranceExam: "CUET PG",
        department: "Sciences",
        level: "PG"
      },
      {
        name: "MCA",
        duration: "2 years",
        fees: "₹6-8 Lakhs",
        eligibility: "BCA/BSc CS with 50%",
        entranceExam: "CUET PG",
        department: "Sciences",
        level: "PG"
      }
    ]
  },
  {
    id: "christ-kengeri",
    name: "CHRIST (Deemed to be University)",
    campusName: "Bangalore Kengeri Campus (School of Engineering)",
    location: "Kanmanike, Kumbalgodu, Mysore Road, Kengeri",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560074",
    established: "2009",
    type: "Deemed-to-be University / Private",
    naacGrade: "A",
    nirfRanking: "Engineering: 76th, University: 63rd, Architecture: 34th, Overall: 96th",
    approvals: ["UGC", "AICTE", "NAAC", "NBA"],
    website: "christuniversity.in/kengeri-campus",
    contact: {
      phone: "080-40129828",
      email: "office.kengeri@christuniversity.in"
    },
    campusArea: "78.5-80 acres",
    image: bitsImage,
    highlights: [
      "NAAC A Grade",
      "NIRF Ranked 76th in Engineering",
      "NBA accredited programs",
      "4 Schools of study",
      "State-of-the-art infrastructure"
    ],
    courses: [
      {
        name: "BTech Computer Science & Engineering (CSE)",
        duration: "4 years",
        fees: "₹6.4-10.2 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech AI & Machine Learning",
        duration: "4 years",
        fees: "₹8.6-10.2 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Data Science",
        duration: "4 years",
        fees: "₹8.6-10.2 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Electronics & Communication (ECE)",
        duration: "4 years",
        fees: "₹6.4-8.6 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Information Technology",
        duration: "4 years",
        fees: "₹6.4-8.6 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Electrical & Electronics (EEE)",
        duration: "4 years",
        fees: "₹6.4-8.6 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Civil Engineering",
        duration: "4 years",
        fees: "₹6.4-8.6 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Mechanical Engineering",
        duration: "4 years",
        fees: "₹6.4-8.6 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "BTech Robotics & Mechatronics",
        duration: "4 years",
        fees: "₹10-11.56 Lakhs",
        eligibility: "10+2 with 45% in PCM",
        entranceExam: "KCET/CUET",
        level: "UG"
      },
      {
        name: "B.Arch (Bachelor of Architecture)",
        duration: "5 years",
        fees: "₹14.70-17.7 Lakhs",
        eligibility: "10+2 with 50% in PCM",
        entranceExam: "NATA/JEE Main Paper-II",
        level: "UG"
      },
      {
        name: "BBA",
        duration: "4 years",
        fees: "₹8.2 Lakhs",
        eligibility: "10+2",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc Psychology",
        duration: "4 years",
        fees: "₹6.25-6.62 Lakhs",
        eligibility: "10+2 with 55%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "MTech (8 specializations)",
        duration: "2 years",
        fees: "₹1.6-2.22 Lakhs",
        eligibility: "BTech/BE with 50%",
        entranceExam: "Karnataka PGCET/GATE",
        level: "PG"
      },
      {
        name: "M.Arch",
        duration: "2 years",
        fees: "₹2.1 Lakhs",
        eligibility: "B.Arch with 50%",
        entranceExam: "Karnataka PGCET/GATE",
        level: "PG"
      },
      {
        name: "MBA/PGDM",
        duration: "2 years",
        fees: "₹8.2 Lakhs",
        eligibility: "Graduation with 50%",
        entranceExam: "Karnataka PGCET/MAT/XAT",
        level: "PG"
      }
    ]
  },
  {
    id: "christ-ypr",
    name: "CHRIST (Deemed to be University)",
    campusName: "Bangalore Yeshwanthpur Campus (YPR Campus)",
    location: "Nagasandra, Near Tumkur Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560073",
    established: "2022",
    type: "Deemed-to-be University / Private",
    naacGrade: "A+",
    nirfRanking: "Overall: 96th, University: 63rd, Management: 57th, Law: 24th, Engineering: 76th, Architecture: 34th",
    approvals: ["UGC", "AICTE", "NAAC", "BCI", "NCTE"],
    website: "christuniversity.in/bangalore-yeshwanthpur-campus",
    contact: {
      phone: "080-40129000"
    },
    campusArea: "36 acres",
    image: amityImage,
    highlights: [
      "A+ NAAC Grade",
      "5 Schools of study",
      "Newest campus inaugurated in 2022",
      "State-of-the-art facilities",
      "Multi-disciplinary approach"
    ],
    courses: [
      {
        name: "BBA (Business Analytics)",
        duration: "4 years",
        fees: "₹9.88-10.16 Lakhs",
        eligibility: "10+2",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Finance)",
        duration: "4 years",
        fees: "₹9.88-10.16 Lakhs",
        eligibility: "10+2",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BBA (Hons)",
        duration: "4 years",
        fees: "₹9.88-10.16 Lakhs",
        eligibility: "10+2",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BCom",
        duration: "4 years",
        fees: "₹3.06-4.88 Lakhs",
        eligibility: "10+2 with 70%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BCom (Hons) - International Accounting",
        duration: "4 years",
        fees: "₹16.76-18.33 Lakhs",
        eligibility: "10+2 with 70%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc (Computer Science, Mathematics)",
        duration: "4 years",
        fees: "₹3.36 Lakhs",
        eligibility: "10+2 with 50% + Mathematics",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc (Hons) - Computer Science",
        duration: "4 years",
        fees: "₹3.36-4.40 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc (Hons) - Economics, Mathematics, Statistics",
        duration: "4 years",
        fees: "₹5.44-5.78 Lakhs",
        eligibility: "10+2 with 50% + Mathematics",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BSc (Hons) - Psychology",
        duration: "4 years",
        fees: "₹6-6.62 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA (Communication & Media)",
        duration: "4 years",
        fees: "₹3.24-3.60 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA (Psychology)",
        duration: "4 years",
        fees: "₹2.85-3.80 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA (Hons) - English",
        duration: "4 years",
        fees: "₹5 Lakhs",
        eligibility: "10+2 with 55%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BA (Hons) - Psychology",
        duration: "4 years",
        fees: "₹4.96-6.30 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      },
      {
        name: "BCA (Hons)",
        duration: "4 years",
        fees: "₹6.72-7.73 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CUET + SA + MP + PI",
        level: "UG"
      }
    ]
  },
  {
    id: "dsce",
    name: "Dayananda Sagar College of Engineering",
    location: "Shavige Malleshwara Hills, 91st Main Rd, 1st Stage, Kumaraswamy Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560078",
    established: "1979",
    type: "Private Autonomous",
    naacGrade: "A (CGPA: 3.42/4)",
    nirfRanking: "126th Nationally",
    approvals: ["AICTE", "UGC", "NBA", "ISO 9001-2015"],
    website: "https://www.dsce.edu.in/",
    contact: {
      phone: "8042161751, 8042161750, 8792909121",
      email: "admissions@dsce.edu.in"
    },
    campusArea: "29 acres",
    image: bitsImage,
    highlights: [
      "NAAC A Grade",
      "NIRF Ranked 126th",
      "NBA Accredited programs",
      "ISO 9001-2015 Certified",
      "Autonomous status since 2015"
    ],
    courses: [
      {
        name: "Diploma in Civil Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "Diploma in Mechanical Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "Diploma in Computer Science & Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "Diploma in Electrical & Electronics Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "Diploma in Electronics & Communication Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "Diploma in Information Science Engineering",
        duration: "3 years",
        fees: "₹2.54 - 3.04 Lakhs",
        eligibility: "10th pass",
        department: "Engineering & Technology",
        level: "Diploma"
      },
      {
        name: "BTech/BE Computer Science & Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Mechanical Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Civil Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Electrical & Electronics Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Electronics & Communication Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Information Science & Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Biotechnology",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCB/PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Chemical Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Aeronautical Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Automobile Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Instrumentation Technology",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Telecommunication Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Medical Electronics",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Artificial Intelligence & Machine Learning",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Industrial Engineering & Management",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Construction Technology",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BTech/BE Electronics and Instrumentation Engineering",
        duration: "4 years",
        fees: "₹4.17 - 4.88 Lakhs",
        eligibility: "10+2 with PCM",
        entranceExam: "KCET/COMEDK",
        department: "Engineering & Technology",
        level: "UG"
      },
      {
        name: "BCom (Foreign Trade)",
        duration: "3 years",
        fees: "₹0.41 - 0.64 Lakhs",
        eligibility: "10+2",
        department: "Commerce & Business",
        level: "UG"
      },
      {
        name: "BCom (Computer Application)",
        duration: "3 years",
        fees: "₹0.53 - 0.79 Lakhs",
        eligibility: "10+2",
        department: "Commerce & Business",
        level: "UG"
      },
      {
        name: "BCom (Banking & Insurance)",
        duration: "3 years",
        fees: "₹0.65 - 0.97 Lakhs",
        eligibility: "10+2",
        department: "Commerce & Business",
        level: "UG"
      },
      {
        name: "MTech (Various Specializations)",
        duration: "2 years",
        fees: "₹1.5 - 2.5 Lakhs",
        eligibility: "BTech/BE with 50%",
        entranceExam: "GATE/Karnataka PGCET",
        department: "Engineering & Technology",
        level: "PG"
      },
      {
        name: "MBA",
        duration: "2 years",
        fees: "₹2 - 2.5 Lakhs",
        eligibility: "Graduation with 50%",
        entranceExam: "KMAT/PGCET/CAT",
        department: "Management",
        level: "PG"
      },
      {
        name: "MCA",
        duration: "2 years",
        fees: "₹1.5 - 2 Lakhs",
        eligibility: "BCA/BSc CS with 50%",
        entranceExam: "Karnataka PGCET",
        department: "Computer Applications",
        level: "PG"
      }
    ]
  },
  {
    id: "mcc",
    name: "Mount Carmel College",
    location: "No. 58, Palace Road, Fatima Block, Vasanth Nagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560052",
    established: "1948",
    type: "Private Autonomous Women's College (Co-ed from 2024)",
    naacGrade: "A+",
    nirfRanking: "151-200 Overall",
    approvals: ["Autonomous since 2005", "Affiliated to Bengaluru City University"],
    website: "https://mccblr.edu.in/",
    contact: {
      phone: "080 2226 1759, 080 2228 6386"
    },
    image: ashokaImage,
    highlights: [
      "A+ NAAC Grade",
      "NIRF Ranked 151-200",
      "Autonomous since 2005",
      "Co-educational from 2024",
      "75+ years of academic excellence"
    ],
    courses: [
      {
        name: "BSc General",
        duration: "3 years",
        fees: "₹1,29,000 - 1,42,000",
        eligibility: "10+2 Science (50% min)",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BCom General",
        duration: "3 years",
        fees: "₹2,16,000 - 3,52,500",
        eligibility: "10+2 Commerce/any stream (50%)",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BA General",
        duration: "3 years",
        fees: "₹1,65,000 - 2,36,200",
        eligibility: "10+2 any stream (50%)",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BBA General",
        duration: "3 years",
        fees: "₹5,25,000",
        eligibility: "10+2 any stream (50%)",
        entranceExam: "MCMAT + Interview",
        level: "UG"
      },
      {
        name: "BCA",
        duration: "3 years",
        fees: "₹2,86,500",
        eligibility: "10+2 Maths (50%)",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "MSc Psychology",
        duration: "2 years",
        fees: "₹2,18,400",
        eligibility: "BSc Psychology (50%+)",
        entranceExam: "PGCET or Merit",
        level: "PG"
      },
      {
        name: "MSc Biotechnology",
        duration: "2 years",
        fees: "₹2,24,600",
        eligibility: "BSc Biotechnology (50%+)",
        entranceExam: "PGCET or Merit",
        level: "PG"
      },
      {
        name: "MA General",
        duration: "2 years",
        fees: "₹1,52,000 - 2,36,200",
        eligibility: "Bachelor's relevant field (50%+)",
        entranceExam: "Merit-based + Interview",
        level: "PG"
      },
      {
        name: "MCom General",
        duration: "2 years",
        fees: "₹1,84,400 - 1,99,600",
        eligibility: "BCom (50%+)",
        entranceExam: "Merit-based + Interview",
        level: "PG"
      },
      {
        name: "MBA",
        duration: "2 years",
        fees: "₹81,700 - 1,16,940",
        eligibility: "Graduation (50%+)",
        entranceExam: "PGCET/CAT/CMAT/KMAT/MAT",
        level: "PG"
      }
    ]
  },
  {
    id: "nmims-bangalore",
    name: "Narsee Monjee Institute of Management Studies (NMIMS)",
    campusName: "Bangalore Campus",
    location: "Lakshmipura Village, Kalkere Post, Anekal Taluk, Bannerghatta Main Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560083",
    established: "2008",
    type: "Deemed-to-be University (Private)",
    naacGrade: "A++ (CGPA 3.67)",
    nirfRanking: "Not specifically ranked; NMIMS Mumbai ranked #24 in Management",
    approvals: ["AICTE", "UGC", "AMBA", "SAQS", "Bar Council of India"],
    website: "https://nmimsbengaluru.org",
    contact: {},
    campusArea: "8.5 acres (Main Campus)",
    image: jindalImage,
    highlights: [
      "A++ NAAC Grade",
      "AMBA MBA accreditation",
      "Two campuses in Bangalore",
      "56 classrooms across campuses",
      "State-of-the-art facilities"
    ],
    courses: [
      {
        name: "MBA",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%; work experience preferred",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "MBA (Finance)",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "MBA (Marketing)",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "MBA (Operations)",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "MBA (HR)",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "MBA (Business Analytics)",
        duration: "2 years",
        fees: "₹22 Lakhs",
        eligibility: "Bachelor's degree with minimum 50%",
        entranceExam: "NMAT by GMAC",
        department: "School of Business Management",
        level: "PG"
      },
      {
        name: "BBA",
        duration: "3 years",
        fees: "₹9.75 Lakhs",
        eligibility: "10+2 with 50% from recognized board",
        entranceExam: "NPAT (NMIMS Programs After Twelfth)",
        department: "School of Business Management",
        level: "UG"
      },
      {
        name: "BCom",
        duration: "3 years",
        fees: "₹8-10 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "NPAT",
        department: "School of Commerce",
        level: "UG"
      },
      {
        name: "BBA LLB (Hons)",
        duration: "5 years",
        fees: "₹15-18 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CLAT/NPAT",
        department: "School of Law",
        level: "UG"
      },
      {
        name: "BA LLB (Hons)",
        duration: "5 years",
        fees: "₹15-18 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "CLAT/NPAT",
        department: "School of Law",
        level: "UG"
      },
      {
        name: "BA (Economics)",
        duration: "3 years",
        fees: "₹7-9 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "NPAT",
        department: "School of Economics",
        level: "UG"
      }
    ]
  },
  {
    id: "sju",
    name: "St. Joseph's University",
    location: "36 Lalbagh Road, Langford Town",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560027",
    established: "1882",
    type: "Private (Autonomous University)",
    naacGrade: "A++ (Grade 3.79/4)",
    approvals: ["UGC Listed", "Ministry of Education (MoE)", "Institution's Innovation Cell (IIC)"],
    website: "https://www.sju.edu.in",
    contact: {
      phone: "8022274079",
      email: "desk@sju.edu.in"
    },
    campusArea: "8.44 acres",
    image: shivNadarImage,
    highlights: [
      "A++ NAAC Grade (3.79/4)",
      "Public-Private Partnership University since 2022",
      "140+ years of academic excellence",
      "5500+ students",
      "300+ faculty and staff"
    ],
    courses: [
      {
        name: "Bachelor of Arts (BA)",
        duration: "3 years",
        fees: "₹90,000 - ₹3,96,000",
        eligibility: "10+2 with minimum 50% aggregate",
        entranceExam: "SJUET (St. Joseph's University Entrance Test)",
        level: "UG"
      },
      {
        name: "BA Journalism & Mass Communication",
        duration: "3 years",
        fees: "₹3,96,000",
        eligibility: "10+2 with minimum 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BA Advertising & PR",
        duration: "3 years",
        fees: "₹3,96,000",
        eligibility: "10+2 with minimum 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BA Economics",
        duration: "3 years",
        fees: "₹2-3 Lakhs",
        eligibility: "10+2 with minimum 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BA English",
        duration: "3 years",
        fees: "₹2-3 Lakhs",
        eligibility: "10+2 with minimum 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BA Political Science",
        duration: "3 years",
        fees: "₹2-3 Lakhs",
        eligibility: "10+2 with minimum 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "Bachelor of Science (BSc)",
        duration: "3 years",
        fees: "₹1,49,000 - ₹3,46,500",
        eligibility: "10+2 with Physics, Chemistry, Math/Biology and 50% aggregate",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BSc Biotechnology",
        duration: "3 years",
        fees: "₹3,46,500",
        eligibility: "10+2 with PCB/PCM and 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BSc Computer Science",
        duration: "3 years",
        fees: "₹3,46,500",
        eligibility: "10+2 with PCM and 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BSc Microbiology",
        duration: "3 years",
        fees: "₹3,46,500",
        eligibility: "10+2 with PCB and 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "BSc Economics",
        duration: "3 years",
        fees: "₹2-3 Lakhs",
        eligibility: "10+2 with 50%",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "Bachelor of Commerce (BCom)",
        duration: "3 years",
        fees: "₹3,13,500 - ₹5,61,000",
        eligibility: "10+2 with Commerce and 50% aggregate",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BCom General",
        duration: "3 years",
        fees: "₹3,13,500",
        eligibility: "10+2 with Commerce and 50%",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BCom Honors",
        duration: "3 years",
        fees: "₹4-5 Lakhs",
        eligibility: "10+2 with Commerce and 50%",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "BCom Analytics",
        duration: "3 years",
        fees: "₹5,61,000",
        eligibility: "10+2 with Commerce and 50%",
        entranceExam: "Merit-based",
        level: "UG"
      },
      {
        name: "Bachelor of Business Administration (BBA)",
        duration: "3 years",
        fees: "₹3,96,000",
        eligibility: "10+2 with 50% aggregate",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "Bachelor of Computer Application (BCA)",
        duration: "3 years",
        fees: "₹4,29,000",
        eligibility: "10+2 with Mathematics and 50% aggregate",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "Bachelor of Social Work (BSW)",
        duration: "3 years",
        fees: "₹2-3 Lakhs",
        eligibility: "10+2 with 50% aggregate",
        entranceExam: "SJUET",
        level: "UG"
      },
      {
        name: "Master of Arts (MA)",
        duration: "2 years",
        fees: "₹1,65,000 - ₹2,75,000",
        eligibility: "Bachelor's degree with 40-50% aggregate",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MA English",
        duration: "2 years",
        fees: "₹1,65,000",
        eligibility: "BA with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MA Economics",
        duration: "2 years",
        fees: "₹2-2.5 Lakhs",
        eligibility: "BA with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MA Journalism & Mass Communication",
        duration: "2 years",
        fees: "₹2,75,000",
        eligibility: "BA with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "Master of Science (MSc)",
        duration: "2 years",
        fees: "₹1,54,000 - ₹3,40,000",
        eligibility: "Bachelor's degree with 40-50% aggregate in relevant field",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MSc Biotechnology",
        duration: "2 years",
        fees: "₹3,40,000",
        eligibility: "BSc with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MSc Computer Science",
        duration: "2 years",
        fees: "₹3,40,000",
        eligibility: "BSc CS with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "MSc Microbiology",
        duration: "2 years",
        fees: "₹3,40,000",
        eligibility: "BSc with 40-50%",
        entranceExam: "SJUET",
        level: "PG"
      },
      {
        name: "Master of Commerce (MCom)",
        duration: "2 years",
        fees: "₹2,09,000 - ₹2,75,000",
        eligibility: "BCom with 40-50% aggregate",
        entranceExam: "Merit-based/SJUET",
        level: "PG"
      },
      {
        name: "Master of Business Administration (MBA)",
        duration: "2 years",
        fees: "₹4,29,000 - ₹5,50,000",
        eligibility: "Bachelor's degree with 50% aggregate",
        entranceExam: "KMAT/CAT/MAT/XAT/CMAT",
        level: "PG"
      },
      {
        name: "Master of Computer Application (MCA)",
        duration: "2 years",
        fees: "₹3,85,000",
        eligibility: "BCA/BSc CS with 50% aggregate",
        entranceExam: "SJUET/Karnataka PGCET",
        level: "PG"
      },
      {
        name: "Master of Social Work (MSW)",
        duration: "2 years",
        fees: "₹2-2.5 Lakhs",
        eligibility: "BSW/Bachelor's with 50%",
        entranceExam: "SJUET",
        level: "PG"
      }
    ]
  }
];
