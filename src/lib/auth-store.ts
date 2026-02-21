import { create } from 'zustand';
import { supabase, SUPABASE_URL } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  organization_id: string | null;
  onboarded: boolean;
  disabled: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectBinding {
  projectId: string;
  roleNames: string[];
  permissions: string[];
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  onboarded: boolean;
  organization: Organization | null;
  orgRoles: string[];
  orgPermissions: string[];
  projectBindings: ProjectBinding[];

  initialize: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  claimAccessCode: (code: string) => Promise<{ error?: string; organization?: Organization }>;
  leaveOrganization: () => Promise<{ error?: string }>;
  can: (permissionKey: string, projectId?: string) => boolean;
  hasOrgRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  profile: null,
  onboarded: false,
  organization: null,
  orgRoles: [],
  orgPermissions: [],
  projectBindings: [],

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Invalid or expired refresh token — clear stale session
        if (error) {
          console.warn('Session recovery failed, signing out:', error.message);
          await supabase.auth.signOut();
        }
        set({ loading: false });
      } else {
        set({ session, user: session.user });
        await get().refreshPermissions();
        set({ loading: false });
      }
    } catch (err) {
      console.warn('Auth init error, signing out:', err);
      await supabase.auth.signOut();
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session) {
        await get().refreshPermissions();
      } else {
        set({
          profile: null, onboarded: false, organization: null,
          orgRoles: [], orgPermissions: [], projectBindings: [],
        });
      }
    });
  },

  refreshPermissions: async () => {
    const { session } = get();
    if (!session) return;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-my-permissions`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      set({
        profile: data.profile,
        onboarded: data.onboarded,
        organization: data.organization ?? null,
        orgRoles: data.orgRoles ?? [],
        orgPermissions: data.orgPermissions ?? [],
        projectBindings: data.projectBindings ?? [],
      });
    } catch (err) {
      console.error('Failed to refresh permissions:', err);
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null, user: null, profile: null, onboarded: false,
      organization: null, orgRoles: [], orgPermissions: [], projectBindings: [],
    });
  },

  leaveOrganization: async () => {
    const { session } = get();
    if (!session) return { error: 'Not authenticated' };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/leave-organization`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? 'Failed to leave organization' };

      // Reset local state — user goes back to onboarding
      set({
        profile: get().profile ? { ...get().profile!, organization_id: null, onboarded: false } : null,
        onboarded: false,
        organization: null,
        orgRoles: [],
        orgPermissions: [],
        projectBindings: [],
      });
      return {};
    } catch {
      return { error: 'Network error' };
    }
  },

  claimAccessCode: async (code) => {
    const { session } = get();
    if (!session) return { error: 'Not authenticated' };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/claim-access-code`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? 'Failed to claim code' };
      await get().refreshPermissions();
      return { organization: data.organization };
    } catch {
      return { error: 'Network error' };
    }
  },

  can: (permissionKey, projectId) => {
    const { orgPermissions, projectBindings } = get();
    if (orgPermissions.includes(permissionKey)) return true;
    if (projectId) {
      const binding = projectBindings.find((b) => b.projectId === projectId);
      if (binding?.permissions.includes(permissionKey)) return true;
    }
    if (!projectId) {
      return projectBindings.some((b) => b.permissions.includes(permissionKey));
    }
    return false;
  },

  hasOrgRole: (roleName) => get().orgRoles.includes(roleName),
}));
