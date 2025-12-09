import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, MapPin, Star, GraduationCap, IndianRupee, Building2 } from "lucide-react";
import type { CollegeData } from "@/data/collegesData";

interface CollegeComparisonProps {
  college1: CollegeData;
  college2: CollegeData;
  onClose: () => void;
}

export const CollegeComparison = ({ college1, college2, onClose }: CollegeComparisonProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="glass-card max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">College Comparison</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(90vh-100px)]">
            <div className="grid grid-cols-2 divide-x">
              {/* College 1 */}
              <div className="p-6 space-y-6">
                <div>
                  <img 
                    src={college1.image} 
                    alt={college1.name} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">{college1.name}</h3>
                  {college1.campusName && (
                    <p className="text-sm text-muted-foreground">{college1.campusName}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{college1.city}, {college1.state}</p>
                    </div>
                  </div>

                  {college1.nirfRanking && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">NIRF Ranking</p>
                        <p className="text-sm text-muted-foreground">{college1.nirfRanking}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Established</p>
                      <p className="text-sm text-muted-foreground">{college1.established}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Courses</p>
                      <p className="text-sm text-muted-foreground">{college1.courses.length} Programs</p>
                    </div>
                  </div>

                  {college1.naacGrade && (
                    <div>
                      <p className="text-sm font-medium mb-1">NAAC Grade</p>
                      <Badge variant="secondary">{college1.naacGrade}</Badge>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Approvals</p>
                    <div className="flex flex-wrap gap-1">
                      {college1.approvals.map((approval, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{approval}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Highlights</p>
                    <ul className="space-y-1">
                      {college1.highlights.slice(0, 5).map((highlight, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* College 2 */}
              <div className="p-6 space-y-6">
                <div>
                  <img 
                    src={college2.image} 
                    alt={college2.name} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">{college2.name}</h3>
                  {college2.campusName && (
                    <p className="text-sm text-muted-foreground">{college2.campusName}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{college2.city}, {college2.state}</p>
                    </div>
                  </div>

                  {college2.nirfRanking && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">NIRF Ranking</p>
                        <p className="text-sm text-muted-foreground">{college2.nirfRanking}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Established</p>
                      <p className="text-sm text-muted-foreground">{college2.established}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Courses</p>
                      <p className="text-sm text-muted-foreground">{college2.courses.length} Programs</p>
                    </div>
                  </div>

                  {college2.naacGrade && (
                    <div>
                      <p className="text-sm font-medium mb-1">NAAC Grade</p>
                      <Badge variant="secondary">{college2.naacGrade}</Badge>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Approvals</p>
                    <div className="flex flex-wrap gap-1">
                      {college2.approvals.map((approval, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{approval}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Highlights</p>
                    <ul className="space-y-1">
                      {college2.highlights.slice(0, 5).map((highlight, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
