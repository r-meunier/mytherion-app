'use client';

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { EntryType, CreateEntryRequest, EntryContent, EntryTemplate } from '@/app/types/codex';
import { mediaService, MEDIA_CONSTRAINTS } from '@/app/services/mediaService';
import { codexService } from '@/app/services/codexService';
import { defaultTemplate, detailsFromTemplate, hasDetailValues } from '@/app/utils/entryContent';
import EntryTypeSelector from './EntryTypeSelector';
import TagInput from './TagInput';
import PageHeader from '../ui/PageHeader';
import { Crumb } from '../ui/Breadcrumbs';
import EntryTabs from './EntryTabs';
import DetailsEditor from './details/DetailsEditor';
import TemplatePicker from './details/TemplatePicker';

const REPLACE_DETAILS_PROMPT = 'This replaces the details you have entered. Continue?';
const EMPTY_CONTENT: EntryContent = { templateId: null, details: [] };

/** A type's templates once fetched, or 'failed' if the fetch failed. */
type TemplateLoad = EntryTemplate[] | 'failed';

/** What a new entry of a type starts with: its default template (Basic), else nothing. */
function startingContent(load: TemplateLoad): EntryContent {
  if (load === 'failed') return EMPTY_CONTENT;
  const initial = defaultTemplate(load);
  return initial ? { templateId: initial.id, details: detailsFromTemplate(initial) } : EMPTY_CONTENT;
}

interface EntryFormProps {
  projectId: string;
  defaultType?: EntryType;
  /** The new entry, and the image to store once it exists (null: none). */
  onSubmit: (data: CreateEntryRequest, image: File | null) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  /** Page header. The form renders it so Save and Cancel sit where Edit and Delete sit on the entry page. */
  title?: string;
  subtitle?: ReactNode;
  breadcrumbs?: Crumb[];
}

/**
 * The New Entry form, laid out like the entry page (docs/codex-entry-model.md §2, docs/style-guide.md):
 * page header with the actions on the right, the type and template, then image and details in the
 * sidebar; name, aliases, tags and the Overview / Notes tabs in the main column. On narrow screens the
 * main column comes first. Existing entries are edited on the entry page itself.
 */
