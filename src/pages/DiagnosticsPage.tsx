import AnimatedCard from '@/components/AnimatedCard';
import { ChemRecommender } from '@/components/ChemRecommender';

const DiagnosticsPage = () => {
  return (
    <div className="space-y-6">
      <AnimatedCard className="p-4">
        <h1 className="text-xl font-semibold mb-2">Crop Diagnostics</h1>
        <p className="text-sm text-muted-foreground">Upload a crop image or describe symptoms to get safe treatment guidance. Demo Grad-CAM will appear when available.</p>
        <div aria-live="polite" className="sr-only">Diagnostics tools loaded</div>
      </AnimatedCard>

      <ChemRecommender crop="tomato" userId="anonymous" />

      <AnimatedCard className="p-4">
        <h2 className="font-medium mb-2">Grad-CAM Visualization</h2>
        <p className="text-sm text-muted-foreground">Coming soon: heatmap highlighting areas of interest in the uploaded image.</p>
        <div className="mt-3 h-40 rounded-xl bg-muted" aria-hidden="true" />
      </AnimatedCard>
    </div>
  );
};

export default DiagnosticsPage;