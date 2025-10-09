// projects[slug].tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Target, Wrench, X } from "lucide-react";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Backend URL for direct image access
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sam-portfolio-backend.liara.run';

interface ContentSection {
  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
}

interface ProjectDetails {
  id: number;
  slug: string;
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  images: string[];
  outcome: string;
  challenge: string;
  solution: string;
  content: ContentSection[];
}

export default function SingleProjectPage() {
  const params = useParams();
  const slug = params.slug;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/slug/${slug}`);
          if (!response.ok) throw new Error('Could not find this project.');
          const data = await response.json();
          setProject(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [slug]);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center py-24">
        <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
      </div>
    </div>
  );

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Project Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{error}</p>
        <Link href="/projects" className="mt-4 text-blue-500 dark:text-blue-400 hover:underline">
          Return to All Projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <div className="max-w-4xl mx-auto px-6 pt-16">
          <header className="mb-12">
            <Link href="/projects" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to all projects
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{project.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(project.tags || []).map(tag => (
                <Badge key={tag} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>
        </div>

        {(project.images || []).length > 0 && (
          <div className="w-full mb-12">
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-4">
                {(project.images || []).map((imageSrc, index) => {
                  const fullImageUrl = imageSrc.startsWith('http') 
                    ? imageSrc 
                    : `${backendUrl}${imageSrc}`;
                  
                  return (
                    <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden" onClick={() => setLightboxImage(fullImageUrl)}>
                        <img 
                          src={fullImageUrl}
                          alt={`Project image ${index + 1} for ${project.title}`}
                          className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="ml-16 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"/>
              <CarouselNext className="mr-16 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"/>
            </Carousel>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 pb-16 space-y-12">
          {/* Fixed sections */}
          {project.outcome && (
            <section>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-3">
                <CheckCircle className="h-8 w-8 text-emerald-500" /> Key Outcome
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{project.outcome}</p>
            </section>
          )}
          {project.challenge && (
            <section>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-3">
                <Target className="h-8 w-8 text-slate-500 dark:text-slate-400" /> The Challenge
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{project.challenge}</p>
            </section>
          )}
          {project.solution && (
            <section>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-3">
                <Wrench className="h-8 w-8 text-slate-500 dark:text-slate-400" /> The Solution
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{project.solution}</p>
            </section>
          )}

          {/* Dynamic sections */}
          {(project.content || []).map((section, index) => {
            console.log(`Rendering Section ${index + 1}:`, section);

            const sectionImageUrl = section.imageUrl 
              ? (section.imageUrl.startsWith('http') 
                  ? section.imageUrl 
                  : `${backendUrl}${section.imageUrl}`)
              : null;

            return (
              <section key={index}>
                {section.title && <h2 className="text-3xl font-bold mb-2">{section.title}</h2>}
                {section.subtitle && <h3 className="text-xl text-slate-600 dark:text-slate-400 font-semibold mb-4">{section.subtitle}</h3>}
                {sectionImageUrl && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden my-4">
                    <img 
                      src={sectionImageUrl}
                      alt={section.title || 'Section image'}
                      className="rounded-lg w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setLightboxImage(sectionImageUrl)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback
                        const fallback = document.createElement('div');
                        fallback.className = 'flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg';
                        fallback.textContent = 'Image failed to load';
                        target.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                )}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{section.body}</p>
              </section>
            );
          })}
        </div>
      </main>

      {/* Lightbox component */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
