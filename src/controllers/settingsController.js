import { pool } from '../config/database.js';

// Get all system settings
export const getSettings = async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM system_settings');

        // Convert to object for easier frontend consumption
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.setting_key] = curr.setting_value;
            return acc;
        }, {});

        res.json({ success: true, data: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

// Update system settings
export const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        const keys = Object.keys(settings);

        // Update each setting
        for (const key of keys) {
            await pool.query(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, settings[key], settings[key]]
            );
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};
