// utils/sendAlert.js

export async function sendAlert({ diaryId, entryId, severity, topEmotion, confidence, parentEmail }) {
  // 🔧 Replace this with your actual notification method:
  //    - Email via nodemailer
  //    - Push via Expo / Firebase
  //    - SMS via Twilio
  console.warn("🚨 ALERT TRIGGERED", {
    diaryId,
    entryId,
    severity,
    topEmotion,
    confidence: (confidence * 100).toFixed(1) + "%",
    parentEmail,
  });

  // Example stub for future integration:
  // await sendEmail({ to: parentEmail, subject: "Diary Alert", ... });
}

