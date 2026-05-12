import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/controllers/browseController.js');
console.log('Fixing file:', filePath);

try {
    const content = fs.readFileSync(filePath, 'utf8'); // Try read as utf8
    // The appended content might look like garbage or spaces
    // We know the file should end with "};" (end of last function)
    // We will look for the last occurrence of "};"

    // Note: If the file is mixed encoding, readFileSync 'utf8' might replace invalid chars or read them weirdly.
    // Let's try to match the known end of the file functionality.

    const lastValidIndex = content.lastIndexOf('};');

    if (lastValidIndex !== -1) {
        // Keep up to "};"
        const cleanContent = content.substring(0, lastValidIndex + 2);
        fs.writeFileSync(filePath, cleanContent + '\n', 'utf8'); // Write back as clean UTF-8
        console.log('✅ File fixed. Truncated at index', lastValidIndex + 2);
    } else {
        console.error('❌ Could not find "};" to truncate.');
    }

} catch (err) {
    console.error('Error:', err);
}
