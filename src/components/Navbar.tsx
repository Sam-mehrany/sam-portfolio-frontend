"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

interface NavLink {
  href: string;
  label: string;
}

interface Settings {
  site_name: string;
  nav_links: NavLink[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('Sam Mehrany');
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
  ]);

  useEffect(() => {
    // Fetch settings from the backend
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then((data: Settings) => {
        setSiteName(data.site_name || 'Sam Mehrany');
        setNavLinks(data.nav_links || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        // Fallback to default values
        setSiteName('Sam Mehrany');
        setNavLinks([
          { href: '/', label: 'Home' },
          { href: '/about', label: 'About' },
          { href: '/projects', label: 'Projects' },
          { href: '/blog', label: 'Blog' },
        ]);
        setIsLoading(false);
      });
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-6xl mx-auto px-6 py-3">
        {/* Desktop and Mobile Header */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight" onClick={closeMobileMenu}>
            {siteName}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  (pathname === link.href || 
                   (link.href !== '/' && pathname.startsWith(link.href))) && 
                  "text-foreground font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Desktop CTA Button and Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/#project-request">
              <Button>Request a Project</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-muted-foreground transition-colors hover:text-foreground py-2 px-2 rounded-lg",
                    (pathname === link.href || 
                     (link.href !== '/' && pathname.startsWith(link.href))) && 
                    "text-foreground font-semibold bg-gray-50 dark:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile CTA Button */}
              <div className="pt-2">
                <Link href="/#project-request" onClick={closeMobileMenu}>
                  <Button className="w-full">Request a Project</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
