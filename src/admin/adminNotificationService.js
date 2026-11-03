import {
  getAdminPendingPlaceMedia,
  getAdminPendingPlaces,
  getMyRole,
} from './adminService';
import { getAdminContentItems } from '../governance/contentGovernanceService';
import { getAdminProfessionalApplications } from '../services/professionalAccessService';

export async function getAdminNotificationSummary(userId) {
  const empty = {
    isAdmin: false,
    total: 0,
    pendingPlaces: 0,
    pendingMedia: 0,
    pendingContent: 0,
    pendingApplications: 0,
  };

  if (!userId) {
    return { data: empty, error: null };
  }

  const roleResult = await getMyRole(userId);

  if (roleResult.error || roleResult.data?.role !== 'admin') {
    return { data: empty, error: roleResult.error ?? null };
  }

  const [
    placesResult,
    mediaResult,
    contentResult,
    applicationsResult,
  ] = await Promise.all([
    getAdminPendingPlaces(),
    getAdminPendingPlaceMedia(),
    getAdminContentItems({ status: 'pending' }),
    getAdminProfessionalApplications('pending'),
  ]);

  const pendingPlaces = placesResult.error ? 0 : placesResult.data?.length ?? 0;
  const pendingMedia = mediaResult.error ? 0 : mediaResult.data?.length ?? 0;
  const pendingContent = contentResult.error ? 0 : contentResult.data?.length ?? 0;
  const pendingApplications = applicationsResult.error
    ? 0
    : applicationsResult.data?.length ?? 0;

  return {
    data: {
      isAdmin: true,
      total:
        pendingPlaces +
        pendingMedia +
        pendingContent +
        pendingApplications,
      pendingPlaces,
      pendingMedia,
      pendingContent,
      pendingApplications,
    },
    error:
      placesResult.error ||
      mediaResult.error ||
      contentResult.error ||
      applicationsResult.error ||
      null,
  };
}
