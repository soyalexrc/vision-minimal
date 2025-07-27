import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { endpoints } from '../lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        name: string;
        colorName: string;
      };
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    priority: {
      name: string;
      iconUrl: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    created: string;
    updated: string;
    description?: any;
  };
}

export interface JiraIssueDetail {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
      iconUrl: string;
      description: string;
      subtask: boolean;
    };
    created: string;
    updated: string;
    description?: {
      type: string;
      version: number;
      content: Array<{
        type: string;
        content?: Array<{
          type: string;
          text?: string;
          marks?: Array<{
            type: string;
            attrs?: any;
          }>;
        }>;
        attrs?: any;
      }>;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
      };
      accountType: string;
      timeZone: string;
    };
    priority: {
      name: string;
      iconUrl: string;
      id: string;
    };
    status: {
      name: string;
      description: string;
      statusCategory: {
        name: string;
        colorName: string;
        key: string;
      };
    };
    comment?: {
      comments: any[];
      total: number;
    };
  };
}

interface ApiResponse {
  success: boolean;
  issues: JiraIssue[];
  total: number;
  error?: string;
  sprint?: any;
}

interface IssueDetailResponse {
  success: boolean;
  issue?: JiraIssueDetail;
  error?: string;
}

interface JiraFilters {
  statusFilter: string;
}
// ----------------------------------------------------------------------

const jiraFetcher = async (url: string): Promise<ApiResponse> => {
  const response = await axios.get(url);
  return response.data;
};

const issueDetailFetcher = async (url: string): Promise<IssueDetailResponse> => {
  const response = await axios.get(url);
  return response.data;
};

// ----------------------------------------------------------------------

export function useGetJiraBacklog() {
  const url = endpoints.scrum.issuesOnBacklog;

  const { data, isLoading, error, isValidating } = useSWR<ApiResponse>(
    url,
    jiraFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      backlogIssues: data?.issues || [],
      backlogLoading: isLoading,
      backlogError: error,
      backlogValidating: isValidating,
      backlogEmpty: !isLoading && !isValidating && !data?.issues?.length,
      backlogCount: data?.total || 0,
      refreshBacklog: () => mutate(url),
    }),
    [data, error, isLoading, isValidating, url]
  );

  return memoizedValue;
}

export function useGetJiraSprint() {
  const url = endpoints.scrum.issuesOnCurrentSprint;

  const { data, isLoading, error, isValidating } = useSWR<ApiResponse>(
    url,
    jiraFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      sprintIssues: data?.issues || [],
      sprintLoading: isLoading,
      sprintError: error,
      sprintValidating: isValidating,
      sprintEmpty: !isLoading && !isValidating && !data?.issues?.length,
      sprintCount: data?.total || 0,
      currentSprint: data?.sprint,
      refreshSprint: () => mutate(url),
    }),
    [data, error, isLoading, isValidating, url]
  );

  return memoizedValue;
}

export function useGetJiraIssues(filters: JiraFilters) {
  const { statusFilter } = filters;
  const statusParam = statusFilter ? `?status=${statusFilter}` : '';
  const url = `${endpoints.scrum.issues}${statusParam}`;

  const { data, isLoading, error, isValidating } = useSWR<ApiResponse>(
    url,
    jiraFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      allIssues: data?.issues || [],
      allIssuesLoading: isLoading,
      allIssuesError: error,
      allIssuesValidating: isValidating,
      allIssuesEmpty: !isLoading && !isValidating && !data?.issues?.length,
      allIssuesCount: data?.total || 0,
      refreshAllIssues: () => mutate(url),
    }),
    [data, error, isLoading, isValidating, url]
  );

  return memoizedValue;
}

// Hook to get individual issue details
export function useGetIssue(issueKey: string | null) {
  const url = issueKey ? endpoints.scrum.getIssue(issueKey) : null;

  const { data, isLoading, error, isValidating } = useSWR<IssueDetailResponse>(
    url,
    issueDetailFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      issue: data?.issue || null,
      issueLoading: isLoading,
      issueError: error,
      issueValidating: isValidating,
      refreshIssue: () => url && mutate(url),
    }),
    [data, error, isLoading, isValidating, url]
  );

  return memoizedValue;
}

// Utility function to refresh all Jira data
export const refreshAllJiraData = (filters?: JiraFilters) => {
  // Refresh backlog
  mutate(endpoints.scrum.issuesOnBacklog);

  // Refresh sprint
  mutate(endpoints.scrum.issuesOnCurrentSprint);

  // Refresh all issues with filters
  if (filters) {
    const statusParam = filters.statusFilter ? `?status=${filters.statusFilter}` : '';
    mutate(`${endpoints.scrum.issues}${statusParam}`);
  } else {
    mutate(endpoints.scrum.issues);
  }
};
