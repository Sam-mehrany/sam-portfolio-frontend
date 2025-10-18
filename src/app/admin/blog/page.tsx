"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Post {
  id: number;
  title: string;
  slug: string;
  date: string;
}

export default function AdminManageBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error("Failed to fetch posts.");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = (id: number) => {
    setPostIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!postIdToDelete) return;
    
    try {
      const response = await fetch(`/api/posts/${postIdToDelete}`, { 
        method: 'DELETE',
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts(posts.filter(p => p.id !== postIdToDelete));
      setIsDeleteDialogOpen(false);
      setPostIdToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsDeleteDialogOpen(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">Manage Blog Posts</h1>
              <Link href="/admin/blog/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </div>
          </header>

          <Card>
            <CardContent className="pt-6">
              {error && <p className="text-destructive mb-4">{error}</p>}
              <div className="space-y-4">
                {posts.length > 0 ? posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                    <div>
                      <h3 className="font-semibold text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{`/blog/${post.slug} • Published: ${post.date}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                    </div>
                  </div>
                )) : <p className="text-muted-foreground">No blog posts found. Click "New Post" to get started.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Are you sure?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the selected post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
