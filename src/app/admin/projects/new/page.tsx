"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface ContentSection {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  image: File | null;
  video: File | null;
  videoFullWidth: boolean;
  imageUrl?: string;
  videoUrl?: string;
}

interface SortableBannerMediaProps {
  file: File;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableBannerMedia({ file, index, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: SortableBannerMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `banner-${index}` });

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
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-border"
          controls
        />
      ) : (
        <img
          src={URL.createObjectURL(file)}
          alt={`Banner ${index + 1}`}
          className="rounded-md w-full h-auto object-cover aspect-video border-2 border-border"
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
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        #{index + 1} {isVideo && '(Video)'}
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [blurb, setBlurb] = useState("");
  const [tags, setTags] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // ACTION: Add state for the thumbnail image
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [bannerMedia, setBannerMedia] = useState<File[]>([]);
  const [outcome, setOutcome] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [sections, setSections] = useState<ContentSection[]>([]);
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
    setShowTagSuggestions(false);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "", subtitle: "", body: "", image: null, video: null, videoFullWidth: false }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSectionChange = (id: number, field: keyof Omit<ContentSection, 'id' | 'imageUrl' | 'videoUrl'>, value: string | File | null | boolean) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const removeBannerMedia = (index: number) => {
    setBannerMedia(bannerMedia.filter((_, i) => i !== index));
  };

  const moveBannerMediaUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...bannerMedia];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    setBannerMedia(newMedia);
  };

  const moveBannerMediaDown = (index: number) => {
    if (index === bannerMedia.length - 1) return;
    const newMedia = [...bannerMedia];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    setBannerMedia(newMedia);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('banner-', ''));
      const newIndex = parseInt(over.id.toString().replace('banner-', ''));

      setBannerMedia((items) => arrayMove(items, oldIndex, newIndex));
    }
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
      // Upload thumbnail
      const [thumbnailUrl] = await uploadImages([thumbnail]);

      // Upload banner media (images and videos)
      const bannerMediaUrls = await uploadImages(bannerMedia);

      // Upload section images and videos
      const finalSectionsData = await Promise.all(
        sections.map(async (section) => {
          let imageUrl = '';
          let videoUrl = '';
          if (section.image) {
            imageUrl = (await uploadImages([section.image]))[0];
          }
          if (section.video) {
            videoUrl = (await uploadImages([section.video]))[0];
          }
          return {
            title: section.title,
            subtitle: section.subtitle,
            body: section.body,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            videoFullWidth: section.videoFullWidth || false,
          };
        })
      );

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const newProject = {
        slug, title, year, blurb, tags: tagsArray,
        thumbnail: thumbnailUrl,
        images: bannerMediaUrls,
        videos: [],
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
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-8">
            <Link href="/admin/projects" className="inline-block mb-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Manage Projects
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Create New Project</h1>
          </header>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Basic Information</h3>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground">Project Title</label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Ronix DE Homepage Redesign"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-foreground">URL Slug</label>
                    <Input 
                      id="slug" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      placeholder="e.g., ronix-de-redesign" 
                      required 
                      className=""
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-foreground">Year</label>
                    <Input 
                      id="year" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)} 
                      placeholder="e.g., 2025" 
                      className=""
                    />
                  </div>
                  <div>
                    <label htmlFor="blurb" className="block text-sm font-medium text-foreground">Blurb</label>
                    <Textarea 
                      id="blurb" 
                      value={blurb} 
                      onChange={(e) => setBlurb(e.target.value)} 
                      placeholder="A brief description for project cards..." 
                      className=""
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="tags" className="block text-sm font-medium text-foreground">Tags</label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      onFocus={() => setShowTagSuggestions(true)}
                      placeholder="e.g., UX Design, Web Dev, AI (comma separated)"
                      className=""
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
                </div>

                {/* ACTION: New Thumbnail Section */}
                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted">
                    <label className="block text-lg font-semibold text-foreground">Thumbnail Image</label>
                    <p className="text-xs text-muted-foreground">This image will be shown on project listing pages. (Required)</p>
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
                        className=""
                    />
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Key Project Details</h3>
                  <Textarea 
                    value={outcome} 
                    onChange={(e) => setOutcome(e.target.value)} 
                    placeholder="Key Outcome..." 
                    className="min-h-[100px]" 
                  />
                  <Textarea 
                    value={challenge} 
                    onChange={(e) => setChallenge(e.target.value)} 
                    placeholder="The Challenge..." 
                    className="min-h-[120px]" 
                  />
                  <Textarea 
                    value={solution} 
                    onChange={(e) => setSolution(e.target.value)} 
                    placeholder="The Solution..." 
                    className="min-h-[120px]" 
                  />
                </div>

                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted">
                  <label className="block text-lg font-semibold text-foreground">Project Page Banner (Carousel)</label>
                  <p className="text-xs text-muted-foreground">Upload images and videos for the project banner carousel. Drag items to reorder them, or use the arrow buttons.</p>

                  {bannerMedia.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={bannerMedia.map((_, index) => `banner-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {bannerMedia.map((file, index) => (
                            <SortableBannerMedia
                              key={`banner-${index}`}
                              file={file}
                              index={index}
                              onRemove={() => removeBannerMedia(index)}
                              onMoveUp={() => moveBannerMediaUp(index)}
                              onMoveDown={() => moveBannerMediaDown(index)}
                              isFirst={index === 0}
                              isLast={index === bannerMedia.length - 1}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}

                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setBannerMedia([...bannerMedia, ...newFiles]);
                      e.target.value = ''; // Reset input to allow re-selecting
                    }}
                    className=""
                  />
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  <h3 className="font-semibold text-lg text-foreground">Additional Content Sections</h3>
                  {sections.map((section, index) => (
                    <div key={section.id} className="p-4 border border-border rounded-md relative space-y-3 bg-card">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <h4 className="font-medium text-foreground">Section {index + 1}</h4>
                      <Input
                        value={section.title}
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                        placeholder="Section Title (e.g., Process)"
                        className=""
                      />
                      <Input
                        value={section.subtitle}
                        onChange={(e) => handleSectionChange(section.id, 'subtitle', e.target.value)}
                        placeholder="Section Subtitle (optional)"
                        className=""
                      />
                      <Textarea
                        value={section.body}
                        onChange={(e) => handleSectionChange(section.id, 'body', e.target.value)}
                        placeholder="Section body text..."
                        className="min-h-[120px]"
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Section Image</label>
                        {section.image && (
                          <div className="relative w-full max-w-xs mb-2">
                            <img src={URL.createObjectURL(section.image)} alt="Preview" className="rounded-md w-full h-auto" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => handleSectionChange(section.id, 'image', null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSectionChange(section.id, 'image', e.target.files ? e.target.files[0] : null)}
                          className=""
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Section Video</label>
                        {section.video && (
                          <div className="relative w-full max-w-xs mb-2">
                            <video src={URL.createObjectURL(section.video)} className="rounded-md w-full h-auto" controls />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => handleSectionChange(section.id, 'video', null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                          onChange={(e) => handleSectionChange(section.id, 'video', e.target.files ? e.target.files[0] : null)}
                          className=""
                        />
                        {section.video && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id={`video-fullwidth-${section.id}`}
                              checked={section.videoFullWidth}
                              onChange={(e) => handleSectionChange(section.id, 'videoFullWidth', e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                            />
                            <label htmlFor={`video-fullwidth-${section.id}`} className="text-sm text-foreground">
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
