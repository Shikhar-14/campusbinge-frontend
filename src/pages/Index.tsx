import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Users, MessageSquare, FileCheck } from "lucide-react";
import { NewsSection } from "@/components/NewsSection";
import bhAiLogo from "@/assets/bh-ai-logo.png";

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Your College Journey Starts Here
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow students, get AI-powered assistance, and track your college applications all in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/forum">
              <Button size="lg" className="text-lg px-8">
                Join the Community
              </Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Community</h3>
              <p className="text-muted-foreground">
                Connect with peers, share experiences, and build lasting friendships
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discussion Forum</h3>
              <p className="text-muted-foreground">
                Ask questions, share insights, and engage in meaningful conversations
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src={bhAiLogo} alt="Bh.AI" className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">
                Get instant answers to your college-related questions with AI
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Application Tracker</h3>
              <p className="text-muted-foreground">
                Stay organized and track all your college applications in one place
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />
    </div>
  );
};

export default Index;
