/**
 * ResumeList Component
 * Display list of resumes with action menu for each resume
 */

import { useMemo, useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@subbiah/reusable/components/ui/dropdown-menu';
import { Button } from '@subbiah/reusable/components/ui/button';
import { Input } from '@subbiah/reusable/components/ui/input';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@subbiah/reusable/components/ui/tooltip';
import { MoreVertical, Star, Download, FileText, Edit2, Trash2, Copy, Plus, Search } from 'lucide-react';
import { generateResumePdf, generateResumeDocx } from '@subbiah/reusable/lib/generateResume/index';
import { useResumes, useDeleteResume, useSetDefaultResume } from '../../hooks/useResumes';
import { useGetSetting } from '../../hooks/useUserSettings';

interface Resume {
  id: number;
  name: string;
  resume_json: any;
  created_at: string;
  updated_at: string;
  ttl: string;
}

interface ResumeListProps {
  onSelectResume: (resume: Resume) => void;
  selectedResumeId?: number;
  onRename: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onTailorResume: (resume: Resume) => void;
  onNewResume: () => void;
}

export function ResumeList({ onSelectResume, selectedResumeId, onRename, onDelete, onTailorResume, onNewResume }: ResumeListProps) {
  const [searchInput, setSearchInput] = useState(''); // User input
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced value for API

  const { data: resumes, isLoading, error } = useResumes(debouncedSearch);
  const deleteMutation = useDeleteResume();
  const setDefaultMutation = useSetDefaultResume();
  const { data: defaultResumeSetting } = useGetSetting('default_resume');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Parse default resume ID from setting
  const defaultResumeId = defaultResumeSetting?.value
    ? parseInt(defaultResumeSetting.value, 10)
    : null;

  // Sort resumes: default first, then by updated_at DESC
  // API already filters by name, we just need to sort
  const sortedResumes = useMemo(() => {
    if (!resumes) return [];

    return [...resumes].sort((a, b) => {
      // Default resume always first
      if (a.id === defaultResumeId) return -1;
      if (b.id === defaultResumeId) return 1;

      // Then sort by updated_at DESC (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [resumes, defaultResumeId]);

  const handleDownloadPdf = async (resume: Resume) => {
    try {
      const blob = await generateResumePdf(resume.resume_json);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download resume as PDF. Please try again.');
    }
  };

  const handleDownloadDocx = async (resume: Resume) => {
    try {
      const blob = await generateResumeDocx(resume.resume_json);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.name.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download DOCX:', error);
      alert('Failed to download resume as DOCX. Please try again.');
    }
  };

  const handleSetDefault = async (resumeId: number) => {
    try {
      await setDefaultMutation.mutateAsync(resumeId);
    } catch (error) {
      console.error('Failed to set default resume:', error);
      alert('Failed to set default resume. Please try again.');
    }
  };

  const handleDelete = (resume: Resume) => {
    // Parent will handle confirmation dialog and deletion
    onDelete(resume);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-border px-6 py-4 min-h-[65px]">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          My Resumes
        </h2>
      </div>

      {/* New Resume Button */}
      <div className="px-4 py-3">
        <Button onClick={onNewResume} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Resume
        </Button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resumes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Resume List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground text-sm">Loading resumes...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center p-8">
            <p className="text-destructive text-sm">Failed to load resumes. Please try again.</p>
          </div>
        )}

        {/* Empty state - no resumes at all */}
        {!isLoading && !error && (!resumes || resumes.length === 0) && !debouncedSearch && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-sm font-semibold text-foreground">No resumes yet</h3>
            <p className="text-xs text-muted-foreground">Create your first resume to get started!</p>
          </div>
        )}

        {/* Empty state - no search results */}
        {!isLoading && !error && (!resumes || resumes.length === 0) && debouncedSearch && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-sm font-semibold text-foreground">No matches found</h3>
            <p className="text-xs text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {/* Resume list */}
        {!isLoading && !error && sortedResumes.length > 0 && (
          <div className="space-y-1">
            <TooltipProvider>
              {sortedResumes.map((resume) => {
                const isSelected = selectedResumeId === resume.id;
                const isDefault = defaultResumeId === resume.id;

                return (
            <div
              key={resume.id}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50 ${
                isSelected ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectResume(resume)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isDefault && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Default resume</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <p className="text-sm font-medium text-foreground truncate">
                  {resume.name}
                </p>
              </div>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(resume.id);
                    }}
                    disabled={setDefaultMutation.isPending}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Set as Default
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPdf(resume);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadDocx(resume);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download as DOCX
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTailorResume(resume);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Tailor Resume
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(resume);
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resume);
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      )}
    </div>
  </>
  );
}
