const Client = require('../models/Client');

const addClient = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Client name is required' });
        }

        const existing = await Client.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Client already exists' });
        }

        const client = new Client({ name });
        await client.save();

        res.status(201).json({ success: true, message: 'Client added successfully', client });
    } catch (error) {
        console.error('Add Client Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ name: 1 });
        res.status(200).json({ success: true, clients });
    } catch (error) {
        console.error('Get Clients Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;

        const deleted = await Client.findByIdAndDelete(clientId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.status(200).json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete Client Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addClient,
    getClients,
    deleteClient
};
