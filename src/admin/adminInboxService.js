import {
  getAdminPendingPlaceMedia,
  getAdminPendingPlaces,
  getAdminUsers,
  getMyRole,
} from './adminService';
import { getAdminContentItems } from '../governance/contentGovernanceService';
import { getAdminProfessionalApplications } from '../services/professionalAccessService';
import { supabase } from '../lib/supabase';

export async function getAdminInboxData(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  const roleResult = await getMyRole(userId);

  if (roleResult.error || roleResult.data?.role !== 'admin') {
    return { data: null, error: roleResult.error ?? null };
  }

  const [
    usersResult,
    placesResult,
    mediaResult,
    contentResult,
    applicationsResult,
    profilesResult,
  ] = await Promise.all([
    getAdminUsers(),
    getAdminPendingPlaces(),
    getAdminPendingPlaceMedia(),
    getAdminContentItems({ status: 'pending' }),
    getAdminProfessionalApplications('pending'),
    supabase
      .from('professional_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
  ]);

  const users = usersResult.error ? [] : usersResult.data ?? [];
  const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const recentUsers = users.filter((item) => {
    const time = new Date(item.created_at).getTime();
    return Number.isFinite(time) && time >= threshold;
  }).length;

  const error =
    usersResult.error ||
    placesResult.error ||
    mediaResult.error ||
    contentResult.error ||
    applicationsResult.error ||
    profilesResult.error ||
    null;

  return {
    data: {
      registeredUsers: users.length,
      recentUsers,
      pendingPlaces: placesResult.error ? 0 : placesResult.data?.length ?? 0,
      pendingMedia: mediaResult.error ? 0 : mediaResult.data?.length ?? 0,
      pendingContent: contentResult.error ? 0 : contentResult.data?.length ?? 0,
      pendingApplications: applicationsResult.error
        ? 0
        : applicationsResult.data?.length ?? 0,
      approvedProfiles: profilesResult.error ? 0 : profilesResult.count ?? 0,
    },
    error,
  };
}
