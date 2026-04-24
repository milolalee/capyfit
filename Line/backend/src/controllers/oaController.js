const OAAccount = require('../models/OAAccount');

class OAController {
  static async createOA(req, res) {
    const { name, channel_id, channel_secret, access_token } = req.body;

    if (!name || !channel_id || !channel_secret || !access_token) {
      return res.status(400).json({ 
        error: 'name, channel_id, channel_secret, and access_token are required' 
      });
    }

    try {
      const oaAccount = await OAAccount.create({
        name,
        channel_id,
        channel_secret,
        access_token,
      });

      res.status(201).json({ oa_account: oaAccount });
    } catch (error) {
      console.error('Create OA error:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'Channel ID already exists' });
      }
      res.status(500).json({ error: 'Failed to create OA account' });
    }
  }

  static async getOAs(req, res) {
    try {
      const oaAccounts = await OAAccount.getAll();
      res.status(200).json({ oa_accounts: oaAccounts });
    } catch (error) {
      console.error('Get OAs error:', error);
      res.status(500).json({ error: 'Failed to get OA accounts' });
    }
  }

  static async getOA(req, res) {
    const { oa_id } = req.params;

    try {
      const oaAccount = await OAAccount.findById(oa_id);
      
      if (!oaAccount) {
        return res.status(404).json({ error: 'OA account not found' });
      }

      res.status(200).json({ oa_account: oaAccount });
    } catch (error) {
      console.error('Get OA error:', error);
      res.status(500).json({ error: 'Failed to get OA account' });
    }
  }

  static async updateOA(req, res) {
    const { oa_id } = req.params;
    const { name, channel_secret, access_token } = req.body;

    try {
      const oaAccount = await OAAccount.update(oa_id, {
        name,
        channel_secret,
        access_token,
      });

      res.status(200).json({ oa_account: oaAccount });
    } catch (error) {
      console.error('Update OA error:', error);
      res.status(500).json({ error: 'Failed to update OA account' });
    }
  }

  static async deleteOA(req, res) {
    const { oa_id } = req.params;

    try {
      const oaAccount = await OAAccount.delete(oa_id);
      
      if (!oaAccount) {
        return res.status(404).json({ error: 'OA account not found' });
      }

      res.status(200).json({ message: 'OA account deleted successfully' });
    } catch (error) {
      console.error('Delete OA error:', error);
      res.status(500).json({ error: 'Failed to delete OA account' });
    }
  }
}

module.exports = OAController;
