module.exports = {
    technical: {
      name: "Technical Interview",
      subject: "Technical Interview Invitation - {candidate}",
      body: `Dear {candidate},\n\nYour technical interview is scheduled for:\n\nDate: {date}\nTime: {time} ({timezone})\nDuration: {duration}\nPlatform: {platform}\n\nMeeting Link: {meetingLink}\n\nBest regards,\nTech Team`
    },
    hr: {
      name: "HR Interview",
      subject: "HR Interview Invitation - {candidate}",
      body: `Hello {candidate},\n\nYour HR interview is scheduled for:\n\nDate: {date}\nTime: {time}\nDuration: {duration}\n\nWe'll discuss your background and expectations.\n\nBest,\nHR Team`
    },
    // Add 6 more templates...
    final: {
      name: "Final Round",
      subject: "Final Interview - {candidate}",
      body: `Dear {candidate},\n\nFinal interview details:\n\nDate: {date}\nTime: {time}\nWith: {interviewer}\n\nPrepare for case studies.\n\nRegards,\nHiring Team`
    }
  };