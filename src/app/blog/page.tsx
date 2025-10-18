"use client";

import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Get all unique tags from all posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      (post.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Filter by search query (matches title, excerpt, or tags)
      const matchesSearch = searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by selected tag
      const matchesTag = !selectedTag || (post.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Blog & Articles</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts on design, technology, and creative strategy.
            </p>
          </header>
          <div className="text-center">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-orange-50/30 dark:from-background dark:to-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Blog & Articles</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Thoughts on design, technology, and creative strategy.
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blog posts by title, keyword, or tag..."
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
                All Posts
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
            Showing {filteredPosts.length} of {posts.length} posts
          </p>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts found matching your criteria.</p>
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
          <div className="space-y-8">
            {filteredPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
              <Card className="rounded-2xl hover:shadow-xl transition-shadow bg-card border-border">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors text-card-foreground">
                    {post.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground pt-1">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).map((tag) => (
                      <Badge key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
