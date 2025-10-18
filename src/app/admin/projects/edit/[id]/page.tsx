"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { PlusCircle, Trash2, X, ChevronUp, ChevronDown, GripVertical, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define the structure for a content section from the API
interface APIContentSection {
  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  videoFullWidth?: boolean;
}

// Define the full structure for our state
interface ContentSection extends APIContentSection {
  id: number;
  image: File | null;
  video: File | null;
  videoFullWidth: boolean;
}

interface SortableExistingBannerMediaProps {
  mediaUrl: string;
  index: number;
  backendUrl: string;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableExistingBannerMedia({ mediaUrl, index, backendUrl, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: SortableExistingBannerMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `existing-banner-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fullMediaUrl = mediaUrl.startsWith('http') ? mediaUrl : `${backendUrl}${mediaUrl}`;
  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(mediaUrl);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isVideo ? (
        <video
          src={fullMediaUrl}
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-border"
          onError={(e) => {
            console.error('Banner video failed to load:', fullMediaUrl);
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
          controls
        />
      ) : (
        <img
          src={fullMediaUrl}
          alt={`Banner ${index + 1}`}
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-border"
          onError={(e) => {
            console.error('Banner image failed to load:', fullMediaUrl);
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      )}
      <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary absolute inset-0 rounded-md">
        Failed to Load
      </div>
      <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <div className="bg-card/90 p-1 rounded hover:bg-card">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-card/90 hover:bg-card"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-card/90 hover:bg-card"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        #{index + 1}
      </div>
    </div>
  );
}

interface SortableNewBannerMediaProps {
  file: File;
  index: number;
  totalExisting: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableNewBannerMedia({ file, index, totalExisting, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: SortableNewBannerMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `new-banner-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isVideo = file.type.startsWith('video/');

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isVideo ? (
        <video
          src={URL.createObjectURL(file)}
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-primary"
          controls
        />
      ) : (
        <img
          src={URL.createObjectURL(file)}
          alt={`New Banner ${index + 1}`}
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-primary"
        />
      )}
      <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <div className="bg-card/90 p-1 rounded hover:bg-card">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-card/90 hover:bg-card"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 bg-card/90 hover:bg-card"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
        New #{totalExisting + index + 1}
      </div>
    </div>
  );
}

