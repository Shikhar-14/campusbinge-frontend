import type { Student, Application, Requirement, Task, Event, Document } from "@/types/applicationTypes";
import manipalImage from "@/assets/manipal-university.jpg";
import bitsImage from "@/assets/bits-pilani.jpg";
import shivNadarImage from "@/assets/shiv-nadar-university.jpg";
import amityImage from "@/assets/amity-university.jpg";
import upesImage from "@/assets/upes-dehradun.jpg";
import ashokaImage from "@/assets/ashoka-university.jpg";
import jindalImage from "@/assets/jindal-university.jpg";

export const demoStudent: Student = {
  id: "student-1",
  name: "Rishi Test",
  email: "rishi.test@example.com",
  timezone: "Asia/Kolkata",
};

export const demoApplications: Application[] = [];

export const demoRequirements: Requirement[] = [];

export const demoTasks: Task[] = [];

export const demoEvents: Event[] = [];

export const demoDocuments: Document[] = [];
