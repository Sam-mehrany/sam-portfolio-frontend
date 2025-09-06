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
            setContent(data.content);
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
  
  // ✅ CORRECTED DYNAMIC LIST HANDLERS
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

  // --- RENDER LOGIC ---
  const renderForm = () => {
    if (typeof content !== 'object' || content === null) return <p>Loading form...</p>;

    if (slug === 'home' && 'hero' in content) {
      const homeContent = content;
      return (
        <div className="space-y-6">
          {/* ... existing home form ... */}
        </div>
      );
    }
    
    if (slug === 'about' && 'summary' in content) {
      const aboutContent = content;
      return (
        <div className="space-y-6">
         {/* ... existing about form ... */}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page Title" />
        <Textarea value={typeof content === 'string' ? content : ''} onChange={(e) => setContent(e.target.value)} className="min-h-[400px]" placeholder="Page content (Markdown)..." />
      </div>
    );
  };
  
  if (isLoading || content === null) {
    return <AuthGuard><div className="text-center py-24">Loading page content...</div></AuthGuard>;
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold capitalize">Edit {slug} Page</h1>
              <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout"><LogOut className="h-4 w-4" /></Button>
            </div>
            <Link href="/admin/pages" className="text-sm text-blue-500 hover:underline">← Back to All Pages</Link>
          </header>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                {renderForm()}
                <Button type="submit" className="mt-6">Save Changes</Button>
              </form>
              {message && <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
