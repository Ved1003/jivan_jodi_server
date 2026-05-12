
import '../src/config/env.js';
import { pool } from '../src/config/database.js';

const fixEnum = async () => {
    try {
        console.log("Updating status column definition...");
        await pool.query("ALTER TABLE users MODIFY COLUMN status ENUM('pending','active','suspended','blocked','inactive') DEFAULT 'pending'");
        console.log("✅ Status column updated successfully.");
    } catch (e) { console.error("❌ Error:", e); }
    process.exit();
}
fixEnum();
