import AnimatedCard from '@/components/AnimatedCard';
import { CommunityFeed } from '@/components/CommunityFeed';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold">Community Forum</h1>
        <p className="text-sm text-muted-foreground">Ask questions, share experiences, and help other farmers.</p>
        <div aria-live="polite" className="sr-only">Community content loaded</div>
        <p className="text-xs text-muted-foreground mt-2">Moderation tools available in <Link to="/admin" className="underline">Admin</Link>.</p>
      </AnimatedCard>

      <CommunityFeed userId="anonymous" userState="Karnataka" />
    </div>
  );
};

export default CommunityPage;