-- SQL script to remove pets, staff and integration tables
-- This should be run manually after backing up data if needed

-- First, remove bookings references to pets and staff
ALTER TABLE bookings DROP COLUMN IF EXISTS pet_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS assigned_staff_id;

-- Drop staff-related tables in correct order
DROP TABLE IF EXISTS staff_schedule;
DROP TABLE IF EXISTS service_staff_assignments;
DROP TABLE IF EXISTS staff;

-- Drop pet-related tables in correct order
DROP TABLE IF EXISTS pet_emergency_contacts;
DROP TABLE IF EXISTS pets;

-- Drop business hours table
DROP TABLE IF EXISTS business_hours;

-- Add this comment to document the change
COMMENT ON TABLE bookings IS 'Appointment bookings for services (pet/staff functionality removed)';
COMMENT ON TABLE services IS 'Service offerings (staff assignments removed)';