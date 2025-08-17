import AnimatedCard from '@/components/AnimatedCard';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const missingSupabase = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="space-y-6">
      {missingSupabase && (
        <AnimatedCard className="p-4 border-2 border-amber-300 bg-amber-50">
          <p className="text-amber-800 font-medium">Dev mode: Missing Supabase credentials (.env). Some features like image upload are disabled.</p>
        </AnimatedCard>
      )}

      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold">Your Profile</h1>
        <p className="text-sm text-muted-foreground">Saved queries, alerts, and preferences.</p>
      </AnimatedCard>

      <AnimatedCard className="p-4">
        <h2 className="font-medium mb-2">Language</h2>
        <p className="text-sm text-muted-foreground">Toggle Hindi/English from the header.</p>
        <Link to="/" className="text-[#2a8f6d] underline">Go to Home</Link>
      </AnimatedCard>

      <AnimatedCard className="p-4">
        <h2 className="font-medium mb-2">Saved Queries</h2>
        <p className="text-sm text-muted-foreground">Coming soon: Your recent questions saved for offline access.</p>
      </AnimatedCard>

      <AnimatedCard className="p-4">
        <h2 className="font-medium mb-2">Alerts</h2>
        <p className="text-sm text-muted-foreground">Configure weather and market alerts. (Todo)</p>
      </AnimatedCard>
    </div>
  );
};

export default ProfilePage;