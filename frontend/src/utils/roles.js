export const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'donor', label: 'Donor' },
  { value: 'recipient', label: 'Recipient' },
  { value: 'hospital', label: 'Hospital' },
];

export const rolePermissions = {
  admin: ['dashboard', 'donors', 'recipients', 'hospitals', 'requests', 'matching', 'analytics', 'profile'],
  donor: ['dashboard', 'profile'],
  recipient: ['dashboard', 'matching', 'profile'],
  hospital: ['dashboard', 'donors', 'recipients', 'requests', 'matching', 'profile'],
};

export const roleHomeCopy = {
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Complete system overview for donors, recipients, hospitals, requests, matching, and analytics.',
  },
  donor: {
    title: 'Donor Dashboard',
    subtitle: 'Your donor profile, eligibility status, organ availability, and transplant request updates.',
  },
  recipient: {
    title: 'Recipient Dashboard',
    subtitle: 'Your transplant requirement, urgency level, matching progress, and hospital coordination updates.',
  },
  hospital: {
    title: 'Hospital Dashboard',
    subtitle: 'Coordinate donor-recipient workflows, active requests, and matching operations for your hospital.',
  },
};

export const actionPermissions = {
  manageDonors: ['admin', 'hospital'],
  deleteDonors: ['admin'],
  manageRecipients: ['admin', 'hospital'],
  deleteRecipients: ['admin'],
  manageHospitals: ['admin'],
  deleteHospitals: ['admin'],
  manageRequests: ['admin', 'hospital'],
  deleteRequests: ['admin'],
  editOwnProfile: ['donor', 'recipient', 'hospital', 'admin'],
};

export function normalizeRole(role) {
  return String(role || '').toLowerCase();
}

export function formatRole(role) {
  const normalizedRole = normalizeRole(role);
  return roleOptions.find((option) => option.value === normalizedRole)?.label || role || 'Coordinator';
}

export function canAccess(role, permission) {
  const normalizedRole = normalizeRole(role);
  return rolePermissions[normalizedRole]?.includes(permission) || false;
}

export function canPerform(role, action) {
  const normalizedRole = normalizeRole(role);
  return actionPermissions[action]?.includes(normalizedRole) || false;
}
