import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, LayoutGrid, Table as TableIcon, Filter } from "lucide-react";
import type { Application, Requirement } from "@/types/applicationTypes";
import { getStatusLabel, getStatusColor, getPortalLabel, getCountryFlag, getProgressPercentage, formatDeadline, getDeadlineColor, filterApplications } from "@/utils/applicationUtils";

interface ApplicationsListProps {
  applications: Application[];
  requirements: Requirement[];
  onSelectApplication: (app: Application) => void;
}

export const ApplicationsList = ({ applications, requirements, onSelectApplication }: ApplicationsListProps) => {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<"all" | "US" | "UK" | "CA" | "IN">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredApplications = filterApplications(applications, {
    search,
    country: countryFilter,
    status: statusFilter as any,
  });

  const getAppRequirements = (appId: string) => {
    return requirements.filter(r => r.applicationId === appId);
  };

  const getTaskProgress = (appId: string) => {
    const reqs = getAppRequirements(appId);
    const completed = reqs.filter(r => r.status === "UPLOADED").length;
    return `${completed}/${reqs.length}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search university, course, or App ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 glass"
              />
            </div>
            <div className="flex gap-2">
              <Select value={countryFilter} onValueChange={(v: any) => setCountryFilter(v)}>
                <SelectTrigger className="w-[140px] glass">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="US">🇺🇸 US</SelectItem>
                  <SelectItem value="UK">🇬🇧 UK</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                  <SelectItem value="IN">🇮🇳 India</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] glass">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="AWAITING_DOCS">Awaiting Docs</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-md glass p-1">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 w-8 p-0"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">University</TableHead>
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold">Portal</TableHead>
                  <TableHead className="font-semibold">Course</TableHead>
                  <TableHead className="font-semibold">Term</TableHead>
                  <TableHead className="font-semibold">App ID</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Deadline</TableHead>
                  <TableHead className="font-semibold">Fee</TableHead>
                  <TableHead className="font-semibold">Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => onSelectApplication(app)}
                  >
                    <TableCell className="font-medium">{app.university}</TableCell>
                    <TableCell>
                      <span className="text-lg">{getCountryFlag(app.country)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getPortalLabel(app.portal)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{app.course}</TableCell>
                    <TableCell>{app.term}</TableCell>
                    <TableCell className="font-mono text-xs">{app.appId}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(app.currentStatus)} text-xs`}>
                        {getStatusLabel(app.currentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className={getDeadlineColor(app.deadline)}>
                      {formatDeadline(app.deadline)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">${app.feeAmount}</span>
                        {app.feePaid && <Badge variant="outline" className="text-xs">Paid</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{getTaskProgress(app.id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app, index) => {
            const progress = getProgressPercentage(getAppRequirements(app.id));
            return (
              <Card
                key={app.id}
                className="glass-card cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelectApplication(app)}
              >
                {app.image && (
                  <div className="w-full h-32 overflow-hidden relative">
                    <img src={app.image} alt={app.university} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-2 right-2 text-2xl">{getCountryFlag(app.country)}</span>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base truncate">{app.university}</h3>
                    <p className="text-xs text-muted-foreground truncate">{app.course}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{getPortalLabel(app.portal)}</Badge>
                    <Badge className={`${getStatusColor(app.currentStatus)} text-xs`}>
                      {getStatusLabel(app.currentStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className={`font-medium ${getDeadlineColor(app.deadline)}`}>
                      {formatDeadline(app.deadline)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredApplications.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No applications match your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
