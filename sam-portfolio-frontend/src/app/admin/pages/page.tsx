"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogOut } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeToggle } from "@/components/theme-toggle";

interface Page {
  id: number;
  slug: string;
  title: string;
}

export default function AdminManagePages() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      const response = await fetch('/api/pages', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // ACTION: Filter out the 'contact' page from the list
        const filteredPages = data.filter((page: Page) => page.slug !== 'contact');
        setPages(filteredPages);
      }
    };
    fetchPages();
  }, []);

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
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                      <LogOut className="h-4 w-4" />
                  </Button>
                </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Manage Pages</h1>
          </header>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {pages.length > 0 ? pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div>
                      <h3 className="font-semibold capitalize text-slate-900 dark:text-slate-100">{page.slug} Page</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Current Title: {page.title}</p>
                    </div>
                    <Link href={`/admin/pages/edit/${page.slug}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                  </div>
                )) : <p className="text-slate-500 dark:text-slate-400">Loading pages...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
