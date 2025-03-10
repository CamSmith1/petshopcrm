-- SQL script to remove widget-related tables and functions
-- This should be run manually after backing up data if needed

-- Drop triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS update_widget_settings_timestamp ON widget_settings;

-- Drop tables
DROP TABLE IF EXISTS widget_settings;

-- Note: Keep api_keys table as it may be used for other API integrations
-- but the specific widget-related data can be cleaned:
-- DELETE FROM api_keys WHERE name LIKE '%Widget%';

-- We don't need to modify the generate_api_key function as it's generic
-- and can be used for other API key generation needs.

-- Add this comment to document the change
COMMENT ON TABLE api_keys IS 'API keys for integration purposes (widget functionality removed)';