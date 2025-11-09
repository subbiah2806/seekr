import { memo, useState } from 'react';
import { FileText, Copy, Check, Eye, Code as CodeIcon, Save, Trash2, Download } from 'lucide-react';
import { Card } from '@subbiah/reusable/components/ui/card';
import { Button } from '@subbiah/reusable/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@subbiah/reusable/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@subbiah/reusable/components/ui/dropdown-menu';
import DataFetchWrapper from '@subbiah/reusable/components/DataFetchWrapper';
import type { ResumeData } from '../../types/chat';
import { useSaveSetting, useDeleteSetting } from '../../hooks/useUserSettings';
import { generateResumeDocx, generateResumePdf } from '@subbiah/reusable/lib/generateResume/index';
import { ResumeHeader } from './ResumeHeader';
import { ExperienceSection } from './ExperienceSection';
import { SkillsSection } from './SkillsSection';
import { EducationSection } from './EducationSection';

interface ResumePreviewProps {
  resume: ResumeData | null;
  className?: string;
  viewMode?: 'formatted' | 'json';
  onViewModeChange?: (mode: 'formatted' | 'json') => void;
  isLoading?: boolean;
  savedResumeJson?: string;
}

function ResumePreviewComponent({
  resume,
  className = '',
  viewMode: externalViewMode,
  onViewModeChange,
  isLoading = false,
  savedResumeJson,
}: ResumePreviewProps) {
  const [internalViewMode, setInternalViewMode] = useState<'formatted' | 'json'>('formatted');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const viewMode = externalViewMode ?? internalViewMode;
  const isControlled = externalViewMode !== undefined;

  const saveMutation = useSaveSetting();
  const deleteMutation = useDeleteSetting();

  // Check if current resume matches saved resume
  const currentResumeJson = resume ? JSON.stringify(resume, null, 2) : null;
  const isResumeUnchanged = currentResumeJson === savedResumeJson;

  const handleViewModeToggle = () => {
    const newMode = viewMode === 'formatted' ? 'json' : 'formatted';
    if (isControlled) {
      onViewModeChange?.(newMode);
    } else {
      setInternalViewMode(newMode);
    }
  };

  const handleCopyJson = async () => {
    if (!resume) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy JSON:', error);
    }
  };

  const handleSaveResume = async () => {
    if (!resume) return;

    try {
      await saveMutation.mutateAsync({
        name: 'resume',
        value: JSON.stringify(resume, null, 2),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  };

  const handleDeleteResume = async () => {
    if (!savedResumeJson) {
      alert('No saved resume to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete your saved resume? This cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync('resume');
        // Optionally refresh the page or update state
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete resume:', error);
        alert('Failed to delete resume. Please try again.');
      }
    }
  };

  const handleDownloadDocx = async () => {
    if (!resume) return;

    try {
      const blob = await generateResumeDocx(resume);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.firstName}_${resume.lastName}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download DOCX:', error);
      alert('Failed to download resume as DOCX. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!resume) return;

    try {
      const blob = await generateResumePdf(resume);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.firstName}_${resume.lastName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download resume as PDF. Please try again.');
    }
  };

  return (
    <Card className={`flex h-full flex-col bg-card ${className}`}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
          Resume Preview
        </h2>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveResume}
              disabled={!resume || saveMutation.isPending || isResumeUnchanged}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Save resume to settings"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{saveMutation.isPending ? 'Saving...' : 'Save'}</span>
                </>
              )}
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!resume}
                  className="gap-2"
                  aria-label="Download resume"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadDocx}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteResume}
                  disabled={deleteMutation.isPending || !savedResumeJson}
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete resume"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete resume</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  disabled={!resume}
                  className="gap-2"
                  aria-label="Copy JSON"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy JSON</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewModeToggle}
                  disabled={!resume}
                  aria-label={`Switch to ${viewMode === 'formatted' ? 'JSON' : 'formatted'} view`}
                >
                  {viewMode === 'formatted' ? (
                    <CodeIcon className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{viewMode === 'formatted' ? 'Switch to JSON' : 'Switch to Formatted'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content */}
          <DataFetchWrapper
            isLoading={isLoading}
            isEmpty={!resume}
            loadingMessage="Loading Resume..."
            emptyTitle="No Resume Data"
            emptyMessage="Upload a resume or chat to get started"
            emptyIcon={<Eye className="h-16 w-16 text-muted-foreground" aria-hidden="true" />}
            className="h-full flex items-center justify-center"
          >
            <div className="flex-1 overflow-y-auto p-6 w-full">
              {resume && (viewMode === 'formatted' ? (
                <FormattedView resume={resume} />
              ) : (
                <JsonView resume={resume} />
              ))}
            </div>
          </DataFetchWrapper>
    </Card>
  );
}

const FormattedView = memo(({ resume }: { resume: ResumeData }) => (
  <article className="space-y-8">
    <ResumeHeader resume={resume} />
    <ExperienceSection experience={resume.experience} />
    <SkillsSection skills={resume.skills} />
    <EducationSection education={resume.education} />
  </article>
));
FormattedView.displayName = 'FormattedView';

const JsonView = memo(({ resume }: { resume: ResumeData }) => (
  <div className="rounded-md border border-border bg-muted p-4">
    <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
      <code>{JSON.stringify(resume, null, 2)}</code>
    </pre>
  </div>
));
JsonView.displayName = 'JsonView';

export const ResumePreview = memo(ResumePreviewComponent);
export default ResumePreview;
