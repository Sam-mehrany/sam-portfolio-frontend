"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeToggle } from "@/components/theme-toggle";

interface Message {
  id: number;
  project_description: string;
  contact_info: string;
  submitted_at: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch('/api/messages', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    };
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE', credentials: 'include' });
    setMessages(messages.filter(m => m.id !== id));
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Inbox</h1>
          </header>

          <div className="space-y-4">
            {messages.length > 0 ? messages.map((msg) => (
              <Card key={msg.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{msg.contact_info}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(msg.submitted_at).toLocaleString()}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        {msg.project_description}
                    </p>
                </CardContent>
              </Card>
            )) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">No messages yet.</p>}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
