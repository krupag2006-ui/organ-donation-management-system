require('dotenv').config();

const mongoose = require('mongoose');
const Donor = require('../models/donorModel');
const Recipient = require('../models/recipientModel');
const Hospital = require('../models/hospitalModel');
const Request = require('../models/transplantRequestModel');

const hospitalData = [
  {
    name: 'Noble Care Hospital',
    city: 'Ahmedabad',
    address: 'Navrangpura, Ahmedabad',
    contact: '9000001008',
    email: 'noble.ahmedabad@example.com',
    availableOrgans: ['Liver', 'Kidney'],
    capacity: 65,
    emergencyAvailable: false,
  },
  {
    name: 'Aster Life Hospital',
    city: 'Kochi',
    address: 'Edappally, Kochi',
    contact: '9000001009',
    email: 'aster.kochi@example.com',
    availableOrgans: ['Pancreas', 'Liver'],
    capacity: 130,
    emergencyAvailable: true,
  },
  {
    name: 'Unity Medical Centre',
    city: 'Jaipur',
    address: 'Malviya Nagar, Jaipur',
    contact: '9000001010',
    email: 'unity.jaipur@example.com',
    availableOrgans: ['Lungs', 'Heart'],
    capacity: 75,
    emergencyAvailable: true,
  },
];

const recipientData = [
  {
    name: 'Neha Kapoor',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A+',
    organNeeded: 'Cornea',
    urgencyLevel: 'Medium',
    location: 'Bangalore',
    phone: '9000003011',
    email: 'neha.kapoor@example.com',
    hospitalName: 'City Care Hospital',
    diagnosis: 'Advanced corneal scarring',
    medicalHistory: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      kidneyDisease: false,
      liverDisease: false,
      other: 'Reduced vision in right eye',
    },
    status: 'Waiting',
  },
  {
    name: 'Ramesh Gupta',
    age: 55,
    gender: 'Male',
    bloodGroup: 'B+',
    organNeeded: 'Kidney',
    urgencyLevel: 'High',
    location: 'Hyderabad',
    phone: '9000003012',
    email: 'ramesh.gupta@example.com',
    hospitalName: 'Green Cross Hospital',
    diagnosis: 'End-stage renal disease',
    medicalHistory: {
      diabetes: true,
      hypertension: true,
      heartDisease: false,
      kidneyDisease: true,
      liverDisease: false,
      other: '',
    },
    status: 'Waiting',
  },
  {
    name: 'Farah Khan',
    age: 43,
    gender: 'Female',
    bloodGroup: 'AB+',
    organNeeded: 'Pancreas',
    urgencyLevel: 'Critical',
    location: 'Mumbai',
    phone: '9000003013',
    email: 'farah.khan@example.com',
    hospitalName: 'LifeLine Medical Institute',
    diagnosis: 'Severe insulin instability',
    medicalHistory: {
      diabetes: true,
      hypertension: false,
      heartDisease: false,
      kidneyDisease: false,
      liverDisease: false,
      other: 'Frequent hypoglycemic episodes',
    },
    status: 'Waiting',
  },
  {
    name: 'Manish Shah',
    age: 50,
    gender: 'Male',
    bloodGroup: 'B-',
    organNeeded: 'Liver',
    urgencyLevel: 'High',
    location: 'Ahmedabad',
    phone: '9000003014',
    email: 'manish.shah@example.com',
    hospitalName: 'Noble Care Hospital',
    diagnosis: 'Decompensated cirrhosis',
    medicalHistory: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      kidneyDisease: false,
      liverDisease: true,
      other: '',
    },
    status: 'Waiting',
  },
  {
    name: 'Rose Mary Thomas',
    age: 47,
    gender: 'Female',
    bloodGroup: 'O+',
    organNeeded: 'Pancreas',
    urgencyLevel: 'Medium',
    location: 'Kochi',
    phone: '9000003015',
    email: 'rosemary.thomas@example.com',
    hospitalName: 'Aster Life Hospital',
    diagnosis: 'Complicated pancreatic endocrine failure',
    medicalHistory: {
      diabetes: true,
      hypertension: false,
      heartDisease: false,
      kidneyDisease: false,
      liverDisease: false,
      other: '',
    },
    status: 'Waiting',
  },
  {
    name: 'Pooja Bansal',
    age: 39,
    gender: 'Female',
    bloodGroup: 'A+',
    organNeeded: 'Lungs',
    urgencyLevel: 'Medium',
    location: 'Jaipur',
    phone: '9000003016',
    email: 'pooja.bansal@example.com',
    hospitalName: 'Unity Medical Centre',
    diagnosis: 'Progressive restrictive lung disease',
    medicalHistory: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      kidneyDisease: false,
      liverDisease: false,
      other: 'Reduced lung capacity',
    },
    status: 'Waiting',
  },
];

