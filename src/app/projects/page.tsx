"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";

// Backend URL for direct image access
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sam-portfolio-backend.liara.run';

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

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete collection of my work, from web design to AI-driven campaigns.
            </p>
          </header>
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading projects...</p>
          </div>
        </div>
      </main>
    );
  }

  if (projects.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete collection of my work, from web design to AI-driven campaigns.
            </p>
          </header>
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">No projects found. Create some projects in the admin panel!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All Projects</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A complete collection of my work, from web design to AI-driven campaigns.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            // Construct direct image URL to backend
            const thumbnailUrl = p.thumbnail 
              ? (p.thumbnail.startsWith('http') 
                  ? p.thumbnail 
                  : `${backendUrl}${p.thumbnail}`)
              : null;
            
            return (
              <Link href={`/projects/${p.slug}`} key={p.id} className="group">
                <Card className="p-0 rounded-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-700 overflow-hidden">
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
                    <div className={`w-full h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 ${thumbnailUrl ? 'hidden' : ''}`}>
                      No Image Available
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-4">
                    <CardHeader className="p-0">
                      <CardTitle className="flex items-center justify-between group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <span className="text-slate-900 dark:text-slate-100">{p.title}</span>
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{p.year}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4 flex-grow">
                      <p className="text-slate-700 dark:text-slate-300">{p.blurb}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(p.tags || []).map((t) => (
                          <Badge key={t} variant="secondary" className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
