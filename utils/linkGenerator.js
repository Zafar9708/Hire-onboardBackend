function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateMeetingLink(platform) {
    switch (platform) {
        case 'google_meet':
            return `https://meet.google.com/${generateRandomString(3)}-${generateRandomString(4)}-${generateRandomString(3)}`;
        case 'zoom':
            return `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        case 'microsoft_teams':
            return `https://teams.microsoft.com/l/meetup-join/${generateRandomString(16)}`;
        case 'other':
            return `https://other-platform.com/meeting/${generateRandomString(8)}`;
        default:
            return 'N/A';
    }
}

module.exports = { generateMeetingLink };
