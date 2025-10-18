"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

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

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="mb-8">
            <Link href="/admin" className="inline-block mb-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Manage Pages</h1>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {pages.length > 0 ? pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                    <div>
                      <h3 className="font-semibold capitalize">{page.slug} Page</h3>
                      <p className="text-sm text-muted-foreground">Current Title: {page.title}</p>
                    </div>
                    <Link href={`/admin/pages/edit/${page.slug}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                  </div>
                )) : <p className="text-muted-foreground">Loading pages...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
