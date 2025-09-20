"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { LogOut, PlusCircle, Trash2 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";

// --- TYPE DEFINITIONS ---
interface Project { id: number; title: string; }
interface Experience { id: number; role: string; company: string; period: string; points: string; }
interface Education { id: number; degree: string; university: string; }

interface HomePageContent {
  hero: { availability: string; headline: string; skills: string; };
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

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

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
        const newItem = { id: Date.now(), role: '', company: '', period: '', points: '' };
        newContent.experiences = [...(newContent.experiences || []), newItem];
      } else if (listName === 'educations') {
        const newItem = { id: Date.now(), degree: '', university: '' };
        newContent.educations = [...(newContent.educations || []), newItem];
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
    // ✅ ADDED THIS LINE FOR DEBUGGING
    console.log("Rendering form with content:", content);

    if (typeof content !== 'object' || content === null) return <p className="text-slate-600 dark:text-slate-400">Loading form...</p>;

    if (slug === 'home' && 'hero' in content) {
      const homeContent = content;
      return (
        <div className="space-y-6">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Page Title (internal use)" 
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hero Section</h3>
            <Input 
              value={homeContent.hero?.availability || ''} 
              onChange={(e) => handleContentChange('hero.availability', e.target.value)} 
              placeholder="Availability Status" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Textarea 
              value={homeContent.hero?.headline || ''} 
              onChange={(e) => handleContentChange('hero.headline', e.target.value)} 
              placeholder="Headline" 
              className="min-h-[100px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
            />
            <Textarea 
              value={homeContent.hero?.skills || ''} 
              onChange={(e) => handleContentChange('hero.skills', e.target.value)} 
              placeholder="Skills (comma-separated)" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Snapshot Card</h3>
            <Input 
              value={homeContent.snapshot?.role || ''} 
              onChange={(e) => handleContentChange('snapshot.role', e.target.value)} 
              placeholder="Role" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input 
              value={homeContent.snapshot?.location || ''} 
              onChange={(e) => handleContentChange('snapshot.location', e.target.value)} 
              placeholder="Location" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input 
              value={homeContent.snapshot?.focus || ''} 
              onChange={(e) => handleContentChange('snapshot.focus', e.target.value)} 
              placeholder="Focus" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <h4 className="font-medium text-sm pt-2 text-slate-700 dark:text-slate-300">Social Links</h4>
            <Input 
              value={homeContent.snapshot?.socials?.instagram || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.instagram', e.target.value)} 
              placeholder="Instagram URL" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input 
              value={homeContent.snapshot?.socials?.linkedin || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.linkedin', e.target.value)} 
              placeholder="LinkedIn URL" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input 
              value={homeContent.snapshot?.socials?.email || ''} 
              onChange={(e) => handleContentChange('snapshot.socials.email', e.target.value)} 
              placeholder="Email URL (mailto:...)" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Selected Work Section</h3>
            <Input 
              value={homeContent.work?.title || ''} 
              onChange={(e) => handleContentChange('work.title', e.target.value)} 
              placeholder="Section Title" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input 
              value={homeContent.work?.subtitle || ''} 
              onChange={(e) => handleContentChange('work.subtitle', e.target.value)} 
              placeholder="Section Subtitle" 
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <h4 className="font-medium text-sm pt-2 text-slate-700 dark:text-slate-300">Featured Projects</h4>
            <div className="space-y-2">
              {allProjects.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox id={`project-${project.id}`} checked={homeContent.work?.selectedProjects?.includes(project.id)} onCheckedChange={() => handleProjectSelection(project.id)}/>
                  <label htmlFor={`project-${project.id}`} className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.title}</label>
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
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Summary</h3>
            <Textarea 
              value={aboutContent.summary || ''} 
              onChange={(e) => handleContentChange('summary', e.target.value)} 
              placeholder="Summary..." 
              className="min-h-[120px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
            />
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Work Experience</h3>
            {aboutContent.experiences?.map((exp, index) => (
              <div key={exp.id} className="p-3 border border-slate-300 dark:border-slate-500 rounded-md relative space-y-2 bg-white dark:bg-slate-800">
                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeListItem('experiences', exp.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Experience #{index + 1}</h4>
                <Input 
                  value={exp.role} 
                  onChange={(e) => handleListItemChange('experiences', exp.id, e.target.value, 'role')} 
                  placeholder="Role" 
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Input 
                  value={exp.company} 
                  onChange={(e) => handleListItemChange('experiences', exp.id, e.target.value, 'company')} 
                  placeholder="Company" 
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Input 
                  value={exp.period} 
                  onChange={(e) => handleListItemChange('experiences', exp.id, e.target.value, 'period')} 
                  placeholder="Period" 
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Textarea 
                  value={exp.points} 
                  onChange={(e) => handleListItemChange('experiences', exp.id, e.target.value, 'points')} 
                  placeholder="Key points (one per line)..." 
                  className="min-h-[100px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addListItem('experiences')}><PlusCircle className="h-4 w-4 mr-2" /> Add Experience</Button>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
            {['technical', 'soft', 'tools'].map(skillType => (
                <div key={skillType}>
                  <h4 className="font-medium capitalize text-slate-900 dark:text-slate-100">{skillType} Skills</h4>
                  {(aboutContent.skills?.[skillType as keyof typeof aboutContent.skills] || []).map((skill: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 mt-2">
                          <Input 
                            value={skill} 
                            onChange={(e) => handleListItemChange(`skills.${skillType}` as any, index, e.target.value)} 
                            placeholder={`New ${skillType} skill...`} 
                            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(`skills.${skillType}` as any, index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addListItem(`skills.${skillType}` as any)}><PlusCircle className="h-4 w-4 mr-2" /> Add {skillType} skill</Button>
                </div>
            ))}
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Education</h3>
            {aboutContent.educations?.map((edu, index) => (
              <div key={edu.id} className="p-3 border border-slate-300 dark:border-slate-500 rounded-md relative space-y-2 bg-white dark:bg-slate-800">
                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeListItem('educations', edu.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Education #{index + 1}</h4>
                <Input 
                  value={edu.degree} 
                  onChange={(e) => handleListItemChange('educations', edu.id, e.target.value, 'degree')} 
                  placeholder="Degree" 
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <Input 
                  value={edu.university} 
                  onChange={(e) => handleListItemChange('educations', edu.id, e.target.value, 'university')} 
                  placeholder="University & Period" 
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
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
          className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <Textarea 
          value={typeof content === 'string' ? content : ''} 
          onChange={(e) => setContent(e.target.value)} 
          className="min-h-[400px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
          placeholder="Page content (Markdown)..." 
        />
      </div>
    );
  };
  
  if (isLoading || content === null) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-slate-600 dark:text-slate-400">Loading page content...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold capitalize text-slate-900 dark:text-slate-100">Edit {slug} Page</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout"><LogOut className="h-4 w-4" /></Button>
              </div>
            </div>
            <Link href="/admin/pages" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">← Back to All Pages</Link>
          </header>
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
