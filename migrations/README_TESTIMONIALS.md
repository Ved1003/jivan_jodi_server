# Run Database Migration for Testimonials

**Important:** You need to run the database migration to create the `testimonials` table.

## Option 1: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `d:/Projects/Matrimonial_project/Jivan_Jodi_v3/Server/migrations/create_testimonials.sql`
4. Execute the SQL

## Option 2: Using Command Line
```bash
# Navigate to server directory
cd d:/Projects/Matrimonial_project/Jivan_Jodi_v3/Server

# Run migration (Windows PowerShell)
Get-Content migrations\create_testimonials.sql | mysql -u root -p12345678 jivan_jodi
```

## Option 3: Using MySQL CLI
```sql
USE jivan_jodi;
SOURCE d:/Projects/Matrimonial_project/Jivan_Jodi_v3/Server/migrations/create_testimonials.sql;
```

## Verify Table Creation
```sql
USE jivan_jodi;
SHOW TABLES LIKE 'testimonials';
DESCRIBE testimonials;
```

After running the migration, refresh the admin testimonials page and the errors will be gone!
