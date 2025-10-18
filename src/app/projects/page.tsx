"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

// Backend URL for direct image access
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- TYPE DEFINITION ---
interface Project {
  id: number;
  slug: string;
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  thumbnail?: string;
}

// --- DATA FETCHING ---
async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch('/api/projects', {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error("Failed to fetch projects, server responded with:", response.status);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Get all unique tags from all projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach(project => {
      (project.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  // Filter projects based on search query and selected tag
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by search query (matches title, blurb, or tags)
      const matchesSearch = searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.blurb.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by selected tag
      const matchesTag = !selectedTag || (project.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [projects, searchQuery, selectedTag]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete collection of my work, from web design to AI-driven campaigns.
            </p>
          </header>
          <div className="text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </main>
    );
  }

  if (projects.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete collection of my work, from web design to AI-driven campaigns.
            </p>
          </header>
          <div className="text-center">
            <p className="text-muted-foreground">No projects found. Create some projects in the admin panel!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete collection of my work, from web design to AI-driven campaigns.
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects by name, keyword, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-sm text-muted-foreground">Filter by tag:</span>
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="rounded-full"
              >
                All Projects
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="rounded-full"
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}

          {/* Results Count */}
          <p className="text-center text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found matching your criteria.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
            // Construct direct image URL to backend
            const thumbnailUrl = p.thumbnail
              ? (p.thumbnail.startsWith('http')
                  ? p.thumbnail
                  : `${backendUrl}${p.thumbnail}`)
              : null;

            return (
              <Link href={`/projects/${p.slug}`} key={p.id} className="group">
                <Card className="p-0 rounded-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`${p.title} thumbnail`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-xs text-muted-foreground ${thumbnailUrl ? 'hidden' : ''}`}>
                      No Image Available
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-4">
                    <CardHeader className="p-0">
                      <CardTitle className="flex items-center justify-between group-hover:text-primary transition-colors">
                        <span>{p.title}</span>
                        <span className="text-sm font-normal text-muted-foreground">{p.year}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4 flex-grow">
                      <p>{p.blurb}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(p.tags || []).map((t) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
