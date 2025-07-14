const express = require('express');
const router = express.Router();
const {
  createRemark,
  getRemarks,
  getRemarksByCandidate,
  updateRemark,
  deleteRemark
} = require('../controllers/remarkController');

router.post('/', createRemark);

router.get('/', getRemarks);

router.get('/candidate/:candidateId', getRemarksByCandidate);

router.put('/:id', updateRemark);

router.delete('/:id', deleteRemark);

module.exports = router;
