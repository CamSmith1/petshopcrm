-- Migration script to remove widget, pet, staff, and holiday management functionality
-- Run this script after backing up the database

-- Step 1: Drop references to pets and staff in bookings table
ALTER TABLE bookings DROP COLUMN IF EXISTS pet_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS assigned_staff_id;

-- Step 2: Drop pet-related tables
DROP TABLE IF EXISTS pet_emergency_contacts;
DROP TABLE IF EXISTS pets;

-- Step 3: Drop staff-related tables
DROP TABLE IF EXISTS staff_schedule;
DROP TABLE IF EXISTS service_staff_assignments;
DROP TABLE IF EXISTS staff;

-- Step 4: Drop widget-related tables
DROP TRIGGER IF EXISTS update_widget_settings_timestamp ON widget_settings;
DROP TABLE IF EXISTS widget_settings;

-- Step 5: Drop business hours table (used for holidays)
DROP TABLE IF EXISTS business_hours;

-- Update API keys table description
COMMENT ON TABLE api_keys IS 'API keys for integration purposes (widget functionality removed)';
COMMENT ON TABLE bookings IS 'Appointment bookings for services (pet/staff functionality removed)';
COMMENT ON TABLE services IS 'Service offerings (staff assignments removed)';

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Removed widget, pet, staff, and holiday functionality';
END $$;