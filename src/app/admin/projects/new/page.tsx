"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, LogOut, X } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeToggle } from "@/components/theme-toggle";

interface ContentSection {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  image: File | null;
  imageUrl?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [blurb, setBlurb] = useState("");
  const [tags, setTags] = useState("");
  
  // ACTION: Add state for the thumbnail image
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [outcome, setOutcome] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    await fetch('/api/logout', { 
      method: 'POST',
      credentials: 'include' 
    });
    router.push('/admin/login');
  };

  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "", subtitle: "", body: "", image: null }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSectionChange = (id: number, field: keyof Omit<ContentSection, 'id' | 'imageUrl'>, value: string | File | null) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (!uploadResponse.ok) throw new Error('Image upload failed');
    const uploadResult = await uploadResponse.json();
    return uploadResult.paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail) {
        setMessage("Error: Please upload a thumbnail image.");
        return;
    }
    setIsSubmitting(true);
    setMessage("Processing...");
    try {
      // ACTION: Upload thumbnail, banner, and section images
      const [thumbnailUrl] = await uploadImages([thumbnail]);
      const bannerImageUrls = await uploadImages(bannerImages);
      const finalSectionsData = await Promise.all(
        sections.map(async (section) => {
          let imageUrl = '';
          if (section.image) {
            imageUrl = (await uploadImages([section.image]))[0];
          }
          return {
            title: section.title,
            subtitle: section.subtitle,
            body: section.body,
            imageUrl: imageUrl,
          };
        })
      );

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const newProject = {
        slug, title, year, blurb, tags: tagsArray,
        thumbnail: thumbnailUrl, // ACTION: Add thumbnail URL to the project data
        images: bannerImageUrls,
        outcome,
        challenge,
        solution,
        content: finalSectionsData,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
        credentials: 'include'
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to create project');
      
      setMessage("Success! Project created. Redirecting...");
      setTimeout(() => router.push('/admin/projects'), 1500);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Create New Project</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Link href="/admin/projects" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
              ← Back to All Projects
            </Link>
          </header>
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Basic Information</h3>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Title</label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g., Ronix DE Homepage Redesign" 
                      required 
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Slug</label>
                    <Input 
                      id="slug" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      placeholder="e.g., ronix-de-redesign" 
                      required 
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                    <Input 
                      id="year" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)} 
                      placeholder="e.g., 2025" 
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="blurb" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Blurb</label>
                    <Textarea 
                      id="blurb" 
                      value={blurb} 
                      onChange={(e) => setBlurb(e.target.value)} 
                      placeholder="A brief description for project cards..." 
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                    <Input 
                      id="tags" 
                      value={tags} 
                      onChange={(e) => setTags(e.target.value)} 
                      placeholder="e.g., UX Design, Web Dev, AI" 
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* ACTION: New Thumbnail Section */}
                <div className="space-y-2 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <label className="block text-lg font-semibold text-slate-900 dark:text-slate-100">Thumbnail Image</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">This image will be shown on project listing pages. (Required)</p>
                    {thumbnail && (
                        <div className="relative w-full max-w-xs">
                            <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail preview" className="rounded-md w-full h-auto" />
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => setThumbnail(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <Input 
                        type="file" 
                        onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)} 
                        required
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                </div>

                <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Key Project Details</h3>
                  <Textarea 
                    value={outcome} 
                    onChange={(e) => setOutcome(e.target.value)} 
                    placeholder="Key Outcome..." 
                    className="min-h-[100px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                  />
                  <Textarea 
                    value={challenge} 
                    onChange={(e) => setChallenge(e.target.value)} 
                    placeholder="The Challenge..." 
                    className="min-h-[120px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                  />
                  <Textarea 
                    value={solution} 
                    onChange={(e) => setSolution(e.target.value)} 
                    placeholder="The Solution..." 
                    className="min-h-[120px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                  />
                </div>

                <div className="space-y-2 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <label className="block text-lg font-semibold text-slate-900 dark:text-slate-100">Project Page Banner (Carousel)</label>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={(e) => setBannerImages(Array.from(e.target.files || []))} 
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>
                
                <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Additional Content Sections</h3>
                  {sections.map((section, index) => (
                    <div key={section.id} className="p-4 border border-slate-300 dark:border-slate-500 rounded-md relative space-y-3 bg-white dark:bg-slate-800">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Section {index + 1}</h4>
                      <Input 
                        value={section.title} 
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)} 
                        placeholder="Section Title (e.g., Process)" 
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <Input 
                        value={section.subtitle} 
                        onChange={(e) => handleSectionChange(section.id, 'subtitle', e.target.value)} 
                        placeholder="Section Subtitle (optional)" 
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <Textarea 
                        value={section.body} 
                        onChange={(e) => handleSectionChange(section.id, 'body', e.target.value)} 
                        placeholder="Section body text..." 
                        className="min-h-[120px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                      />
                      <Input 
                        type="file" 
                        onChange={(e) => handleSectionChange(section.id, 'image', e.target.files ? e.target.files[0] : null)} 
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSection}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Dynamic Section
                  </Button>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Project...' : 'Create Project'}
                </Button>
              </form>
              {message && <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{message}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
