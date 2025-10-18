"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Checkbox } from "@/components/ui/checkbox";

// --- TYPE DEFINITIONS ---
interface Project { id: number; title: string; }
interface Position { id: number; role: string; period: string; points: string; }
interface Experience { id: number; company: string; positions: Position[]; }
interface Education { id: number; degree: string; university: string; }

interface HomePageContent {
  hero: { 
    h1: string;  // ⭐ ADDED THIS
    availability: string; 
    headline: string; 
    skills: string; 
  };
  snapshot: { role: string; location: string; focus: string; socials: { instagram: string; linkedin: string; email: string; }; };
  work: { title: string; subtitle: string; selectedProjects: number[] };
}

interface AboutPageContent {
  summary: string;
  experiences: Experience[];
  skills: { technical: string[]; soft: string[]; tools: string[]; };
  educations: Education[];
}

type PageContent = HomePageContent | AboutPageContent | string;

// --- COMPONENT ---
export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<PageContent | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [pageRes, projectsRes] = await Promise.all([
            fetch(`/api/pages/${slug}`, { credentials: 'include' }),
            fetch('/api/projects', { credentials: 'include' })
          ]);
            
          if (pageRes.ok) {
            const data = await pageRes.json();
            setTitle(data.title);
            
            const parsedContent = typeof data.content === 'string' 
              ? JSON.parse(data.content) 
              : data.content;
            setContent(parsedContent);
          }
          if (projectsRes.ok) setAllProjects(await projectsRes.json());
        } catch (error: unknown) {
          console.error("Failed to fetch data:", error);
          if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
          }
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
        credentials: 'include'
      });
      if (response.ok) {
        setMessage("Page saved successfully!");
      } else {
        throw new Error("Failed to save page.");
      }
    } catch (error: unknown) {
        if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Error: An unknown error occurred.");
        }
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleContentChange = (path: string, value: string) => {
    setContent((prev: PageContent | null) => {
      if (!prev) return prev;
      const newContent = JSON.parse(JSON.stringify(prev));
      let current: any = newContent;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };
  
  const addListItem = (listName: 'experiences' | 'educations' | 'skills.technical' | 'skills.soft' | 'skills.tools') => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;

      if (listName.startsWith('skills.')) {
        const skillType = listName.split('.')[1] as keyof AboutPageContent['skills'];
        if (!newContent.skills) newContent.skills = { technical: [], soft: [], tools: [] };
        const skillsList = newContent.skills[skillType] || [];
        skillsList.push('New Skill');
        newContent.skills[skillType] = skillsList;
      } else if (listName === 'experiences') {
        const newItem = { id: Date.now(), company: '', positions: [] };
        newContent.experiences = [...(newContent.experiences || []), newItem];
      } else if (listName === 'educations') {
        const newItem = { id: Date.now(), degree: '', university: '' };
        newContent.educations = [...(newContent.educations || []), newItem];
      }

      return newContent;
    });
  };

  const addPosition = (experienceId: number) => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;

      const experienceIndex = newContent.experiences?.findIndex((exp) => exp.id === experienceId) ?? -1;
      if (experienceIndex > -1) {
        const newPosition = { id: Date.now(), role: '', period: '', points: '' };
        if (!newContent.experiences[experienceIndex].positions) {
          newContent.experiences[experienceIndex].positions = [];
        }
        newContent.experiences[experienceIndex].positions.push(newPosition);
      }

      return newContent;
    });
  };

  const removePosition = (experienceId: number, positionId: number) => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;

      const experienceIndex = newContent.experiences?.findIndex((exp) => exp.id === experienceId) ?? -1;
      if (experienceIndex > -1 && newContent.experiences[experienceIndex].positions) {
        newContent.experiences[experienceIndex].positions =
          newContent.experiences[experienceIndex].positions.filter((pos) => pos.id !== positionId);
      }

      return newContent;
    });
  };

  const removeListItem = (listName: 'experiences' | 'educations' | 'skills.technical' | 'skills.soft' | 'skills.tools', indexOrId: number) => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;
      
      if (listName.startsWith('skills.')) {
        const skillType = listName.split('.')[1] as keyof AboutPageContent['skills'];
        if (newContent.skills && newContent.skills[skillType]) {
          (newContent.skills[skillType] as string[]).splice(indexOrId, 1);
        }
      } else if (listName === 'experiences' && newContent.experiences) {
        newContent.experiences = newContent.experiences.filter((item) => item.id !== indexOrId);
      } else if (listName === 'educations' && newContent.educations) {
        newContent.educations = newContent.educations.filter((item) => item.id !== indexOrId);
      }

      return newContent;
    });
  };

  const handleListItemChange = (listName: 'experiences' | 'educations' | 'skills.technical' | 'skills.soft' | 'skills.tools', indexOrId: number, value: string, field?: keyof Experience | keyof Education) => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;

      if (listName.startsWith('skills.')) {
        const skillType = listName.split('.')[1] as keyof AboutPageContent['skills'];
        if (newContent.skills && newContent.skills[skillType]) {
          (newContent.skills[skillType] as string[])[indexOrId] = value;
        }
      } else if ((listName === 'experiences' || listName === 'educations') && field) {
        const list = newContent[listName] as any[];
        if (list) {
            const itemIndex = list.findIndex((item) => item.id === indexOrId);
            if (itemIndex > -1) {
              list[itemIndex][field] = value;
            }
        }
      }

      return newContent;
    });
  };

  const handlePositionChange = (experienceId: number, positionId: number, value: string, field: keyof Position) => {
    setContent((prev: PageContent | null) => {
      if (!prev || typeof prev === 'string') return prev;
      const newContent = JSON.parse(JSON.stringify(prev)) as AboutPageContent;

      const experienceIndex = newContent.experiences?.findIndex((exp) => exp.id === experienceId) ?? -1;
      if (experienceIndex > -1 && newContent.experiences[experienceIndex].positions) {
        const positionIndex = newContent.experiences[experienceIndex].positions.findIndex((pos) => pos.id === positionId);
        if (positionIndex > -1) {
          (newContent.experiences[experienceIndex].positions[positionIndex] as any)[field] = value;
        }
      }

      return newContent;
    });
  };

  const handleProjectSelection = (projectId: number) => {
    setContent((prev: PageContent | null) => {
      if (prev && typeof prev === 'object' && 'work' in prev && prev.work) {
        const selected = prev.work.selectedProjects || [];
        const newSelection = selected.includes(projectId)
          ? selected.filter((id) => id !== projectId)
          : [...selected, projectId];
        
        return { 
          ...prev, 
          work: { 
            ...prev.work, 
            selectedProjects: newSelection 
          } 
        };
      }
      return prev;
    });
  };

  const renderForm = () => {
    console.log("Rendering form with content:", content);

    if (typeof content !== 'object' || content === null) return <p className="text-muted-foreground">Loading form...</p>;

    if (slug === 'home' && 'hero' in content) {
      const homeContent = content;
      return (
        <div className="space-y-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page Title (internal use)"
          />
          
          {/* ⭐ UPDATED HERO SECTION WITH H1 FIELD */}
          <div className="p-4 border rounded-lg space-y-3 bg-muted">
            <h3 className="font-semibold text-foreground">Hero Section</h3>
            
            {/* ⭐ NEW: H1 Input Field */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Main Heading (H1)
              </label>
              <Input 
                value={homeContent.hero?.h1 || ''} 
                onChange={(e) => handleContentChange('hero.h1', e.target.value)} 
                placeholder="Your Name or Main Heading" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the main heading displayed prominently on your homepage
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Availability Status
              </label>
              <Input 
                value={homeContent.hero?.availability || ''} 
                onChange={(e) => handleContentChange('hero.availability', e.target.value)} 
                placeholder="e.g., Open to collaborations" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Headline
              </label>
              <Textarea 
                value={homeContent.hero?.headline || ''} 
                onChange={(e) => handleContentChange('hero.headline', e.target.value)} 
                placeholder="Your professional tagline or description" 
                className="min-h-[100px]" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Skills (comma-separated)
              </label>
              <Textarea 
                value={homeContent.hero?.skills || ''} 
                onChange={(e) => handleContentChange('hero.skills', e.target.value)} 
                placeholder="B2B Marketing, UX Writing, AI Video Production" 
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3 bg-muted">
            <h3 className="font-semibold text-foreground">Snapshot Card</h3>
            <Input 
              value={homeContent.snapshot?.role || ''} 
              onChange={(e) => handleContentChange('snapshot.role', e.target.value)} 
              placeholder="Role" 
            />
            <Input 
              value={homeContent.snapshot?.location || ''} 
              onChange={(e) => handleContentChange('snapshot.location', e.target.value)} 
              placeholder="Location" 
            />
            <Input 
              value={homeContent.snapshot?.focus || ''} 
              onChange={(e) => handleContentChange('snapshot.focus', e.target.value)} 
              placeholder="Focus" 
            />
            <h4 className="font-medium text-sm pt-2 text-foreground">Social Links</h4>
            <Input 
              value={homeContent.snapshot?.socials?.instagram || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.instagram', e.target.value)} 
              placeholder="Instagram URL" 
            />
            <Input 
              value={homeContent.snapshot?.socials?.linkedin || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.linkedin', e.target.value)} 
              placeholder="LinkedIn URL" 
            />
            <Input 
              value={homeContent.snapshot?.socials?.email || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.email', e.target.value)} 
              placeholder="Email URL (mailto:...)" 
            />
          </div>
          <div className="p-4 border rounded-lg space-y-3 bg-muted">
            <h3 className="font-semibold text-foreground">Selected Work Section</h3>
            <Input 
              value={homeContent.work?.title || ''} 
              onChange={(e) => handleContentChange('work.title', e.target.value)} 
              placeholder="Section Title" 
            />
            <Input 
              value={homeContent.work?.subtitle || ''} 
              onChange={(e) => handleContentChange('work.subtitle', e.target.value)} 
              placeholder="Section Subtitle" 
            />
            <h4 className="font-medium text-sm pt-2 text-foreground">Featured Projects</h4>
            <div className="space-y-2">
              {allProjects.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox id={`project-${project.id}`} checked={homeContent.work?.selectedProjects?.includes(project.id)} onCheckedChange={() => handleProjectSelection(project.id)}/>
                  <label htmlFor={`project-${project.id}`} className="text-sm font-medium text-foreground">{project.title}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (slug === 'about' && 'summary' in content) {
      const aboutContent = content;
      return (
        <div className="space-y-6">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Page Title (e.g., About Me)" 
          />
          <div className="p-4 border rounded-lg space-y-3 bg-muted">
            <h3 className="font-semibold text-foreground">Summary</h3>
            <Textarea 
              value={aboutContent.summary || ''} 
              onChange={(e) => handleContentChange('summary', e.target.value)} 
              placeholder="Summary..." 
              className="min-h-[120px]" 
            />
          </div>
          <div className="p-4 border rounded-lg space-y-4 bg-muted">
            <h3 className="font-semibold text-foreground">Work Experience (Grouped by Company)</h3>
            {(aboutContent.experiences || []).map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-md relative space-y-3 bg-background">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeListItem('experiences', exp.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                <h4 className="font-semibold text-lg text-foreground">Company #{index + 1}</h4>
                <Input
                  value={exp.company}
                  onChange={(e) => handleListItemChange('experiences', exp.id, e.target.value, 'company')}
                  placeholder="Company Name"
                  />

                <div className="mt-3 space-y-3">
                  <h5 className="font-medium text-sm text-foreground">Positions at this company:</h5>
                  {(exp.positions || []).map((position, posIndex) => (
                    <div key={position.id} className="p-3 ml-4 border-l-2 border-border space-y-2 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6"
                        onClick={() => removePosition(exp.id, position.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                      <p className="text-xs text-muted-foreground">Position #{posIndex + 1}</p>
                      <Input
                        value={position.role}
                        onChange={(e) => handlePositionChange(exp.id, position.id, e.target.value, 'role')}
                        placeholder="Job Title / Role"
                              />
                      <Input
                        value={position.period}
                        onChange={(e) => handlePositionChange(exp.id, position.id, e.target.value, 'period')}
                        placeholder="Time Period (e.g., Jan 2020 - Dec 2021)"
                              />
                      <Textarea
                        value={position.points}
                        onChange={(e) => handlePositionChange(exp.id, position.id, e.target.value, 'points')}
                        placeholder="Key responsibilities and achievements (one per line)..."
                        className="min-h-[80px]"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => addPosition(exp.id)}
                  >
                    <PlusCircle className="h-3 w-3 mr-2" /> Add Position to {exp.company || 'this company'}
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addListItem('experiences')}><PlusCircle className="h-4 w-4 mr-2" /> Add Company</Button>
          </div>
          <div className="p-4 border rounded-lg space-y-4 bg-muted">
            <h3 className="font-semibold text-foreground">Skills</h3>
            {['technical', 'soft', 'tools'].map(skillType => (
                <div key={skillType}>
                  <h4 className="font-medium capitalize text-foreground">{skillType} Skills</h4>
                  {(aboutContent.skills?.[skillType as keyof typeof aboutContent.skills] || []).map((skill: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 mt-2">
                          <Input 
                            value={skill} 
                            onChange={(e) => handleListItemChange(`skills.${skillType}` as any, index, e.target.value)} 
                            placeholder={`New ${skillType} skill...`} 
                                      />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(`skills.${skillType}` as any, index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addListItem(`skills.${skillType}` as any)}><PlusCircle className="h-4 w-4 mr-2" /> Add {skillType} skill</Button>
                </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg space-y-4 bg-muted">
            <h3 className="font-semibold text-foreground">Education</h3>
            {(aboutContent.educations || []).map((edu, index) => (
              <div key={edu.id} className="p-3 border rounded-md relative space-y-2 bg-background">
                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeListItem('educations', edu.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                <h4 className="font-medium text-foreground">Education #{index + 1}</h4>
                <Input 
                  value={edu.degree} 
                  onChange={(e) => handleListItemChange('educations', edu.id, e.target.value, 'degree')} 
                  placeholder="Degree" 
                  />
                <Input 
                  value={edu.university} 
                  onChange={(e) => handleListItemChange('educations', edu.id, e.target.value, 'university')} 
                  placeholder="University & Period" 
                  />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addListItem('educations')}><PlusCircle className="h-4 w-4 mr-2" /> Add Education</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Page Title" 
        />
        <Textarea 
          value={typeof content === 'string' ? content : ''} 
          onChange={(e) => setContent(e.target.value)} 
          className="min-h-[400px]" 
          placeholder="Page content (Markdown)..." 
        />
      </div>
    );
  };
  
  if (isLoading || content === null) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-muted-foreground">Loading page content...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-8">
            <Link href="/admin" className="inline-block mb-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold capitalize text-foreground">Edit {slug} Page</h1>
          </header>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                {renderForm()}
                <Button type="submit" className="mt-6">Save Changes</Button>
              </form>
              {message && <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{message}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