const requestData = [
  {
    donorName: 'Priya Nair',
    recipientName: 'Neha Kapoor',
    hospitalName: 'City Care Hospital',
    organ: 'Cornea',
    bloodGroup: 'A+',
    priority: 'Medium',
    status: 'Completed',
    scheduledDate: '2026-05-14T10:00:00.000Z',
    notes: 'Completed cornea transplant after successful tissue compatibility review.',
  },
  {
    donorName: 'Arjun',
    recipientName: 'Ramesh Gupta',
    hospitalName: 'Green Cross Hospital',
    organ: 'Kidney',
    bloodGroup: 'B+',
    priority: 'High',
    status: 'Approved',
    scheduledDate: '2026-06-04T07:30:00.000Z',
    notes: 'Approved kidney transplant request awaiting final surgery slot.',
  },
  {
    donorName: 'Sneha Iyer',
    recipientName: 'Farah Khan',
    hospitalName: 'LifeLine Medical Institute',
    organ: 'Pancreas',
    bloodGroup: 'AB+',
    priority: 'Critical',
    status: 'Completed',
    scheduledDate: '2026-05-22T08:00:00.000Z',
    notes: 'Completed pancreas transplant for critical endocrine instability.',
  },
  {
    donorName: 'Karan Patel',
    recipientName: 'Manish Shah',
    hospitalName: 'Noble Care Hospital',
    organ: 'Liver',
    bloodGroup: 'B-',
    priority: 'High',
    status: 'Rejected',
    scheduledDate: '2026-06-09T09:00:00.000Z',
    notes: 'Rejected after donor medical clearance review.',
    rejectionReason: 'Donor medical status requires further review.',
  },
  {
    donorName: 'Siddharth Menon',
    recipientName: 'Rose Mary Thomas',
    hospitalName: 'Aster Life Hospital',
    organ: 'Pancreas',
    bloodGroup: 'O+',
    priority: 'Medium',
    status: 'Pending',
    scheduledDate: '2026-06-11T11:30:00.000Z',
    notes: 'Pending transplant board review for pancreas match.',
  },
  {
    donorName: 'Nisha Sharma',
    recipientName: 'Pooja Bansal',
    hospitalName: 'Unity Medical Centre',
    organ: 'Lungs',
    bloodGroup: 'A+',
    priority: 'Medium',
    status: 'Pending',
    scheduledDate: '2026-06-13T13:00:00.000Z',
    notes: 'Pending respiratory transplant review and donor reassessment.',
  },
];

async function upsertHospitals() {
  await Promise.all(
    hospitalData.map((hospital) =>
      Hospital.findOneAndUpdate(
        { email: hospital.email },
        { $set: hospital },
        { new: true, upsert: true, runValidators: true }
      )
    )
  );
}

async function upsertRecipients() {
  for (const recipient of recipientData) {
    const hospital = await Hospital.findOne({ name: recipient.hospitalName });
    if (!hospital) {
      throw new Error(`Missing hospital: ${recipient.hospitalName}`);
    }

    const { hospitalName, ...payload } = recipient;
    await Recipient.findOneAndUpdate(
      { email: recipient.email },
      { $set: { ...payload, hospital: hospital._id } },
      { new: true, upsert: true, runValidators: true }
    );
  }
}

async function upsertRequests() {
  const updated = [];

  for (const request of requestData) {
    const [donor, recipient, hospital] = await Promise.all([
      Donor.findOne({ name: request.donorName }),
      Recipient.findOne({ name: request.recipientName }),
      Hospital.findOne({ name: request.hospitalName }),
    ]);

    if (!donor || !recipient || !hospital) {
      throw new Error(`Missing link for ${request.donorName} -> ${request.recipientName}`);
    }

    const payload = {
      donor: donor._id,
      recipient: recipient._id,
      hospital: hospital._id,
      organ: request.organ,
      bloodGroup: request.bloodGroup,
      priority: request.priority,
      status: request.status,
      scheduledDate: new Date(request.scheduledDate),
      notes: request.notes,
      rejectionReason: request.rejectionReason || '',
    };

    const saved = await Request.findOneAndUpdate(
      {
        donor: donor._id,
        recipient: recipient._id,
        hospital: hospital._id,
        organ: request.organ,
        bloodGroup: request.bloodGroup,
      },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    if (request.status === 'Completed') {
      donor.availability = false;
      donor.status = 'Verified';
      recipient.status = 'Transplanted';
      await Promise.all([donor.save(), recipient.save()]);
    }

    if (request.status === 'Approved') {
      recipient.status = 'Matched';
      await recipient.save();
    }

    updated.push(saved);
  }

  return updated;
}

async function summary() {
  const [donors, recipients, hospitals, requests, completed] = await Promise.all([
    Donor.countDocuments(),
    Recipient.countDocuments(),
    Hospital.countDocuments(),
    Request.countDocuments(),
    Request.countDocuments({ status: 'Completed' }),
  ]);

  return {
    donors,
    recipients,
    hospitals,
    requests,
    completed,
  };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  await upsertHospitals();
  await upsertRecipients();
  const requests = await upsertRequests();
  const counts = await summary();

  console.log(JSON.stringify({ requestsAddedOrUpdated: requests.length, counts }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
