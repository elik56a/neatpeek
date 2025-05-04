import { HealthCheck } from '@/features/health/components/HealthCheck';

export default function HealthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">System Health Dashboard</h1>
      <HealthCheck />
    </div>
  );
} 