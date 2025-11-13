/**
 * useUserSettings Hook
 * Custom hook for user settings API integration
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:4200';

interface UserSetting {
  id: number;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

interface SaveSettingRequest {
  name: string;
  value: string;
}

/**
 * Save or update a user setting by name
 */
async function saveSetting(request: SaveSettingRequest): Promise<UserSetting> {
  // First, try to get existing setting by name
  try {
    const getResponse = await fetch(`${API_BASE_URL}/api/settings/name/${request.name}`);

    if (getResponse.ok) {
      // Setting exists, update it
      const existing = await getResponse.json();
      const updateResponse = await fetch(`${API_BASE_URL}/api/settings/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: request.value }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update setting');
      }

      return updateResponse.json();
    }
  } catch {
    // Setting doesn't exist, create it
  }

  // Create new setting
  const createResponse = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse
      .json()
      .catch(() => ({ detail: 'Failed to save setting' }));
    throw new Error(errorData.detail || 'Failed to save setting');
  }

  return createResponse.json();
}

/**
 * Get a user setting by name
 */
async function getSetting(name: string): Promise<UserSetting | null> {
  const response = await fetch(`${API_BASE_URL}/api/settings/name/${name}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch setting');
  }

  return response.json();
}

/**
 * Delete a user setting by name
 */
async function deleteSetting(name: string): Promise<void> {
  // First, get the setting to find its ID
  const setting = await getSetting(name);

  if (!setting) {
    throw new Error('Setting not found');
  }

  // Delete by ID
  const response = await fetch(`${API_BASE_URL}/api/settings/${setting.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete setting' }));
    throw new Error(errorData.detail || 'Failed to delete setting');
  }
}

/**
 * Hook for saving user settings
 */
export function useSaveSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSetting,
    onSuccess: (data, variables) => {
      // Invalidate the specific setting query to refetch
      queryClient.invalidateQueries({ queryKey: ['setting', variables.name] });
    },
  });
}

/**
 * Hook for getting a user setting by name
 */
export function useGetSetting(name: string, enabled = true) {
  return useQuery({
    queryKey: ['setting', name],
    queryFn: () => getSetting(name),
    enabled,
  });
}

/**
 * Hook for deleting a user setting by name
 */
export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSetting,
    onSuccess: (data, name) => {
      // Invalidate the specific setting query to refetch
      queryClient.invalidateQueries({ queryKey: ['setting', name] });
    },
  });
}
