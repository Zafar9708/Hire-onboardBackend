// In your template module
module.exports = {
  technical: {
    name: "Technical Interview",
    subject: "Technical Interview Invitation", // Removed candidate name
    body: `Dear {recipient},\n\nYour technical interview is scheduled for:\n\nDate: {date}\nTime: {time} ({timezone})\nDuration: {duration} minutes\nPlatform: {platform}`
  },
  hr: {
    name: "HR Interview",
    subject: "HR Interview Invitation", // Removed candidate name
    body: `Hello {recipient},\n\nYour HR interview is scheduled for:\n\nDate: {date}\nTime: {time}\nDuration: {duration} minutes\n\nWe'll discuss your background and expectations.`
  },
  final: {
    name: "Final Round",
    subject: "Final Interview Invitation", // Removed candidate name
    body: `Dear {recipient},\n\nFinal interview details:\n\nDate: {date}\nTime: {time}\nWith: {interviewer}\n\nPrepare for case studies.`
  }
};