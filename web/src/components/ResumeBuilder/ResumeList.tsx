/**
 * ResumeList Component
 * Display list of resumes with action menu for each resume
 */

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@subbiah/reusable/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@subbiah/reusable/components/ui/dropdown-menu';
import { Button } from '@subbiah/reusable/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@subbiah/reusable/components/ui/tooltip';
import { MoreVertical, Star, Download, FileText, Edit2, Trash2, Copy } from 'lucide-react';
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
}

export function ResumeList({ onSelectResume, selectedResumeId, onRename, onDelete, onTailorResume }: ResumeListProps) {
  const { data: resumes, isLoading, error } = useResumes();
  const deleteMutation = useDeleteResume();
  const setDefaultMutation = useSetDefaultResume();
  const { data: defaultResumeSetting } = useGetSetting('default_resume');

  // Parse default resume ID from setting
  const defaultResumeId = defaultResumeSetting?.value
    ? parseInt(defaultResumeSetting.value, 10)
    : null;

  // Sort resumes: default first, then by updated_at DESC
  // MUST be called before any conditional returns (Rules of Hooks)
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to load resumes. Please try again.</p>
      </div>
    );
  }

  // Empty state
  if (!resumes || resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No resumes yet</h3>
        <p className="text-muted-foreground">Create your first resume to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        {sortedResumes.map((resume) => {
          const isSelected = selectedResumeId === resume.id;
          const isDefault = defaultResumeId === resume.id;

          return (
            <Card
              key={resume.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                isSelected ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectResume(resume)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-medium text-foreground">
                      {resume.name}
                    </CardTitle>
                    {isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Default resume</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
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
              </CardHeader>

              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(resume.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
