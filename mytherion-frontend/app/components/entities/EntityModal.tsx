'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity, updateEntity, clearError } from '@/app/store/entitySlice';
import { Entity, CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import EntityForm from './EntityForm';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  entity?: Entity | null;
}

export default function EntityModal({ isOpen, onClose, projectId, entity }: EntityModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.entities);
  const [formKey, setFormKey] = useState(0);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (data: CreateEntityRequest | UpdateEntityRequest) => {
    let result;
    if (entity) {
      result = await dispatch(updateEntity({ id: entity.id, data: data as UpdateEntityRequest }));
    } else {
      result = await dispatch(createEntity({ projectId, data: data as CreateEntityRequest }));
    }

    if (createEntity.fulfilled.match(result) || updateEntity.fulfilled.match(result)) {
      setFormKey(prev => prev + 1);
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} 
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-md cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-7xl glass rounded-3xl p-8 overflow-hidden overflow-y-auto max-h-[95vh] modal-border-glow border-t-2 border-primary/50 border-b-2 border-secondary/50 shadow-2xl transition-transform duration-300 ${
        isOpen ? 'scale-100' : 'scale-95'
      }`}>
        {/* Decorative animated icon */}
        <div className="absolute top-6 right-6 text-secondary/60 animate-bounce">
          <span className="material-symbols-outlined text-3xl">
            {entity ? 'edit_note' : 'history_edu'}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              {entity ? 'edit' : 'auto_awesome'}
            </span>
            {entity ? `Reshape ${entity.name}` : 'Summon New Entity'}
          </h2>
          <p className="text-slate-400 mt-2">
            {entity 
              ? 'Alter the essence of your creation.' 
              : 'Breathe life into a new creation for your world.'}
          </p>
        </div>

        {/* Form */}
        <EntityForm
          key={`${entity?.id || 'new'}-${formKey}`}
          entity={entity || undefined}
          isOpen={isOpen}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
