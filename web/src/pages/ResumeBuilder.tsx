/**
 * ResumeBuilder Page
 * Main page that integrates all chatbot components with split-screen resizable layout
 *
 * Architecture:
 * - selectedResume: ID of the currently selected resume (undefined for new resume)
 * - pageData: { chatMessages, resume } - Current working state
 * - Chat updates pageData.chatMessages and pageData.resume
 * - All buttons and actions operate on pageData and selectedResume
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical, Menu } from 'lucide-react';
import { ChatInterface } from '../components/ChatBot/ChatInterface';
import { ResumePreview } from '../components/ChatBot/ResumePreview';
import { ResumeList } from '../components/ResumeBuilder/ResumeList';
import { ResumeNameModal } from '../components/ResumeBuilder/ResumeNameModal';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@subbiah/reusable/components/ui/sheet';
import { Button } from '@subbiah/reusable/components/ui/button';
import {
  useResumes,
  useResume,
  useCreateResume,
  useUpdateResume,
  useSetDefaultResume,
  useDeleteResume
} from '../hooks/useResumes';
import { useGetSetting, useDeleteSetting } from '../hooks/useUserSettings';
import type { ResumeData, ChatMessage } from '../types/chat';

const PANEL_STORAGE_KEY = 'resume-builder-panel-sizes';
const CHAT_STORAGE_PREFIX = 'resumeAssistant_';

interface Resume {
  id: number;
  name: string;
  resume_json: ResumeData;
  created_at: string;
  updated_at: string;
  ttl: string;
}

interface PageData {
  chatMessages: ChatMessage[];
  resume: ResumeData | null;
}

/**
 * Save chat messages to localStorage for a specific resume
 */
const saveChatToLocalStorage = (resumeId: number, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(`${CHAT_STORAGE_PREFIX}${resumeId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat:', error);
  }
};

/**
 * Load chat messages from localStorage for a specific resume
 */
const loadChatFromLocalStorage = (resumeId: number): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${resumeId}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load chat:', error);
    return [];
  }
};

/**
 * Delete chat messages from localStorage for a specific resume
 */
const deleteChatFromLocalStorage = (resumeId: number) => {
  try {
    localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${resumeId}`);
  } catch (error) {
    console.error('Failed to delete chat:', error);
  }
};

/**
 * ResumeBuilder - Main page component with resizable panels
 */
