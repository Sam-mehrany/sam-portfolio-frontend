"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE', credentials: 'include' });
    setMessages(messages.filter(m => m.id !== id));
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
            <h1 className="text-4xl font-bold text-foreground">Inbox</h1>
          </header>

          <div className="space-y-4">
            {messages.length > 0 ? messages.map((msg) => (
              <Card key={msg.id}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">{msg.contact_info}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(msg.submitted_at).toLocaleString()}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-foreground bg-muted p-3 rounded-md border">
                        {msg.project_description}
                    </p>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground text-center py-8">No messages yet.</p>}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
