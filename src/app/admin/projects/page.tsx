// Corrected code for: src/app/admin/projects/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

  // ✅ Get the backend URL from the environment variable.
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

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
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
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
          <header /* ... */ > 
            {/* Header content is unchanged */}
          </header>

          {isLoading && <p>Loading projects...</p>}
          {error && <p className="text-red-500 font-semibold p-4 bg-red-100 rounded-md">{error}</p>}

          <div className="space-y-4">
            {projects.map((project) => {
              // ✅ Construct the full, absolute URL for the thumbnail.
              const thumbnailUrl = project.thumbnail ? `${backendUrl}${project.thumbnail}` : null;

              return (
                <Card key={project.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                      {thumbnailUrl ? ( // ✅ Use the new variable here
                        <div className="relative w-24 h-16 rounded-md overflow-hidden bg-slate-200">
                          <Image
                            src={thumbnailUrl} // ✅ And here!
                            alt={`${project.title} thumbnail`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-md bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-slate-500">/{project.slug}</p>
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
        </div>
      </main>
    </AuthGuard>
  );
}