export function ResumeBuilder() {
  // Core state
  const [selectedResume, setSelectedResume] = useState<number | undefined>(undefined);
  const [pageData, setPageData] = useState<PageData>({
    chatMessages: [],
    resume: null,
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Resume | undefined>();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // API hooks
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: defaultResumeSetting, isLoading: settingLoading } = useGetSetting('default_resume');
  const createResumeMutation = useCreateResume();
  const updateResumeMutation = useUpdateResume();
  const setDefaultMutation = useSetDefaultResume();
  const deleteMutation = useDeleteResume();
  const deleteSettingMutation = useDeleteSetting();

  // Fetch selected resume data when selectedResume changes
  const { data: selectedResumeData, isLoading: selectedResumeLoading } = useResume(selectedResume);

  // Combined loading state
  const isInitialLoading = resumesLoading || settingLoading;

  /**
   * Initialize: Auto-load resume on mount
   * Priority: 1) URL query param (?selectedResume=123), 2) Default resume setting
   * Only runs once after resumes and settings are loaded
   */
  useEffect(() => {
    if (!hasInitialized && !isInitialLoading) {
      // Check for URL query parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const urlResumeId = urlParams.get('selectedResume');

      if (urlResumeId) {
        // Use resume ID from URL
        const resumeId = parseInt(urlResumeId, 10);
        if (!isNaN(resumeId)) {
          setSelectedResume(resumeId);
          setHasInitialized(true);
          return;
        }
      }

      // Fall back to default resume if no valid URL param
      const defaultResumeId = defaultResumeSetting?.value
        ? parseInt(defaultResumeSetting.value, 10)
        : undefined;

      if (defaultResumeId) {
        setSelectedResume(defaultResumeId);
      }

      setHasInitialized(true);
    }
  }, [hasInitialized, isInitialLoading, defaultResumeSetting]);

  /**
   * Load resume data when selectedResumeData changes
   * This runs when useResume successfully fetches the resume
   */
  useEffect(() => {
    if (selectedResume && selectedResumeData) {
      const chatMessages = loadChatFromLocalStorage(selectedResume);
      setPageData({
        chatMessages,
        resume: selectedResumeData.resume_json,
      });
    }
  }, [selectedResume, selectedResumeData]);

  /**
   * Calculate if resume has unsaved changes
   * Returns true if:
   * 1. New resume with data: selectedResume === undefined && pageData.resume !== null
   * 2. Existing resume modified: selectedResume !== undefined && pageData.resume !== selectedResumeData.resume_json
   */
  const isEdited = useMemo(() => {
    // Case 1: New resume with data (unsaved)
    if (selectedResume === undefined && pageData.resume !== null) {
      return true;
    }

    // Case 2: Existing resume with changes
    if (selectedResume !== undefined && selectedResumeData && pageData.resume !== null) {
      const currentResumeJson = JSON.stringify(pageData.resume);
      const fetchedResumeJson = JSON.stringify(selectedResumeData.resume_json);
      return currentResumeJson !== fetchedResumeJson;
    }

    return false;
  }, [selectedResume, pageData.resume, selectedResumeData]);

  /**
   * Handle resume updates from AI chat
   */
  const handleResumeUpdate = useCallback((resume: ResumeData) => {
    setPageData((prev) => ({
      ...prev,
      resume,
    }));
  }, []);

  /**
   * Handle chat messages updates
   */
  const handleMessagesChange = useCallback((messages: ChatMessage[]) => {
    setPageData((prev) => ({
      ...prev,
      chatMessages: messages,
    }));
  }, []);

  /**
   * Handle AI response received - save chat to localStorage
   */
  const handleAiResponseReceived = useCallback(() => {
    if (selectedResume) {
      saveChatToLocalStorage(selectedResume, pageData.chatMessages);
    }
  }, [selectedResume, pageData.chatMessages]);

  /**
   * Handle resume selection from list
   * Sets selectedResume ID and updates URL query parameter
   */
  const handleSelectResume = useCallback((resume: Resume) => {
    setSelectedResume(resume.id);

    // Update URL query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('selectedResume', resume.id.toString());
    window.history.pushState({}, '', url.toString());
  }, []);

  /**
   * Handle "Tailor Resume" from dropdown
   * Creates a new unsaved resume with existing resume data
   */
  const handleTailorResume = useCallback((resume: Resume) => {
    setSelectedResume(undefined);
    setPageData({
      chatMessages: [],
      resume: resume.resume_json,
    });

    // Remove selectedResume query parameter for new resume
    const url = new URL(window.location.href);
    url.searchParams.delete('selectedResume');
    window.history.pushState({}, '', url.toString());
  }, []);

  /**
   * Handle new resume button click
   * Clears everything to create a fresh resume
   */
  const handleNewResume = useCallback(() => {
    setSelectedResume(undefined);
    setPageData({
      chatMessages: [],
      resume: null,
    });

    // Remove selectedResume query parameter for new resume
    const url = new URL(window.location.href);
    url.searchParams.delete('selectedResume');
    window.history.pushState({}, '', url.toString());
  }, []);

  /**
   * Handle open rename modal
   */
  const handleOpenRenameModal = useCallback((resume: Resume) => {
    setRenameTarget(resume);
    setShowNameModal(true);
  }, []);

  /**
   * Handle save button click
   * Opens modal for Save As (new resume) or updates existing resume
   */
  const handleSaveClick = useCallback(async () => {
    if (!pageData.resume) return;

    if (selectedResume) {
      // Update existing resume
      try {
        await updateResumeMutation.mutateAsync({
          id: selectedResume,
          data: { resume_json: pageData.resume },
        });

        // Save chat to localStorage
        saveChatToLocalStorage(selectedResume, pageData.chatMessages);
      } catch (error) {
        console.error('Failed to save resume:', error);
        alert('Failed to save resume. Please try again.');
      }
    } else {
      // Show modal for new resume
      setShowNameModal(true);
    }
  }, [selectedResume, pageData, updateResumeMutation]);

  /**
   * Handle save with name (for new resume or rename)
   */
  const handleSaveWithName = useCallback(
    async (name: string) => {
      if (renameTarget) {
        // Rename existing resume
        try {
          await updateResumeMutation.mutateAsync({
            id: renameTarget.id,
            data: { name },
          });
          setRenameTarget(undefined);
        } catch (error) {
          console.error('Failed to rename resume:', error);
          alert('Failed to rename resume. Please try again.');
        }
      } else {
        // Create new resume
        try {
          const newResume = await createResumeMutation.mutateAsync({
            name,
            resume_json: pageData.resume || ({} as ResumeData),
          });

          // If first resume, set as default
          if (!resumes || resumes.length === 0) {
            await setDefaultMutation.mutateAsync(newResume.id);
          }

          // Save chat to localStorage
          saveChatToLocalStorage(newResume.id, pageData.chatMessages);

          // Set as selected resume
          setSelectedResume(newResume.id);

          // Update URL query parameter
          const url = new URL(window.location.href);
          url.searchParams.set('selectedResume', newResume.id.toString());
          window.history.pushState({}, '', url.toString());

          console.log('Created new resume:', newResume.name);
        } catch (error) {
          console.error('Failed to create resume:', error);
          alert('Failed to create resume. Please try again.');
        }
      }

      setShowNameModal(false);
    },
    [renameTarget, pageData, resumes, createResumeMutation, updateResumeMutation, setDefaultMutation]
  );

  /**
   * Handle resume deletion
   * Clears state after successful deletion
   * Also removes default_resume setting if this was the default
   */
  const handleDeleteResume = useCallback(
    async (resume: Resume) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${resume.name}"? This action cannot be undone.`
        )
      ) {
        try {
          // Check if this is the default resume
          const defaultResumeId = defaultResumeSetting?.value
            ? parseInt(defaultResumeSetting.value, 10)
            : null;
          const isDefaultResume = defaultResumeId === resume.id;

          // Delete the resume
          await deleteMutation.mutateAsync(resume.id);

          // If this was the default resume, delete the setting
          if (isDefaultResume) {
            await deleteSettingMutation.mutateAsync('default_resume');
            console.log('Removed default_resume setting');
          }

          // Delete chat from localStorage
          deleteChatFromLocalStorage(resume.id);

          // Clear state
          setSelectedResume(undefined);
          setPageData({
            chatMessages: [],
            resume: null,
          });

          // Remove selectedResume query parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('selectedResume');
          window.history.pushState({}, '', url.toString());

          console.log('Deleted resume:', resume.name);
        } catch (error) {
          console.error('Failed to delete resume:', error);
          alert('Failed to delete resume. Please try again.');
        }
      }
    },
    [deleteMutation, deleteSettingMutation, defaultResumeSetting]
  );

  /**
   * Save panel layout to localStorage
   */
  const handlePanelLayout = useCallback((sizes: number[]) => {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(sizes));
    } catch (error) {
      console.error('Failed to save panel layout:', error);
    }
  }, []);

  // Show loader until initial data is loaded
  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background">
      {/* Mobile/Tablet: Stacked Layout (< lg breakpoint) */}
      <div className="flex h-full flex-col lg:hidden gap-0">
        {/* Chat Interface - Top */}
        <div className="flex-1 h-1/2 overflow-hidden border-b border-border">
          <ChatInterface
            key={selectedResume || 'new-resume'}
            messages={pageData.chatMessages}
            onMessagesChange={handleMessagesChange}
            onResumeUpdate={handleResumeUpdate}
            onAiResponseReceived={handleAiResponseReceived}
            headerLeftElement={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSheet(true)}
                className="h-8 w-8 p-0"
                aria-label="Open resume list"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
            initialResume={pageData.resume}
            className="h-full border-none"
            isLoadingResume={selectedResumeLoading}
          />
        </div>

        {/* Resume Preview - Bottom */}
        <div className="flex-1 h-1/2 overflow-hidden">
          <ResumePreview
            resume={pageData.resume}
            className="h-full border-none"
            isLoading={selectedResumeLoading}
            onSaveAs={handleSaveClick}
            currentResumeId={selectedResume}
            hasUnsavedChanges={isEdited}
          />
        </div>
      </div>

      {/* Desktop: Three-Column Layout (>= lg breakpoint) */}
      <div className="hidden lg:flex h-full">
        {/* Left Panel: Resume List - Fixed Width */}
        <div className="w-64 h-full overflow-hidden flex flex-col bg-card border-r border-border">
          <ResumeList
            onSelectResume={handleSelectResume}
            selectedResumeId={selectedResume}
            onRename={handleOpenRenameModal}
            onDelete={handleDeleteResume}
            onTailorResume={handleTailorResume}
            onNewResume={handleNewResume}
          />
        </div>

        {/* Right Side: Chat and Preview with Resizable Panels */}
        <PanelGroup
          direction="horizontal"
          onLayout={handlePanelLayout}
          autoSaveId="resume-builder-panels"
          className="flex-1 h-full"
        >

          {/* Chat Panel */}
          <Panel
            defaultSize={50}
            minSize={30}
            maxSize={70}
            id="chat-panel"
            order={1}
            className="h-full"
          >
            <div className="h-full overflow-hidden">
              <ChatInterface
                key={selectedResume || 'new-resume'}
                messages={pageData.chatMessages}
                onMessagesChange={handleMessagesChange}
                onResumeUpdate={handleResumeUpdate}
                onAiResponseReceived={handleAiResponseReceived}
                initialResume={pageData.resume}
                className="h-full border-none"
                isLoadingResume={selectedResumeLoading}
              />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="group relative w-1 bg-border transition-colors hover:bg-primary focus-visible:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <div className="flex h-10 w-4 items-center justify-center rounded-sm bg-border transition-colors group-hover:bg-primary group-focus-visible:bg-primary">
                <GripVertical className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary-foreground group-focus-visible:text-primary-foreground" />
              </div>
            </div>
          </PanelResizeHandle>

          {/* Preview Panel */}
          <Panel
            defaultSize={50}
            minSize={30}
            maxSize={70}
            id="preview-panel"
            order={2}
            className="h-full"
          >
            <div className="h-full overflow-hidden">
              <ResumePreview
                resume={pageData.resume}
                className="h-full border-none"
                isLoading={selectedResumeLoading}
                onSaveAs={handleSaveClick}
                currentResumeId={selectedResume}
                hasUnsavedChanges={isEdited}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Resume Name Modal */}
      <ResumeNameModal
        open={showNameModal}
        onOpenChange={setShowNameModal}
        onSave={handleSaveWithName}
        initialName={renameTarget?.name}
        title={renameTarget ? 'Rename Resume' : 'Save Resume'}
      />

      {/* Mobile Resume List Sheet */}
      <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>My Resumes</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ResumeList
              onSelectResume={(resume) => {
                handleSelectResume(resume);
                setShowMobileSheet(false);
              }}
              selectedResumeId={selectedResume}
              onRename={(resume) => {
                handleOpenRenameModal(resume);
                setShowMobileSheet(false);
              }}
              onDelete={(resume) => {
                handleDeleteResume(resume);
                setShowMobileSheet(false);
              }}
              onTailorResume={(resume) => {
                handleTailorResume(resume);
                setShowMobileSheet(false);
              }}
              onNewResume={() => {
                handleNewResume();
                setShowMobileSheet(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ResumeBuilder;
