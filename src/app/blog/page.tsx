"use client";

import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

// --- TYPE DEFINITION ---
interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

// --- DATA FETCHING ---
async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch('/api/posts', { 
      cache: 'no-store'
    });
    if (!response.ok) {
      console.error("Failed to fetch posts, server responded with:", response.status);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

// --- COMPONENT ---
export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Blog & Articles</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Thoughts on design, technology, and creative strategy.
            </p>
          </header>
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">Loading blog posts...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Blog & Articles</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Thoughts on design, technology, and creative strategy.
          </p>
        </header>

        <div className="space-y-8">
          {posts.length > 0 ? posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
              <Card className="rounded-2xl hover:shadow-xl transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-slate-100">
                    {post.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No blog posts have been published yet.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Go to the admin panel to create your first post.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
