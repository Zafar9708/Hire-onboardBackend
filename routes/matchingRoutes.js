const { matchingReport } = require("../controllers/matchingReport");


router.get('/matching/evaluate/:resumeId/:jobId', matchingReport.evaluateResumeMatch);
router.post('/matching/process/:jobId', matchingReport.processAutomaticScreening);
router.get('/matching/reports',matchingReport.MatchingReport)
