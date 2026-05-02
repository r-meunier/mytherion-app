'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntity, updateEntity, clearError } from '@/app/store/entitySlice';
import { Entity, CreateEntityRequest, UpdateEntityRequest } from '@/app/types/entity';
import EntityForm from './EntityForm';

import BaseModal from '../ui/modals/BaseModal';

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
        isOpen={isOpen}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        error={error}
      />
    </BaseModal>
  );
}
