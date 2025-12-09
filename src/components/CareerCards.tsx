import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Briefcase, GraduationCap, Building2, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CareerOption = {
  title: string;
  course: string;
  colleges: string[];
  fees: string;
  salary: string;
  details: {
    description: string;
    skills: string[];
    companies: string[];
    linkedinProfiles: string[];
  };
};

type CareerCardsProps = {
  careers: CareerOption[];
};

export const CareerCards = ({ careers }: CareerCardsProps) => {
  const navigate = useNavigate();

  const handleExploreNow = (career: CareerOption) => {
    navigate('/application-tracker', { 
      state: { 
        course: career.course,
        colleges: career.colleges,
        careerPath: career.title 
      } 
    });
  };

  // Filter out invalid career entries
  const validCareers = careers.filter(career => 
    career && 
    career.title && 
    career.course && 
    career.details && 
    career.details.description
  );

  if (validCareers.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <Carousel className="w-full">
        <CarouselContent>
          {validCareers.map((career, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2">{career.title}</h3>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Course</p>
                      <p className="text-sm font-medium break-words">{career.course}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Top Colleges</p>
                      <p className="text-sm font-medium break-words">{career.colleges.slice(0, 2).join(", ")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Fees Range</p>
                      <p className="text-sm font-medium break-words">{career.fees}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Expected Salary</p>
                      <p className="text-sm font-medium break-words">{career.salary}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button 
                    className="w-full"
                    onClick={() => handleExploreNow(career)}
                  >
                    Explore Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        {career.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{career.details.description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Recommended Course</h4>
                        <p className="text-sm">{career.course}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Top Colleges</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {career.colleges.map((college, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{college}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Key Skills Required</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.details.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Top Companies Hiring</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.details.companies.map((company, idx) => (
                            <span key={idx} className="px-3 py-1 bg-muted rounded-full text-xs">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">LinkedIn Success Stories</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {career.details.linkedinProfiles.map((profile, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{profile}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Fees Range</p>
                          <p className="font-semibold">{career.fees}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Expected Salary</p>
                          <p className="font-semibold">{career.salary}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
