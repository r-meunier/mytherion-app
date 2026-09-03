'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import routes from '@/app/config/routes';

export default function EntitiesRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (projectId) {
      router.replace(routes.project(projectId).codex.index());
    }
  }, [projectId, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0b0710]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
