
import '../src/config/env.js';
import { pool } from '../src/config/database.js';

const checkStatus = async () => {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM users WHERE Field = 'status'");
        if (rows.length) console.log("TYPE:", rows[0].Type);
        else console.log("Column not found");
    } catch (e) { console.error(e); }
    process.exit();
}
checkStatus();
