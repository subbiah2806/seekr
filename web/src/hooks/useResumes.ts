/**
 * useResumes Hook
 * Custom hooks for resume CRUD operations with TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:4200';

interface Resume {
  id: number;
  name: string;
  resume_json: any;
  created_at: string;
  updated_at: string;
  ttl: string;
}

interface CreateResumeRequest {
  name: string;
  resume_json: any;
}

interface UpdateResumeRequest {
  name?: string;
  resume_json?: any;
}

/**
 * Fetch all resumes
 */
async function fetchResumes(): Promise<Resume[]> {
  const response = await fetch(`${API_BASE_URL}/api/resumes?page_size=100`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch resumes' }));
    throw new Error(errorData.detail || 'Failed to fetch resumes');
  }

  const data = await response.json();
  return data.resumes || [];
}

/**
 * Fetch a single resume by ID
 */
async function fetchResumeById(id: number): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch resume' }));
    throw new Error(errorData.detail || 'Failed to fetch resume');
  }

  return response.json();
}

/**
 * Create a new resume
 */
async function createResume(data: CreateResumeRequest): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/api/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to create resume' }));
    throw new Error(errorData.detail || 'Failed to create resume');
  }

  return response.json();
}

/**
 * Update an existing resume
 */
async function updateResume(id: number, data: UpdateResumeRequest): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to update resume' }));
    throw new Error(errorData.detail || 'Failed to update resume');
  }

  return response.json();
}

/**
 * Delete a resume
 */
async function deleteResume(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete resume' }));
    throw new Error(errorData.detail || 'Failed to delete resume');
  }
}

/**
 * Set a resume as the default
 */
async function setDefaultResume(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}/set-default`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to set default resume' }));
    throw new Error(errorData.detail || 'Failed to set default resume');
  }
}

/**
 * Hook for fetching all resumes
 */
export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes,
  });
}

/**
 * Hook for fetching a single resume by ID
 */
export function useResume(id: number | undefined) {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: () => fetchResumeById(id!),
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Hook for creating a new resume
 */
export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResume,
    onSuccess: () => {
      // Invalidate resumes list to refetch
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

/**
 * Hook for updating a resume
 */
export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateResumeRequest }) =>
      updateResume(id, data),
    onSuccess: (data) => {
      // Invalidate both the resumes list and the specific resume
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume', data.id] });
    },
  });
}

/**
 * Hook for deleting a resume
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      // Invalidate resumes list to refetch
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

/**
 * Hook for setting a resume as default
 */
export function useSetDefaultResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultResume,
    onSuccess: () => {
      // Invalidate both resumes list and default_resume setting
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['setting', 'default_resume'] });
    },
  });
}
