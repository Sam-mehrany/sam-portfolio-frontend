"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

interface NavLink {
  href: string;
  label: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [siteName, setSiteName] = useState("");
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current settings
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then(data => {
        setSiteName(data.site_name || '');
        setNavLinks(data.nav_links || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        alert('Failed to load settings. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    // Validation
    if (!siteName.trim()) {
      alert('Site name cannot be empty');
      return;
    }

    // Check for empty nav links
    const hasEmptyLinks = navLinks.some(link => !link.label.trim() || !link.href.trim());
    if (hasEmptyLinks) {
      alert('All navigation links must have both a label and URL');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          site_name: siteName.trim(), 
          nav_links: navLinks.map(link => ({
            href: link.href.trim(),
            label: link.label.trim()
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      alert('Settings saved successfully! Changes will appear on the site immediately.');
      router.push('/admin');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addNavLink = () => {
    setNavLinks([...navLinks, { href: '', label: '' }]);
  };

  const removeNavLink = (index: number) => {
    if (navLinks.length <= 1) {
      alert('You must have at least one navigation link');
      return;
    }
    setNavLinks(navLinks.filter((_, i) => i !== index));
  };

  const updateNavLink = (index: number, field: 'href' | 'label', value: string) => {
    const updated = [...navLinks];
    updated[index][field] = value;
    setNavLinks(updated);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Site Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your site name and navigation links</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Site Name Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Site Name</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  This appears in the navigation bar and browser tab
                </p>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Your Name or Site Title"
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* Navigation Links Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Navigation Links</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      These appear in the main navigation menu
                    </p>
                  </div>
                  <Button onClick={addNavLink} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {navLinks.map((link, index) => (
                    <div 
                      key={index} 
                      className="flex gap-3 items-start p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                            Label
                          </label>
                          <Input
                            value={link.label}
                            onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                            placeholder="e.g., Home, About, Projects"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                            URL
                          </label>
                          <Input
                            value={link.href}
                            onChange={(e) => updateNavLink(index, 'href', e.target.value)}
                            placeholder="e.g., /, /about, /projects"
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeNavLink(index)}
                        className="mt-8"
                        disabled={navLinks.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {navLinks.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No navigation links yet. Click "Add Link" to create one.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Link href="/admin" className="flex-shrink-0">
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
