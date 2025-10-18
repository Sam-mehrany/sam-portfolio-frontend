"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, GraduationCap, Wrench } from "lucide-react";
import { useState, useEffect } from "react";

// --- TYPE DEFINITIONS ---
interface Position {
  id: number;
  role: string;
  period: string;
  points: string;
}
interface Experience {
  id: number;
  company: string;
  positions: Position[];
}
interface Education {
  id: number;
  degree: string;
  university: string;
}
interface AboutPageContent {
  summary: string;
  experiences: Experience[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  educations: Education[];
}

// --- DATA FETCHING ---
async function getPageContent(): Promise<AboutPageContent | null> {
  try {
    const res = await fetch('/api/pages/about', { cache: 'no-store' });
    if (!res.ok) return null;
    const page = await res.json();
    return page.content;
  } catch (error) {
    console.error("Failed to fetch About page content:", error);
    return null;
  }
}

// --- COMPONENT ---
export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getPageContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">About Me</h1>
            <div className="mt-4">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </header>
        </div>
      </main>
    );
  }

  // Provide default data if content fails to load
  const summary = content?.summary || "Content is loading...";
  const experiences = content?.experiences || [];
  const educations = content?.educations || [];
  
  // Directly use the arrays from the content object. No .split() needed.
  const technicalSkills = content?.skills?.technical || [];
  const softSkills = content?.skills?.soft || [];
  const tools = content?.skills?.tools || [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">About Me</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {summary}
          </p>
        </header>

        <div className="space-y-8">
          {/* Section Titles Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <h2 className="md:col-span-2 text-3xl font-semibold flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
              Work Experience
            </h2>
            <h2 className="md:col-span-1 text-3xl font-semibold">
              Skills & Expertise
            </h2>
          </div>

          {/* Section Content Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Main Column: Work Experience Cards */}
            <div className="md:col-span-2 space-y-8">
              {experiences.map((exp) => (
                <Card key={exp.id} className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {exp.company}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(exp.positions || []).map((position) => (
                      <div key={position.id} className="border-l-2 border-border pl-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-lg font-semibold">{position.role}</h3>
                          <span className="text-sm text-muted-foreground">{position.period}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-foreground">
                          {(position.points || '').split('\n').map((point, index) => (
                            point && <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar Column: Skills, Tools, Education Cards */}
            <div className="md:col-span-1 space-y-8">
              <Card className="rounded-2xl">
                <CardHeader><CardTitle className="text-xl">Technical Skills</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {technicalSkills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader><CardTitle className="text-xl">Soft Skills</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {softSkills.map(skill => <Badge variant="secondary" key={skill}>{skill}</Badge>)}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Wrench className="h-5 w-5" /> Tools & Software
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {tools.map(tool => <Badge variant="outline" key={tool}>{tool}</Badge>)}
                </CardContent>
              </Card>

              {educations.map((edu) => (
                <Card key={edu.id} className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" /> Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.university}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
