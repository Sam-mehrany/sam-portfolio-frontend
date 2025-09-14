"use client";

import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Backend URL for direct image access
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sam-portfolio-backend.liara.run';

// --- TYPE DEFINITIONS ---
interface ContentSection {
  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: ContentSection[];
}

// --- DATA FETCHING ---
async function getPost(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`/api/posts/slug/${slug}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

// --- COMPONENT ---
export default function SinglePostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        try {
          const data = await getPost(slug);
          if (data) {
            setPost(data);
          } else {
            setError('Post not found');
          }
        } catch (err) {
          setError('Failed to load post');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <p className="text-slate-500">Loading post...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center py-24">
            <h1 className="text-4xl font-bold">Post Not Found</h1>
            <p className="mt-2 text-slate-600">{error}</p>
            <Link href="/blog" className="mt-4 inline-block text-blue-500 hover:underline">
              Return to Blog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <header className="mb-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">{post.title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(post.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </header>

        <article className="prose lg:prose-xl">
          {(post.content || []).map((section, index) => {
            // Debug the section imageUrl
            console.log('Section imageUrl:', section.imageUrl);
            
            const sectionImageUrl = section.imageUrl 
              ? (section.imageUrl.startsWith('http') 
                  ? section.imageUrl 
                  : `${backendUrl}${section.imageUrl}`)
              : null;
            
            // Debug the final constructed URL
            console.log('Final image URL:', sectionImageUrl);

            return (
              <section key={index} className="mb-8">
                {section.title && <h2>{section.title}</h2>}
                {section.subtitle && <h3 className="text-slate-600">{section.subtitle}</h3>}
                {sectionImageUrl && (
                  <div className="relative w-full h-80 rounded-lg my-4 overflow-hidden">
                    <img
                      src={sectionImageUrl}
                      alt={section.title || 'Blog post image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Image failed to load:', sectionImageUrl);
                        console.error('Error event:', e);
                        target.style.display = 'none';
                        // Show fallback text
                        const fallback = document.createElement('div');
                        fallback.className = 'flex items-center justify-center h-80 bg-gray-100 text-gray-500';
                        fallback.textContent = 'Image failed to load';
                        target.parentNode?.appendChild(fallback);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', sectionImageUrl);
                      }}
                    />
                  </div>
                )}
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </section>
            );
          })}
        </article>
      </div>
    </main>
  );
}
