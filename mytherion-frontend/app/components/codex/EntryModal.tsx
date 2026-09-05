'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createEntry, updateEntry, fetchEntry, clearError } from '@/app/store/codexSlice';
import { CodexEntry, EntryType, CreateEntryRequest, UpdateEntryRequest } from '@/app/types/codex';
import { mediaService } from '@/app/services/mediaService';
import EntryForm from './EntryForm';

import BaseModal from '../ui/modals/BaseModal';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  entry?: CodexEntry | null;
  defaultType?: EntryType;
  onSuccess?: () => void;
}

export default function EntryModal({ isOpen, onClose, projectId, entry, defaultType, onSuccess }: EntryModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.entries);
  const [formKey, setFormKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors and reset submitting state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      setIsSubmitting(false);
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (data: CreateEntryRequest | UpdateEntryRequest, imageFile?: File | null) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    try {
      if (entry) {
        const result = await dispatch(updateEntry({ projectId, id: entry.id, data: data as UpdateEntryRequest }));
        if (updateEntry.fulfilled.match(result)) {
          if (imageFile) {
            try {
              await mediaService.uploadEntryThumbnail(projectId, entry.id, imageFile);
              await dispatch(fetchEntry({ projectId, id: entry.id }));
            } catch (err) {
              console.error('Image upload failed', err);
            }
          }
          setFormKey(prev => prev + 1);
          onSuccess?.();
          onClose();
        }
      } else {
        const result = await dispatch(createEntry({ projectId, data: data as CreateEntryRequest }));
        if (createEntry.fulfilled.match(result)) {
          const createdEntry = result.payload as CodexEntry;
          if (imageFile && createdEntry?.id) {
            try {
              await mediaService.uploadEntryThumbnail(projectId, createdEntry.id, imageFile);
              await dispatch(fetchEntry({ projectId, id: createdEntry.id }));
            } catch (err) {
              console.error('Image upload failed', err);
            }
          }
          setFormKey(prev => prev + 1);
          onSuccess?.();
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
      title={entry ? `Reshape ${entry.name}` : 'Summon New Entry'}
      description={entry ? 'Alter the essence of your creation.' : 'Breathe life into a new creation for your world.'}
      icon={entry ? 'edit' : 'auto_awesome'}
      decorativeIcon={entry ? 'edit_note' : 'history_edu'}
      maxWidth="max-w-7xl"
      className="h-[90vh] min-h-[600px]"
      onClear={() => setFormKey(prev => prev + 1)}
    >
      <EntryForm
        key={`${entry?.id || 'new'}-${formKey}`}
        entry={entry || undefined}
        projectId={projectId}
        defaultType={defaultType}
        isOpen={isOpen}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading || isSubmitting}
        error={error}
      />
    </BaseModal>
  );
}
