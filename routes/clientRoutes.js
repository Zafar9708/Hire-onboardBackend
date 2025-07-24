const express = require('express');
const router = express.Router();
const { addClient, getClients, deleteClient } = require('../controllers/clientController');

router.post('/', addClient);
router.get('/', getClients);
router.delete('/:id', deleteClient);

module.exports = router;
