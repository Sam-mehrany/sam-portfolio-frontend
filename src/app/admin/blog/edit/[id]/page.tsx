"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Trash2, X, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

// Backend URL for direct image access
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Define the structure for a content section from the API
interface APIContentSection {
  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
}

// Define the full structure for our state
interface ContentSection extends APIContentSection {
  id: number;
  image: File | null;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all existing posts to get their tags
  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const posts = await response.json();
          const tagSet = new Set<string>();
          posts.forEach((post: any) => {
            (post.tags || []).forEach((tag: string) => tagSet.add(tag));
          });
          setExistingTags(Array.from(tagSet).sort());
        }
      } catch (error) {
        console.error('Failed to fetch existing tags:', error);
      }
    };
    fetchExistingTags();
  }, []);

  const addTagFromSuggestion = (tag: string) => {
    const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTags(currentTags.length > 0 ? `${tags}, ${tag}` : tag);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/${id}`, { credentials: 'include' });
          if (!response.ok) throw new Error("Failed to fetch post data.");
          
          const data = await response.json();
          setTitle(data.title);
          setSlug(data.slug);
          setExcerpt(data.excerpt || "");
          setTags((data.tags || []).join(', '));
          setDate(data.date);
          // Fixed: Mapped the API data to our state structure
          setSections((data.content || []).map((item: APIContentSection, index: number) => ({
            ...item,
            id: Date.now() + index,
            image: null
          })));

        } catch (error: unknown) {
          console.error(error);
          if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
          } else {
            setMessage("Error: An unknown error occurred.");
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "", subtitle: "", body: "", image: null, imageUrl: "" }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSectionChange = (id: number, field: keyof Omit<ContentSection, 'id'>, value: string | File | null) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const handleRemoveImage = (id: number) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, imageUrl: '', image: null } : section
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
    return (await uploadResponse.json()).paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Processing...");

    try {
      const finalSectionsData = await Promise.all(
        sections.map(async (section) => {
          let finalImageUrl = section.imageUrl || '';
          if (section.image instanceof File) {
            finalImageUrl = (await uploadImages([section.image]))[0];
          }
          return {
            title: section.title,
            subtitle: section.subtitle,
            body: section.body,
            imageUrl: finalImageUrl,
          };
        })
      );

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const updatedPost = {
        title, slug, excerpt, tags: tagsArray,
        content: finalSectionsData,
        date 
      };

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
        credentials: 'include'
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update post.');
      
      setMessage("Success! Post updated. Redirecting...");
      setTimeout(() => router.push('/admin/blog'), 1500);

    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-muted-foreground">Loading post...</p>
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
            <h1 className="text-4xl font-bold text-foreground">Edit Post</h1>
          </header>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4 p-4 border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Post Details</h3>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground">Post Title</label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-foreground">URL Slug</label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-foreground">Excerpt</label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="tags" className="block text-sm font-medium text-foreground">Tags</label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Design, Technology, AI (comma separated)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate tags with commas. Click suggested tags below to reuse existing ones.
                    </p>

                    {/* Existing Tags Suggestions */}
                    {existingTags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-foreground mb-2">Existing tags (click to add):</p>
                        <div className="flex flex-wrap gap-2">
                          {existingTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => addTagFromSuggestion(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-foreground">Date</label>
                    <Input
                      id="date"
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4 bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Post Content</h3>
                  {sections.map((section, index) => (
                    <div key={section.id} className="p-4 border rounded-md relative space-y-3 bg-background">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <h4 className="font-medium text-foreground">Section {index + 1}</h4>
                      <Input 
                        value={section.title} 
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)} 
                        placeholder="Section Title (optional)" 
                        />
                      <Input 
                        value={section.subtitle} 
                        onChange={(e) => handleSectionChange(section.id, 'subtitle', e.target.value)} 
                        placeholder="Section Subtitle (optional)" 
                        />
                      <Textarea
                        value={section.body}
                        onChange={(e) => handleSectionChange(section.id, 'body', e.target.value)}
                        placeholder="Section body text..."
                        className="min-h-[120px]"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Image</label>
                        <div className="relative w-full max-w-xs">
                          {section.image ? (
                            <img src={URL.createObjectURL(section.image)} alt="New preview" className="rounded-md w-full h-auto" />
                          ) : section.imageUrl ? (
                            <img 
                              src={section.imageUrl.startsWith('http') ? section.imageUrl : `${backendUrl}${section.imageUrl}`} 
                              alt="Current image" 
                              className="rounded-md w-full h-auto"
                              onError={(e) => {
                                console.error('Section image failed to load:', section.imageUrl);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                              onLoad={() => {
                                console.log('Section image loaded successfully:', section.imageUrl);
                              }}
                            />
                          ) : null}
                          
                          <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted absolute inset-0 rounded-md">
                            Failed to Load
                          </div>
                          
                          {(section.imageUrl || section.image) && (
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveImage(section.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input 
                          type="file" 
                          onChange={(e) => handleSectionChange(section.id, 'image', e.target.files ? e.target.files[0] : null)} 
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSection}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
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
