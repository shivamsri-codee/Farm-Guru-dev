import { useEffect, useRef, useState } from 'react';
import AnimatedCard from '@/components/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FlaggedQuery {
  id: string;
  text: string;
  created_at: string;
  flags: string[];
}

const AdminPage = () => {
  const [items, setItems] = useState<FlaggedQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFlagged = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/queries?flagged=true`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        // fallback demo
        setItems([
          { id: '1', text: 'Spam content', created_at: new Date().toISOString(), flags: ['spam'] },
          { id: '2', text: 'Potentially harmful advice', created_at: new Date().toISOString(), flags: ['safety'] },
        ]);
      } finally {
        setLoading(false);
        if (liveRef.current) liveRef.current.textContent = 'Flagged items loaded';
      }
    };
    fetchFlagged();
  }, []);

  const moderate = async (id: string, action: 'approve' | 'remove') => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await fetch(`${apiUrl}/api/queries/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      setItems(prev => prev.filter(i => i.id !== id));
      if (liveRef.current) liveRef.current.textContent = `Item ${id} ${action}d`;
    } catch (e) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold">Admin Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and moderate flagged queries.</p>
        <div ref={liveRef} aria-live="polite" className="sr-only" />
      </AnimatedCard>

      <AnimatedCard className="p-4">
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flagged items.</p>
        ) : (
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="p-3 border rounded-xl bg-white/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{it.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {it.flags.map((f, i) => (
                        <Badge key={i} variant="secondary">{f}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => moderate(it.id, 'approve')}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => moderate(it.id, 'remove')}>Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedCard>
    </div>
  );
};

export default AdminPage;