export default function AdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // State for project details
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [blurb, setBlurb] = useState("");
  const [tags, setTags] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // ACTION: Add state for thumbnail management
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);

  const [outcome, setOutcome] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [existingBannerMedia, setExistingBannerMedia] = useState<string[]>([]);
  const [newBannerMedia, setNewBannerMedia] = useState<File[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all existing projects to get their tags
  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const projects = await response.json();
          const tagSet = new Set<string>();
          projects.forEach((project: any) => {
            (project.tags || []).forEach((tag: string) => tagSet.add(tag));
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

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Backend URL for direct image access
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/${id}`, { credentials: 'include' });
          if (!response.ok) {
            if (response.status === 401) router.push('/admin/login');
            throw new Error('Project not found');
          }
          const data = await response.json();
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setYear(data.year || "");
          setBlurb(data.blurb || "");
          setTags((data.tags || []).join(', '));
          setOutcome(data.outcome || "");
          setChallenge(data.challenge || "");
          setSolution(data.solution || "");
          setExistingBannerMedia(data.images || []);
          // ACTION: Set the existing thumbnail from fetched data
          setExistingThumbnail(data.thumbnail || null);
          setSections(
            (data.content || []).map((item: APIContentSection) => ({
              ...item, id: Date.now() + Math.random(), image: null, video: null, videoFullWidth: false
            }))
          );
        } catch (error: unknown) { // FIX: Replace `any` with `unknown`
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage("An unknown error occurred.");
            }
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, router]);

  // --- Section Management Handlers ---
  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "", subtitle: "", body: "", image: null, video: null, imageUrl: '', videoFullWidth: false }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSectionChange = (id: number, field: keyof Omit<ContentSection, 'id'>, value: string | File | null | boolean) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const handleRemoveImage = (id: number) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, imageUrl: '', image: null } : section
    ));
  };

  const handleRemoveVideo = (id: number) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, videoUrl: '', video: null } : section
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
      // ACTION: Handle thumbnail upload logic
      let finalThumbnailUrl = existingThumbnail;
      if (newThumbnail) {
        const [uploadedUrl] = await uploadImages([newThumbnail]);
        finalThumbnailUrl = uploadedUrl;
      }

      const newBannerMediaUrls = await uploadImages(newBannerMedia);
      const finalBannerUrls = [...existingBannerMedia, ...newBannerMediaUrls];

      const finalSectionsData = await Promise.all(
        sections.map(async (section) => {
          let finalImageUrl = section.imageUrl || '';
          if (section.image instanceof File) {
            finalImageUrl = (await uploadImages([section.image]))[0];
          }
          let finalVideoUrl = section.videoUrl || '';
          if (section.video instanceof File) {
            finalVideoUrl = (await uploadImages([section.video]))[0];
          }
          return {
            title: section.title,
            subtitle: section.subtitle,
            body: section.body,
            imageUrl: finalImageUrl,
            videoUrl: finalVideoUrl,
            videoFullWidth: section.videoFullWidth || false,
          };
        })
      );
      
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const updatedProject = {
        slug, title, year, blurb, tags: tagsArray,
        thumbnail: finalThumbnailUrl, // ACTION: Add final thumbnail URL
        images: finalBannerUrls,
        videos: [],
        outcome,
        challenge,
        solution,
        content: finalSectionsData,
      };

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update project');
      
      setMessage("Success! Project updated. Redirecting...");
      setTimeout(() => router.push('/admin/projects'), 1500);

    } catch (error: unknown) { // FIX: Replace `any` with `unknown`
        if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("An unknown error occurred.");
        }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveExistingBannerMedia = (mediaUrl: string) => {
    setExistingBannerMedia(existingBannerMedia.filter(media => media !== mediaUrl));
  };

  const moveExistingBannerMediaUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...existingBannerMedia];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    setExistingBannerMedia(newMedia);
  };

  const moveExistingBannerMediaDown = (index: number) => {
    if (index === existingBannerMedia.length - 1) return;
    const newMedia = [...existingBannerMedia];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    setExistingBannerMedia(newMedia);
  };

  const removeNewBannerMedia = (index: number) => {
    setNewBannerMedia(newBannerMedia.filter((_, i) => i !== index));
  };

  const moveNewBannerMediaUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...newBannerMedia];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    setNewBannerMedia(newMedia);
  };

  const moveNewBannerMediaDown = (index: number) => {
    if (index === newBannerMedia.length - 1) return;
    const newMedia = [...newBannerMedia];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    setNewBannerMedia(newMedia);
  };

  const handleExistingBannerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('existing-banner-', ''));
      const newIndex = parseInt(over.id.toString().replace('existing-banner-', ''));

      setExistingBannerMedia((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleNewBannerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('new-banner-', ''));
      const newIndex = parseInt(over.id.toString().replace('new-banner-', ''));

      setNewBannerMedia((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-muted-foreground">Loading project...</p>
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
            <Link href="/admin/projects" className="inline-block mb-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Manage Projects
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Edit Project</h1>
          </header>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Basic Information</h3>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Project Title" 
                    required 
                    className=""
                  />
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="URL Slug" 
                    required 
                    className=""
                  />
                  <Input 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    placeholder="Year" 
                    className=""
                  />
                  <Textarea 
                    value={blurb} 
                    onChange={(e) => setBlurb(e.target.value)} 
                    placeholder="Blurb (short summary)" 
                    className=""
                  />
                  <div className="space-y-2">
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className=""
                    />
                    <p className="text-xs text-muted-foreground">
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
                </div>

                {/* ACTION: New Thumbnail Section */}
                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted">
                  <label className="block text-lg font-semibold text-foreground">Thumbnail Image</label>
                  <p className="text-xs text-muted-foreground">This image will be shown on project listing pages.</p>
                  <div className="relative w-full max-w-xs">
                    {newThumbnail ? (
                      <img src={URL.createObjectURL(newThumbnail)} alt="New thumbnail preview" className="rounded-md w-full h-auto" />
                    ) : existingThumbnail ? (
                      <img 
                        src={existingThumbnail.startsWith('http') ? existingThumbnail : `${backendUrl}${existingThumbnail}`} 
                        alt="Current thumbnail" 
                        className="rounded-md w-full h-auto"
                        onError={(e) => {
                          console.error('Thumbnail failed to load:', existingThumbnail);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        onLoad={() => {
                          console.log('Thumbnail loaded successfully:', existingThumbnail);
                        }}
                      />
                    ) : null}
                    
                    <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary absolute inset-0 rounded-md">
                      Failed to Load
                    </div>
                    
                    {(newThumbnail || existingThumbnail) && (
                      <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => { setNewThumbnail(null); setExistingThumbnail(null); }}
                      >
                          <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input 
                      type="file" 
                      onChange={(e) => setNewThumbnail(e.target.files ? e.target.files[0] : null)} 
                      className=""
                  />
                </div>
                
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Key Project Details</h3>
                  <Textarea 
                    value={outcome} 
                    onChange={(e) => setOutcome(e.target.value)} 
                    placeholder="Key Outcome..." 
                    className="min-h-[100px] " 
                  />
                  <Textarea 
                    value={challenge} 
                    onChange={(e) => setChallenge(e.target.value)} 
                    placeholder="The Challenge..." 
                    className="min-h-[120px] " 
                  />
                  <Textarea 
                    value={solution} 
                    onChange={(e) => setSolution(e.target.value)} 
                    placeholder="The Solution..." 
                    className="min-h-[120px] " 
                  />
                </div>

                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted">
                  <label className="block text-lg font-semibold text-foreground">Project Page Banner (Carousel) - Images and Videos</label>
                  <p className="text-xs text-muted-foreground">Manage banner carousel images and videos. Drag items to reorder them, or use the arrow buttons.</p>

                  {existingBannerMedia.length > 0 && (
                    <>
                      <label className="block text-sm font-medium text-foreground mt-4">Current Banner Media</label>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleExistingBannerDragEnd}
                      >
                        <SortableContext
                          items={existingBannerMedia.map((_, index) => `existing-banner-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {existingBannerMedia.map((mediaUrl, index) => (
                              <SortableExistingBannerMedia
                                key={`existing-banner-${index}`}
                                mediaUrl={mediaUrl}
                                index={index}
                                backendUrl={backendUrl}
                                onRemove={() => handleRemoveExistingBannerMedia(mediaUrl)}
                                onMoveUp={() => moveExistingBannerMediaUp(index)}
                                onMoveDown={() => moveExistingBannerMediaDown(index)}
                                isFirst={index === 0}
                                isLast={index === existingBannerMedia.length - 1}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </>
                  )}

                  {newBannerMedia.length > 0 && (
                    <>
                      <label className="block text-sm font-medium text-foreground mt-4">New Banner Media to Upload</label>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleNewBannerDragEnd}
                      >
                        <SortableContext
                          items={newBannerMedia.map((_, index) => `new-banner-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {newBannerMedia.map((file, index) => (
                              <SortableNewBannerMedia
                                key={`new-banner-${index}`}
                                file={file}
                                index={index}
                                totalExisting={existingBannerMedia.length}
                                onRemove={() => removeNewBannerMedia(index)}
                                onMoveUp={() => moveNewBannerMediaUp(index)}
                                onMoveDown={() => moveNewBannerMediaDown(index)}
                                isFirst={index === 0}
                                isLast={index === newBannerMedia.length - 1}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </>
                  )}

                  <label className="block text-sm font-medium text-foreground">Add More Banner Images and Videos</label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setNewBannerMedia([...newBannerMedia, ...newFiles]);
                      e.target.value = ''; // Reset input
                    }}
                    className=""
                  />
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Additional Content Sections</h3>
                  {(sections || []).map((section, index) => (
                    <div key={section.id} className="p-4 border border-border rounded-md relative space-y-3 bg-card">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <h4 className="font-medium text-foreground">Section {index + 1}</h4>
                      <Input 
                        value={section.title} 
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)} 
                        placeholder="Section Title" 
                        className=""
                      />
                      <Input 
                        value={section.subtitle} 
                        onChange={(e) => handleSectionChange(section.id, 'subtitle', e.target.value)} 
                        placeholder="Section Subtitle" 
                        className=""
                      />
                      <Textarea 
                        value={section.body} 
                        onChange={(e) => handleSectionChange(section.id, 'body', e.target.value)} 
                        placeholder="Section body..." 
                        className="min-h-[120px] " 
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

                          <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary absolute inset-0 rounded-md">
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
                          accept="image/*"
                          onChange={(e) => handleSectionChange(section.id, 'image', e.target.files ? e.target.files[0] : null)}
                          className=""
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Video</label>
                        <div className="relative w-full max-w-xs">
                          {section.video ? (
                            <video src={URL.createObjectURL(section.video)} controls className="rounded-md w-full h-auto" />
                          ) : section.videoUrl ? (
                            <video
                              src={section.videoUrl.startsWith('http') ? section.videoUrl : `${backendUrl}${section.videoUrl}`}
                              controls
                              className="rounded-md w-full h-auto"
                              onError={(e) => {
                                console.error('Section video failed to load:', section.videoUrl);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                              onLoad={() => {
                                console.log('Section video loaded successfully:', section.videoUrl);
                              }}
                            />
                          ) : null}

                          <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary absolute inset-0 rounded-md">
                            Failed to Load
                          </div>

                          {(section.videoUrl || section.video) && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveVideo(section.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                          onChange={(e) => handleSectionChange(section.id, 'video', e.target.files ? e.target.files[0] : null)}
                          className=""
                        />
                        {(section.video || section.videoUrl) && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`videoFullWidth-${section.id}`}
                              checked={section.videoFullWidth}
                              onChange={(e) => handleSectionChange(section.id, 'videoFullWidth', e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`videoFullWidth-${section.id}`}
                              className="text-sm text-foreground cursor-pointer"
                            >
                              Display video full-width
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSection}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Dynamic Section
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
