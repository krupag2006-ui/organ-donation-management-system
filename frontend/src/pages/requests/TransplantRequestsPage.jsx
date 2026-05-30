import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import RecordModal from '../../components/forms/RecordModal';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../context/AuthContext';
import { donorAPI, hospitalAPI, recipientAPI, transplantRequestAPI } from '../../services/api';
import { bloodGroups, requestStatuses } from '../../utils/constants';
import { canPerform } from '../../utils/roles';

const requestOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];
const emptyRequest = {
  donor: '',
  recipient: '',
  organ: '',
  bloodGroup: '',
  hospital: '',
  priority: 'Medium',
  status: 'Pending',
  scheduledDate: '',
  notes: '',
};

function entityName(entity) {
  return entity?.name || 'Unknown';
}

function normalizeRequest(request) {
  return {
    id: request._id || request.id,
    donorId: request.donor?._id || request.donor || '',
    recipientId: request.recipient?._id || request.recipient || '',
    hospitalId: request.hospital?._id || request.hospital || '',
    donor: entityName(request.donor) || request.donor,
    recipient: entityName(request.recipient) || request.recipient,
    hospital: entityName(request.hospital) || request.hospital,
    organ: request.organ,
    bloodGroup: request.bloodGroup || '',
    priority: request.priority || 'Medium',
    status: request.status || 'Pending',
    scheduledDate: request.scheduledDate ? request.scheduledDate.slice(0, 10) : '',
    notes: request.notes || '',
  };
}

function normalizeOption(record) {
  return {
    id: record._id || record.id,
    name: record.name,
    organ: record.organs?.[0] || record.organNeeded || record.organ || '',
    bloodGroup: record.bloodGroup || '',
  };
}

function toRequestPayload(formData, editingId) {
  const updatePayload = {
    priority: formData.priority,
    status: formData.status,
    scheduledDate: formData.scheduledDate || undefined,
    notes: formData.notes,
  };

  if (editingId) {
    return updatePayload;
  }

  return {
    donor: formData.donor,
    recipient: formData.recipient,
    hospital: formData.hospital,
    organ: formData.organ,
    bloodGroup: formData.bloodGroup,
    ...updatePayload,
  };
}

function TransplantRequestsPage() {
  const { user } = useAuth();
  const canManage = canPerform(user?.role, 'manageRequests');
  const canDelete = canPerform(user?.role, 'deleteRequests');
  const [records, setRecords] = useState([]);
  const [donorOptions, setDonorOptions] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [formData, setFormData] = useState(emptyRequest);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [requestsResponse, donorsResponse, recipientsResponse, hospitalsResponse] = await Promise.all([
          transplantRequestAPI.list(),
          donorAPI.list(),
          recipientAPI.list(),
          hospitalAPI.list(),
        ]);
        setRecords((requestsResponse.data.data || []).map(normalizeRequest));
        setDonorOptions((donorsResponse.data.data || []).map(normalizeOption));
        setRecipientOptions((recipientsResponse.data.data || []).map(normalizeOption));
        setHospitalOptions((hospitalsResponse.data.hospitals || []).map(normalizeOption));
      } catch (err) {
        setError(err.message || 'Unable to load transplant requests from MongoDB.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === 'donor') {
        const donor = donorOptions.find((item) => item.id === value);
        if (donor) {
          next.organ = donor.organ;
          next.bloodGroup = donor.bloodGroup;
        }
      }
      if (name === 'recipient') {
        const recipient = recipientOptions.find((item) => item.id === value);
        if (recipient && !next.organ) next.organ = recipient.organ;
        if (recipient && !next.bloodGroup) next.bloodGroup = recipient.bloodGroup;
      }
      return next;
    });
  };
  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyRequest);
  };
  const openEdit = (request) => {
    setEditingId(request.id);
    setFormData({
      donor: request.donorId,
      recipient: request.recipientId,
      hospital: request.hospitalId,
      organ: request.organ,
      bloodGroup: request.bloodGroup,
      priority: request.priority,
      status: request.status,
      scheduledDate: request.scheduledDate,
      notes: request.notes,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = toRequestPayload(formData, editingId);
      if (editingId) {
        const { data } = await transplantRequestAPI.update(editingId, payload);
        setRecords((current) => current.map((item) => (item.id === editingId ? normalizeRequest(data.data) : item)));
      } else {
        const { data } = await transplantRequestAPI.create(payload);
        setRecords((current) => [normalizeRequest(data.data), ...current]);
      }
    } catch (err) {
      setError(err.message || 'Unable to save transplant request. Donor, recipient, organ, and blood group must match.');
    }
  };
  const handleDelete = async (id) => {
    setError('');
    try {
      await transplantRequestAPI.remove(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete transplant request.');
    }
  };

  const columns = [
    { key: 'donor', label: 'Donor' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'organ', label: 'Organ' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const fields = [
    { name: 'donor', label: 'Donor', type: 'select', options: donorOptions.map((donor) => ({ value: donor.id, label: donor.name })), required: true },
    { name: 'recipient', label: 'Recipient', type: 'select', options: recipientOptions.map((recipient) => ({ value: recipient.id, label: recipient.name })), required: true },
    { name: 'organ', label: 'Organ', type: 'select', options: requestOrgans, required: true, className: 'col-md-6' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroups, required: true, className: 'col-md-6' },
    { name: 'hospital', label: 'Hospital', type: 'select', options: hospitalOptions.map((hospital) => ({ value: hospital.id, label: hospital.name })), required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true, className: 'col-md-6' },
    { name: 'status', label: 'Status', type: 'select', options: requestStatuses, required: true, className: 'col-md-6' },
    { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', className: 'col-md-6' },
    { name: 'notes', label: 'Notes' },
  ];

  return (
    <>
      <PageHeader
        title="Transplant Requests"
        subtitle={canDelete ? 'Monitor active donor-recipient transplant workflows and approvals.' : 'Create and update transplant workflows for your hospital.'}
        action={canManage && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#requestModal" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>New Request</button>}
      />
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-warning">{error}</div>}
          <DataTable
            columns={columns}
            data={records}
            actions={canManage ? (row) => (
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#requestModal" onClick={() => openEdit(row)}><i className="bi bi-pencil"></i></button>
                {canDelete && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>}
              </div>
            ) : null}
          />
          {loading && <p className="text-secondary small mt-3 mb-0">Loading transplant requests from MongoDB...</p>}
        </div>
      </div>
      {canManage && <RecordModal id="requestModal" title={editingId ? 'Edit Request Status' : 'New Transplant Request'} fields={fields} formData={formData} onChange={handleChange} onSubmit={handleSubmit} submitLabel={editingId ? 'Update Request' : 'Create Request'} />}
    </>
  );
}

export default TransplantRequestsPage;
