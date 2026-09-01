'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity, updateEntity, fetchEntity, clearError } from '@/app/store/entitySlice';
import { Entity, CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import { mediaService } from '@/app/services/mediaService';
import EntityForm from './EntityForm';

import BaseModal from '../ui/modals/BaseModal';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  entity?: Entity | null;
}

export default function EntityModal({ isOpen, onClose, projectId, entity }: EntityModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.entities);
  const [formKey, setFormKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors and reset submitting state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      setIsSubmitting(false);
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (data: CreateEntityRequest | UpdateEntityRequest, imageFile?: File | null) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    try {
      if (entity) {
        const result = await dispatch(updateEntity({ projectId, id: entity.id, data: data as UpdateEntityRequest }));
        if (updateEntity.fulfilled.match(result)) {
          if (imageFile) {
            try {
              await mediaService.uploadEntityImage(projectId, entity.id, imageFile);
              await dispatch(fetchEntity({ projectId, id: entity.id }));
            } catch (err) {
              console.error('Image upload failed', err);
            }
          }
          setFormKey(prev => prev + 1);
          onClose();
        }
      } else {
        const result = await dispatch(createEntity({ projectId, data: data as CreateEntityRequest }));
        if (createEntity.fulfilled.match(result)) {
          const createdEntity = result.payload as Entity;
          if (imageFile && createdEntity?.id) {
            try {
              await mediaService.uploadEntityImage(projectId, createdEntity.id, imageFile);
              await dispatch(fetchEntity({ projectId, id: createdEntity.id }));
            } catch (err) {
              console.error('Image upload failed', err);
            }
          }
          setFormKey(prev => prev + 1);
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={entity ? `Reshape ${entity.name}` : 'Summon New Entity'}
      description={entity ? 'Alter the essence of your creation.' : 'Breathe life into a new creation for your world.'}
      icon={entity ? 'edit' : 'auto_awesome'}
      decorativeIcon={entity ? 'edit_note' : 'history_edu'}
      maxWidth="max-w-7xl"
      onClear={() => setFormKey(prev => prev + 1)}
    >
      <EntityForm
        key={`${entity?.id || 'new'}-${formKey}`}
        entity={entity || undefined}
        projectId={projectId}
        isOpen={isOpen}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading || isSubmitting}
        error={error}
      />
    </BaseModal>
  );
}
