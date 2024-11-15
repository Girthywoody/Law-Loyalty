// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// When a new user is created
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  
  // Create activity log
  await db.collection('activityLogs').add({
    type: 'USER_CREATED',
    userId: user.uid,
    email: user.email,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
});

// When an employee registers
exports.onEmployeeRegistration = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const db = admin.firestore();

    if (userData.role === 'employee') {
      // Notify manager
      const restaurant = await db.collection('restaurants')
        .doc(userData.restaurantId)
        .get();
      
      const managerDoc = await db.collection('users')
        .doc(restaurant.data().managerId)
        .get();
      
      // Send email notification (implement your email service)
      // await sendEmail(managerDoc.data().email, 'New Employee Registration', {...});
      
      // Create activity log
      await db.collection('activityLogs').add({
        type: 'EMPLOYEE_REGISTERED',
        employeeId: context.params.userId,
        restaurantId: userData.restaurantId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
});

// When a visit is recorded
exports.onVisitRecorded = functions.firestore
  .document('visits/{visitId}')
  .onCreate(async (snap, context) => {
    const visitData = snap.data();
    const db = admin.firestore();

    // Update restaurant visit stats
    await db.collection('restaurants').doc(visitData.restaurantId).update({
      totalVisits: admin.firestore.FieldValue.increment(1),
      lastVisitDate: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user's visit history
    await db.collection('users').doc(visitData.userId).update({
      lastVisit: admin.firestore.FieldValue.serverTimestamp(),
      totalVisits: admin.firestore.FieldValue.increment(1)
    });
});

// Daily cleanup job
exports.dailyCleanup = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  // Clean up old logs (older than 30 days)
  const oldLogs = await db.collection('activityLogs')
    .where('timestamp', '<', admin.firestore.Timestamp.fromMillis(now.toMillis() - (30 * 24 * 60 * 60 * 1000)))
    .get();
  
  const deletePromises = oldLogs.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
});

// Update employee status when manager approves/rejects
exports.onEmployeeStatusUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    if (newData.status !== oldData.status && newData.role === 'employee') {
      const db = admin.firestore();
      
      // Create activity log
      await db.collection('activityLogs').add({
        type: 'EMPLOYEE_STATUS_UPDATED',
        employeeId: context.params.userId,
        oldStatus: oldData.status,
        newStatus: newData.status,
        updatedBy: context.auth.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send email notification based on status change
      // if (newData.status === 'approved') {...}
    }
});