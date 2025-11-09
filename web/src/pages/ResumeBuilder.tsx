/**
 * ResumeBuilder Page
 * Main page that integrates all chatbot components with split-screen resizable layout
 */

import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { ChatInterface } from '../components/ChatBot/ChatInterface';
import { ResumePreview } from '../components/ChatBot/ResumePreview';
import { useGetSetting } from '../hooks/useUserSettings';
import type { ResumeData } from '../types/chat';

const PANEL_STORAGE_KEY = 'resume-builder-panel-sizes';

/**
 * ResumeBuilder - Main page component with resizable panels
 */
export function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Fetch saved resume from user settings
  const { data: savedResumeSetting, isLoading } = useGetSetting('resume');

  /**
   * Load saved resume on mount
   */
  useEffect(() => {
    if (savedResumeSetting?.value) {
      try {
        const parsedResume = JSON.parse(savedResumeSetting.value) as ResumeData;
        setResumeData(parsedResume);
        console.log('Loaded saved resume from settings');
      } catch (error) {
        console.error('Failed to parse saved resume:', error);
      }
    }
  }, [savedResumeSetting]);

  /**
   * Handle resume updates from AI chat
   */
  const handleResumeUpdate = useCallback((resume: ResumeData) => {
    console.log('Resume updated:', resume);
    setResumeData(resume);
  }, []);

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

  /**
   * Load panel layout from localStorage
   */
  const getDefaultLayout = useCallback((): number[] | undefined => {
    try {
      const saved = localStorage.getItem(PANEL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load panel layout:', error);
    }
    // Default: 50/50 split
    return undefined;
  }, []);

  return (
    <div className="h-screen w-full bg-background">
      {/* Mobile/Tablet: Stacked Layout (< lg breakpoint) */}
      <div className="flex h-full flex-col lg:hidden gap-0">
        {/* Chat Interface - Top */}
        <div className="flex-1 h-1/2 overflow-hidden border-b border-border">
          <ChatInterface
            onResumeUpdate={handleResumeUpdate}
            initialResume={resumeData}
            className="h-full border-none"
            isLoadingResume={isLoading}
          />
        </div>

        {/* Resume Preview - Bottom */}
        <div className="flex-1 h-1/2 overflow-hidden">
          <ResumePreview
            resume={resumeData}
            className="h-full border-none"
            isLoading={isLoading}
            savedResumeJson={savedResumeSetting?.value}
          />
        </div>
      </div>

      {/* Desktop: Resizable Panels (>= lg breakpoint) */}
      <div className="hidden lg:block h-full">
        <PanelGroup
          direction="horizontal"
          onLayout={handlePanelLayout}
          autoSaveId="resume-builder-panels"
          className="h-full"
        >
          {/* Left Panel: Chat Interface */}
          <Panel
            defaultSize={getDefaultLayout()?.[0] || 50}
            minSize={30}
            maxSize={70}
            id="chat-panel"
            order={1}
            className="h-full"
          >
            <div className="h-full overflow-hidden">
              <ChatInterface
                onResumeUpdate={handleResumeUpdate}
                initialResume={resumeData}
                className="h-full border-none"
                isLoadingResume={isLoading}
              />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="group relative w-1 bg-border transition-colors hover:bg-primary focus-visible:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {/* Grip Icon - Centered */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <div className="flex h-10 w-4 items-center justify-center rounded-sm bg-border transition-colors group-hover:bg-primary group-focus-visible:bg-primary">
                <GripVertical className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary-foreground group-focus-visible:text-primary-foreground" />
              </div>
            </div>
          </PanelResizeHandle>

          {/* Right Panel: Resume Preview */}
          <Panel
            defaultSize={getDefaultLayout()?.[1] || 50}
            minSize={30}
            maxSize={70}
            id="preview-panel"
            order={2}
            className="h-full"
          >
            <div className="h-full overflow-hidden">
              <ResumePreview
                resume={resumeData}
                className="h-full border-none"
                isLoading={isLoading}
                savedResumeJson={savedResumeSetting?.value}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ResumeBuilder;
