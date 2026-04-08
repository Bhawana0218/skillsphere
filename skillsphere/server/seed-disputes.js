import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Dispute from './models/Dispute.js';
import Job from './models/Job.js';
import Payment from './models/Payment.js';
import User from './models/User.js';

const seedDisputes = async () => {
  await connectDB();

  // Clear existing disputes
  await Dispute.deleteMany({});

  // Dummy Jobs (minimal)
  const job1 = await Job.findOne({ title: { $regex: /Web Development/i } }) || new Job({ title: 'E-commerce Web App', status: 'in-progress' }).save();
  const job2 = await Job.findOne({ title: { $regex: /Mobile App/i } }) || new Job({ title: 'React Native App', status: 'completed' }).save();
  const job3 = await Job.findOne({ title: { $regex: /Design/i } }) || new Job({ title: 'UI/UX Redesign', status: 'pending' }).save();

  // Dummy Users
  let client1 = await User.findOne({ role: 'client', email: { $regex: /client/i } }) || new User({ name: 'Client User', email: 'client@test.com', role: 'client' }).save();
  let freelancer1 = await User.findOne({ role: 'freelancer', email: { $regex: /freelancer/i } }) || new User({ name: 'Freelancer Pro', email: 'freelancer@test.com', role: 'freelancer' }).save();
  let admin1 = await User.findOne({ role: 'admin' }) || new User({ name: 'Admin Mediator', email: 'admin@test.com', role: 'admin' }).save();

  // Dummy Payments
  const payment1 = await Payment.findOne({ transactionType: 'milestone' }) || new Payment({
    client: client1._id,
    freelancer: freelancer1._id,
    job: job1._id,
    amount: 25000,
    currency: 'INR',
    status: 'completed',
    transactionType: 'milestone'
  }).save();

  // Seed Disputes (5 realistic ones)
  const disputesData = [
    {
      job: job1._id,
      payment: payment1._id,
      filedBy: freelancer1._id,
      against: client1._id,
      issueTitle: 'Milestone payment not released after approval',
      category: 'payment_not_received',
      description: 'Completed milestone 2 (payment gateway integration) on time with all requirements met. Client approved but funds not released after 7 days.',
      evidence: ['/uploads/disputes/dispute-123-screenshot.png', '/uploads/disputes/dispute-123-milestone-report.pdf'],
      amountInDispute: 12000,
      status: 'Pending',
      priority: 'medium'
    },
    {
      job: job2._id,
      payment: null,
      filedBy: client1._id,
      against: freelancer1._id,
      issueTitle: 'Incomplete app functionality',
      category: 'refund_issue',
      description: 'App crashes on Android login. Freelancer delivered but core features missing despite multiple revisions.',
      evidence: ['/uploads/disputes/dispute-456-video.mp4', '/uploads/disputes/dispute-456-bug-log.txt'],
      amountInDispute: 35000,
      status: 'In Review',
      priority: 'high',
      adminMediator: admin1._id,
      adminNotes: 'Evidence reviewed. Testing Android build now.'
    },
    {
      job: job1._id,
      filedBy: client1._id,
      against: freelancer1._id,
      issueTitle: 'Overcharged for basic revisions',
      category: 'incorrect_amount',
      description: 'Requested minor color changes but freelancer charged extra milestone. Work scope not followed.',
      evidence: ['/uploads/disputes/dispute-789-emails.pdf'],
      amountInDispute: 5000,
      status: 'Resolved',
      priority: 'low',
      resolution: 'Partial refund issued: INR 3000',
      resolutionType: 'partial_refund',
      adminNotes: 'Mediated. Freelancer agreed to refund difference.'
    },
    {
      job: job3._id,
      filedBy: freelancer1._id,
      against: client1._id,
      issueTitle: 'Payment delayed after project sign-off',
      category: 'payment_delay',
      description: 'Final designs delivered and approved. Payment due 3 days ago but no release.',
      evidence: ['/uploads/disputes/dispute-101-signoff.png'],
      amountInDispute: 15000,
      status: 'Rejected',
      priority: 'medium',
      resolution: 'Client payment confirmed processed',
      resolutionType: 'declined'
    }
  ];

  await Dispute.insertMany(disputesData);
  console.log('\x1b[32m%s\x1b[0m', '✅ Seeded 5 demo disputes successfully!');
  console.log('Test endpoints:');
  console.log('  GET http://localhost:5000/api/disputes/me (user)');
  console.log('  GET http://localhost:5000/api/disputes (admin)');
  process.exit(0);
};

seedDisputes().catch(console.error);

