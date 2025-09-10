"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Remove Next.js Image import
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, LogOut, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

interface Project {
  id: number;
  title: string;
  slug: string;
  year: string;
  thumbnail?: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Backend URL for direct image access
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sam-portfolio-backend.liara.run';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error("Failed to fetch projects. Please ensure the backend is running.");
        }
        const data = await response.json();
        setProjects(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    router.push('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to delete project.");
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while deleting.");
      }
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Manage Projects</h1>
                <p className="text-slate-600">Create, edit, and delete your portfolio projects.</p>
              </div>
              <Link href="/admin/projects/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </header>

          {isLoading && <p>Loading projects...</p>}
          {error && <p className="text-red-500 font-semibold p-4 bg-red-100 rounded-md">{error}</p>}

          <div className="space-y-4">
            {projects.map((project) => {
              // Construct direct image URL to backend
              const thumbnailUrl = project.thumbnail 
                ? (project.thumbnail.startsWith('http') 
                    ? project.thumbnail 
                    : `${backendUrl}${project.thumbnail}`)
                : null;

              return (
                <Card key={project.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                      {thumbnailUrl ? (
                        <div className="relative w-24 h-16 rounded-md overflow-hidden bg-slate-200">
                          <img
                            src={thumbnailUrl}
                            alt={`${project.title} thumbnail`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Admin thumbnail failed to load:', thumbnailUrl);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            onLoad={() => {
                              console.log('Admin thumbnail loaded successfully:', thumbnailUrl);
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-200 absolute inset-0">
                            Failed to Load
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-md bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-slate-500">/{project.slug}</p>
                        {project.year && <p className="text-xs text-slate-400">{project.year}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/admin/projects/edit/${project.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {projects.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No projects found. Create your first project!</p>
              <Link href="/admin/projects/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
