'use client';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity } from '@/app/store/entitySlice';
import { CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import EntityForm from './EntityForm';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export default function EntityModal({ isOpen, onClose, projectId }: EntityModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.entities);

  const handleSubmit = async (data: CreateEntityRequest | UpdateEntityRequest) => {
    const result = await dispatch(createEntity({ projectId, data: data as CreateEntityRequest }));
    if (createEntity.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-xl glass rounded-3xl p-8 overflow-hidden overflow-y-auto max-h-[90vh] modal-border-glow border-t-2 border-primary/50 border-b-2 border-secondary/50">
        {/* Decorative animated icon */}
        <div className="absolute top-6 right-6 text-secondary/60 animate-bounce">
          <span className="material-symbols-outlined text-3xl">
            history_edu
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              auto_awesome
            </span>
            Summon New Entity
          </h2>
          <p className="text-slate-400 mt-2">
            Breathe life into a new creation for your world.
          </p>
        </div>

        {/* Form */}
        <EntityForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
