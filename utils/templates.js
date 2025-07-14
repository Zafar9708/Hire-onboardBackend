module.exports = {
  technical: {
    name: "Technical Interview",
    subject: "Technical Interview Invitation", // Removed candidate name from subject
    body: `Dear {candidate},\n\nYour technical interview is scheduled for:\n\nDate: {date}\nTime: {time} ({timezone})\nDuration: {duration} minutes\nPlatform: {platform}`
  },
  hr: {
    name: "HR Interview",
    subject: "HR Interview Invitation", // Removed candidate name from subject
    body: `Hello {candidate},\n\nYour HR interview is scheduled for:\n\nDate: {date}\nTime: {time}\nDuration: {duration} minutes\n\nWe'll discuss your background and expectations.`
  },
  final: {
    name: "Final Round",
    subject: "Final Interview Invitation", // Removed candidate name from subject
    body: `Dear {candidate},\n\nFinal interview details:\n\nDate: {date}\nTime: {time}\nWith: {interviewer}\n\nPrepare for case studies.`
  }
};