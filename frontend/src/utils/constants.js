export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const organs = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];
export const requestStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

export const statusClassMap = {
  Pending: 'text-bg-warning',
  Approved: 'text-bg-info',
  Matched: 'text-bg-primary',
  Completed: 'text-bg-success',
  Rejected: 'text-bg-danger',
  Cancelled: 'text-bg-secondary',
  Waiting: 'text-bg-warning',
  Transplanted: 'text-bg-success',
  Inactive: 'text-bg-secondary',
  Available: 'text-bg-success',
  Unavailable: 'text-bg-secondary',
  'Under Review': 'text-bg-warning',
  Verified: 'text-bg-success',
  Critical: 'text-bg-danger',
  High: 'text-bg-orange',
  Medium: 'text-bg-warning',
  Low: 'text-bg-secondary',
};
