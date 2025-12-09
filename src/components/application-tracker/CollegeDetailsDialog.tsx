import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, Star, GraduationCap, Building2, CheckCircle, 
  IndianRupee, Clock, Globe, Mail, Phone 
} from "lucide-react";
import type { CollegeData } from "@/data/collegesData";

interface CollegeDetailsDialogProps {
  college: CollegeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyCourse: (courseName: string) => void;
}

export const CollegeDetailsDialog = ({ 
  college, 
  open, 
  onOpenChange,
  onApplyCourse 
}: CollegeDetailsDialogProps) => {
  if (!college) return null;

  const ugCourses = college.courses.filter(c => c.level === "UG");
  const pgCourses = college.courses.filter(c => c.level === "PG");
  const diplomaCourses = college.courses.filter(c => c.level === "Diploma");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-2 max-w-6xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl">{college.name}</DialogTitle>
              {college.campusName && (
                <p className="text-muted-foreground">{college.campusName}</p>
              )}
            </DialogHeader>

            {/* College Info Grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Basic Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{college.location}</p>
                        <p className="text-muted-foreground">{college.city}, {college.state} - {college.pincode}</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Established:</span>
                      <span className="font-medium">{college.established}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-xs">{college.type}</span>
                    </div>
                    {college.campusArea && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Campus Area:</span>
                        <span className="font-medium">{college.campusArea}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Accreditation & Rankings
                  </h3>
                  <div className="space-y-2 text-sm">
                    {college.naacGrade && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NAAC Grade:</span>
                        <Badge variant="secondary">{college.naacGrade}</Badge>
                      </div>
                    )}
                    {college.nirfRanking && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIRF Ranking:</span>
                        <span className="font-medium text-xs">{college.nirfRanking}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground mb-2">Approvals:</p>
                      <div className="flex flex-wrap gap-1">
                        {college.approvals.map((approval, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{approval}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="glass-card mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  {college.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{college.contact.phone}</span>
                    </div>
                  )}
                  {college.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-xs">{college.contact.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href={`https://${college.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                      {college.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card className="glass-card mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Key Highlights</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {college.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Courses */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Available Courses ({college.courses.length})
                </h3>
                
                <Tabs defaultValue="ug" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {ugCourses.length > 0 && (
                      <TabsTrigger value="ug">UG ({ugCourses.length})</TabsTrigger>
                    )}
                    {pgCourses.length > 0 && (
                      <TabsTrigger value="pg">PG ({pgCourses.length})</TabsTrigger>
                    )}
                    {diplomaCourses.length > 0 && (
                      <TabsTrigger value="diploma">Diploma ({diplomaCourses.length})</TabsTrigger>
                    )}
                  </TabsList>

                  {ugCourses.length > 0 && (
                    <TabsContent value="ug" className="space-y-3 mt-4">
                      {ugCourses.map((course, i) => (
                        <Card key={i} className="glass border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <h4 className="font-semibold">{course.name}</h4>
                                {course.department && (
                                  <p className="text-xs text-muted-foreground">{course.department}</p>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="ml-2 font-medium">{course.duration}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fees:</span>
                                    <span className="ml-2 font-medium">{course.fees}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Eligibility:</span>
                                    <span className="ml-2 font-medium">{course.eligibility}</span>
                                  </div>
                                  {course.entranceExam && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Entrance:</span>
                                      <span className="ml-2 font-medium">{course.entranceExam}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onApplyCourse(course.name);
                                  onOpenChange(false);
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  )}

                  {pgCourses.length > 0 && (
                    <TabsContent value="pg" className="space-y-3 mt-4">
                      {pgCourses.map((course, i) => (
                        <Card key={i} className="glass border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <h4 className="font-semibold">{course.name}</h4>
                                {course.department && (
                                  <p className="text-xs text-muted-foreground">{course.department}</p>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="ml-2 font-medium">{course.duration}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fees:</span>
                                    <span className="ml-2 font-medium">{course.fees}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Eligibility:</span>
                                    <span className="ml-2 font-medium">{course.eligibility}</span>
                                  </div>
                                  {course.entranceExam && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Entrance:</span>
                                      <span className="ml-2 font-medium">{course.entranceExam}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onApplyCourse(course.name);
                                  onOpenChange(false);
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  )}

                  {diplomaCourses.length > 0 && (
                    <TabsContent value="diploma" className="space-y-3 mt-4">
                      {diplomaCourses.map((course, i) => (
                        <Card key={i} className="glass border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <h4 className="font-semibold">{course.name}</h4>
                                {course.department && (
                                  <p className="text-xs text-muted-foreground">{course.department}</p>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="ml-2 font-medium">{course.duration}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fees:</span>
                                    <span className="ml-2 font-medium">{course.fees}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Eligibility:</span>
                                    <span className="ml-2 font-medium">{course.eligibility}</span>
                                  </div>
                                  {course.entranceExam && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Entrance:</span>
                                      <span className="ml-2 font-medium">{course.entranceExam}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onApplyCourse(course.name);
                                  onOpenChange(false);
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
