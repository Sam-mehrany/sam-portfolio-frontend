"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FolderKanban, FileText, MessageSquare, Newspaper, Settings } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { 
      method: 'POST',
      credentials: 'include' 
    });
    router.push('/admin/login');
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Select a content type to manage.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Projects Card */}
            <Link href="/admin/projects">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
                    <FolderKanban className="h-8 w-8" />
                    Manage Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">Create, edit, and delete your portfolio projects.</p>
                </CardContent>
              </Card>
            </Link>

            {/* Pages Card */}
            <Link href="/admin/pages">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
                    <FileText className="h-8 w-8" />
                    Manage Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">Edit the content of your Home, About, and Contact pages.</p>
                </CardContent>
              </Card>
            </Link>

            {/* Blog Card */}
            <Link href="/admin/blog">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
                    <Newspaper className="h-8 w-8" />
                    Manage Blog
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">Write, edit, and publish new blog posts.</p>
                </CardContent>
              </Card>
            </Link>

            {/* Messages Card */}
            <Link href="/admin/messages">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
                    <MessageSquare className="h-8 w-8" />
                    Manage Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">View and delete project requests from your homepage form.</p>
                </CardContent>
              </Card>
            </Link>

            {/* Settings Card - NEW */}
            <Link href="/admin/settings">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
                    <Settings className="h-8 w-8" />
                    Site Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">Manage site name and navigation links.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