export default function EntryForm({
  defaultType,
  onSubmit,
  onCancel,
  loading = false,
  error,
  title,
  subtitle,
  breadcrumbs,
}: EntryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: defaultType || EntryType.CHARACTER,
    name: '',
    description: '',
    notes: '',
    tags: [] as string[],
    aliases: [] as string[],
    content: EMPTY_CONTENT,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Templates of every type, fetched once when the form opens, so switching type is instant
  // instead of locking the details and swapping them after a round trip.
  const [templateCache, setTemplateCache] = useState<Partial<Record<EntryType, TemplateLoad>>>({});
  // The type whose templates were last applied. Until it matches the chosen type, the details are
  // locked: anything typed meanwhile would be replaced when the templates arrive.
  const [templatesFor, setTemplatesFor] = useState<EntryType | null>(null);
  const templatesLoading = templatesFor !== formData.type;
  const currentLoad = templateCache[formData.type];
  const templatesFailed = !templatesLoading && currentLoad === 'failed';
  // While a type's templates are still on their way, keep showing the last ones (disabled) so the
  // picker keeps its place on the page.
  const shownLoad = currentLoad ?? (templatesFor ? templateCache[templatesFor] : undefined);
  const templates = Array.isArray(shownLoad) ? shownLoad : [];

  // Clean up object URL when imagePreview unmounts or changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = mediaService.validateImageFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, image: validation.error || 'Invalid image file' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
  };

  const loadTemplates = useCallback((type: EntryType) => {
    codexService
      .getTemplates(type)
      .then((list) => setTemplateCache((prev) => ({ ...prev, [type]: list })))
      .catch(() => setTemplateCache((prev) => ({ ...prev, [type]: 'failed' })));
  }, []);

  // Fetch every type's templates once, the starting type first.
  const startingType = useRef(formData.type);
  useEffect(() => {
    const first = startingType.current;
    loadTemplates(first);
    Object.values(EntryType)
      .filter((type) => type !== first)
      .forEach(loadTemplates);
  }, [loadTemplates]);

  // When the chosen type's templates arrive after it was chosen (first load, slow network, retry),
  // start from its default template. The details were locked until now, so nothing typed is lost.
  useEffect(() => {
    if (currentLoad === undefined || templatesFor === formData.type) return;
    // Applying data that arrived from the server; it runs once per type, guarded by templatesFor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({ ...prev, content: startingContent(currentLoad) }));
    setTemplatesFor(formData.type);
  }, [currentLoad, templatesFor, formData.type]);

  const handleTypeChange = (type: EntryType) => {
    if (type === formData.type) return;
    if (hasDetailValues(formData.content.details) && !window.confirm(REPLACE_DETAILS_PROMPT)) return;

    const load = templateCache[type];
    if (Array.isArray(load)) {
      // Already here: switch type and details in the same render, so nothing flickers.
      setFormData((prev) => ({ ...prev, type, content: startingContent(load) }));
      setTemplatesFor(type);
      return;
    }
    // Not here yet, or the fetch failed: the details stay locked until the templates arrive.
    setFormData((prev) => ({ ...prev, type }));
    if (load === 'failed') {
      setTemplateCache((prev) => ({ ...prev, [type]: undefined }));
      loadTemplates(type);
    }
  };

  const handleTemplateSelect = (template: EntryTemplate) => {
    if (template.id === formData.content.templateId) return;
    if (hasDetailValues(formData.content.details) && !window.confirm(REPLACE_DETAILS_PROMPT)) return;
    setFormData((prev) => ({
      ...prev,
      content: { templateId: template.id, details: detailsFromTemplate(template) },
    }));
  };

  const handleDetailsChange = (details: EntryContent['details']) =>
    setFormData((prev) => ({ ...prev, content: { ...prev.content, details } }));

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (formData.content.details.some((d) => d.label.trim() === '' && (d.value ?? '').trim() !== '')) {
      newErrors.details = 'Every detail with text needs a label.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Rows the author added but never filled in carry no information; drop them silently.
    const content: EntryContent = {
      ...formData.content,
      details: formData.content.details.filter((d) => d.label.trim() !== '' || (d.value ?? '').trim() !== ''),
    };
    onSubmit({ ...formData, content }, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="New entry" className="space-y-10 pb-12">
      <PageHeader title={title ?? 'New entry'} subtitle={subtitle} breadcrumbs={breadcrumbs}>
        <div className="flex items-center gap-2 lg:justify-end">
          <button type="submit" disabled={loading} className="btn-pill btn-pill-primary">
            <span className="material-symbols-outlined" aria-hidden="true">check</span>
            <span>{loading ? 'Saving...' : 'Create Entry'}</span>
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="btn-pill btn-pill-secondary">
            Cancel
          </button>
        </div>
      </PageHeader>

      {error && (
        <div role="alert" className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-red-400 text-[20px]" aria-hidden="true">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Choose a type, then a template; the rest of the form fills from it */}
      <section className="glass-panel rounded-2xl p-6 space-y-6">
          <EntryTypeSelector value={formData.type} onChange={handleTypeChange} label="Type" />
          <TemplatePicker
            templates={templates}
            selectedId={formData.content.templateId}
            onSelect={handleTemplateSelect}
            disabled={loading || templatesLoading}
          />
          {templatesFailed && (
            <p className="text-sm text-amber-400">Templates could not be loaded. You can still add details yourself.</p>
          )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
        {/* Sidebar: image, then details (same boxes as EntrySidebar) */}
        <aside className="order-2 lg:order-1 space-y-6" aria-label="Entry details">
          <div>
            {/* The image box itself shows what this is; the label is for screen readers. */}
            <label htmlFor="entry-image-upload" className="sr-only">
              Entry image
            </label>

            {/* Hidden file input permanently mounted in the DOM */}
            <input
              ref={fileInputRef}
              type="file"
              id="entry-image-upload"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />

            {imagePreview ? (
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Entry preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-pill btn-pill-secondary"
                    title="Change Image"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">cached</span>
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-pill btn-pill-danger"
                    title="Remove Image"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="aspect-[3/4] w-full rounded-2xl bg-black/40 border border-dashed border-white/15 hover:border-primary/50 hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">add_photo_alternate</span>
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                    Upload an image
                  </p>
                  <p className="text-xs text-white/35 mt-0.5">
                    JPEG, PNG, GIF, WebP (max {MEDIA_CONSTRAINTS.MAX_SIZE_LABEL})
                  </p>
                </div>
              </div>
            )}
            {errors.image && <p className="field-error">{errors.image}</p>}
          </div>

          <section className="glass-panel rounded-2xl p-5">
            <h2 className="section-heading mb-4">Details</h2>
            <DetailsEditor
              details={formData.content.details}
              onChange={handleDetailsChange}
              disabled={loading || templatesLoading}
            />
            {errors.details && <p className="field-error mt-3">{errors.details}</p>}
          </section>
        </aside>

        {/* Main column: name, aliases, tags, then the tabs */}
        <div className="order-1 lg:order-2 space-y-8 min-w-0">
          <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <label htmlFor="name" className="field-label">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                aria-invalid={!!errors.name}
                className="field-input text-lg font-semibold"
                placeholder="Enter entry name"
                disabled={loading}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="aliases" className="field-label">Aliases</label>
              <TagInput
                id="aliases"
                tags={formData.aliases}
                onChange={(aliases) => setFormData(prev => ({ ...prev, aliases }))}
                placeholder="Other names, nicknames, titles..."
                maxLength={100}
                itemLabel={{ singular: 'Alias', plural: 'aliases' }}
              />
            </div>

            <div>
              <label htmlFor="tags" className="field-label">Tags</label>
              <TagInput
                id="tags"
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              />
            </div>
          </section>

          <EntryTabs
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                content: (
                  <div className="glass-panel rounded-2xl p-6">
                    <label htmlFor="description" className="field-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={12}
                      className="field-input text-sm leading-relaxed resize-y"
                      placeholder="Who or what is this? The main lore text..."
                      disabled={loading}
                    />
                  </div>
                ),
              },
              {
                id: 'notes',
                label: 'Notes',
                content: (
                  // Same amber panel as the Notes tab on the entry page.
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <label
                      htmlFor="notes"
                      className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">lock</span>
                      Private notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={12}
                      className="w-full px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 hover:border-amber-500/30 focus:outline-none focus:border-amber-400/50 focus:ring-[3px] focus:ring-amber-400/10 transition-all resize-y italic text-sm leading-relaxed"
                      placeholder="Thoughts, secrets, or internal reminders..."
                      disabled={loading}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </form>
  );
}
