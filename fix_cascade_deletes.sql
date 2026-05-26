-- ============================================================================
-- STRIDE RITE: CASCADE DELETE FIX (v2 - Catalog based)
-- Run this script in the Supabase SQL Editor to allow deleting users from the dashboard.
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    sql_drop TEXT;
    sql_create TEXT;
BEGIN
    FOR r IN (
        SELECT
            con.conname AS constraint_name,
            rel.relname AS table_name,
            ns.nspname AS table_schema,
            att.attname AS column_name,
            frel.relname AS foreign_table_name,
            fns.nspname AS foreign_table_schema,
            fatt.attname AS foreign_column_name
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
        JOIN pg_catalog.pg_namespace ns ON ns.oid = rel.relnamespace
        JOIN pg_catalog.pg_attribute att ON att.attrelid = rel.oid AND att.attnum = con.conkey[1]
        JOIN pg_catalog.pg_class frel ON frel.oid = con.confrelid
        JOIN pg_catalog.pg_namespace fns ON fns.oid = frel.relnamespace
        JOIN pg_catalog.pg_attribute fatt ON fatt.attrelid = frel.oid AND fatt.attnum = con.confkey[1]
        WHERE con.contype = 'f' 
          AND ns.nspname = 'public'
          AND (
              (fns.nspname = 'auth' AND frel.relname = 'users')
              OR (fns.nspname = 'public' AND frel.relname = 'profiles')
          )
    ) LOOP
        -- Drop the old constraint
        sql_drop := format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE sql_drop;
        
        -- Re-create the constraint with CASCADE (or SET NULL for coach_id to avoid deleting clients when a coach is deleted)
        IF r.column_name = 'coach_id' THEN
            sql_create := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE SET NULL', 
                r.table_schema, r.table_name, r.constraint_name, r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
        ELSE
            sql_create := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE CASCADE', 
                r.table_schema, r.table_name, r.constraint_name, r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
        END IF;
        
        EXECUTE sql_create;
        
        RAISE NOTICE 'Updated constraint % on table %', 
            r.constraint_name, r.table_name;
    END LOOP;
END $$;
