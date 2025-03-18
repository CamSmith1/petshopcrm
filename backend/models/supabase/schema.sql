-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table 
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Address fields
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  
  -- Avatar field
  avatar_url TEXT,
  
  -- Business fields
  business_name TEXT,
  business_description TEXT,
  business_category TEXT,
  website TEXT,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,

  -- Ratings
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Business Hours table removed

-- Staff tables removed

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Widget Settings table removed

-- Pets tables removed

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  max_capacity INTEGER NOT NULL,
  accessibility_features TEXT[],
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Images table
CREATE TABLE IF NOT EXISTS venue_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Layouts table
CREATE TABLE IF NOT EXISTS venue_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  setup_notes TEXT,
  floor_plan_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Pricing Tiers table
CREATE TABLE IF NOT EXISTS venue_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  layout_id UUID REFERENCES venue_layouts(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL, -- 'standard', 'commercial', 'community'
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency TEXT DEFAULT 'USD',
  price_unit TEXT NOT NULL, -- 'hour', 'day', 'event'
  minimum_hours INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Equipment table
CREATE TABLE IF NOT EXISTS venue_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_amount DECIMAL(10,2) DEFAULT 0.00,
  price_currency TEXT DEFAULT 'USD',
  is_included BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Bonds table
CREATE TABLE IF NOT EXISTS venue_bonds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_refundable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue Availability table
CREATE TABLE IF NOT EXISTS venue_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week TEXT,
  specific_date DATE,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Staff Assignments table removed

-- Bookings table 
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  layout_id UUID REFERENCES venue_layouts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Selected equipment
  selected_equipment JSONB,
  
  -- Bond information
  bond_id UUID REFERENCES venue_bonds(id) ON DELETE SET NULL,
  bond_paid BOOLEAN DEFAULT FALSE,
  bond_returned BOOLEAN DEFAULT FALSE,
  bond_return_date TIMESTAMP WITH TIME ZONE,
  
  -- Pricing tier
  pricing_tier TEXT NOT NULL, -- 'standard', 'commercial', 'community'
  
  -- Payment details
  total_price_amount DECIMAL(10,2) NOT NULL,
  total_price_currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  payment_method TEXT,
  
  -- Event details
  event_type TEXT,
  event_name TEXT,
  expected_attendees INTEGER,
  
  -- Cancellation details
  cancellation_reason TEXT,
  cancellation_time TIMESTAMP WITH TIME ZONE,
  cancellation_by TEXT,
  
  -- Rescheduling details
  rescheduled_from UUID REFERENCES bookings(id),
  
  -- Form data
  custom_form_data JSONB,
  
  -- Notes
  client_notes TEXT,
  owner_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Reminders table
CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Booking Attachments table
CREATE TABLE IF NOT EXISTS booking_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT
);

-- Recurring Booking Group table
CREATE TABLE IF NOT EXISTS recurring_booking_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL
);

-- Recurring Booking Members table
CREATE TABLE IF NOT EXISTS recurring_booking_members (
  group_id UUID REFERENCES recurring_booking_groups(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, booking_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create auth triggers for users table to sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 
         COALESCE(new.raw_user_meta_data->>'role', 'client'));
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create update trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_services_timestamp
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Widget settings trigger removed

-- Function to update user average rating when a new review is added
CREATE OR REPLACE FUNCTION update_user_rating() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_user_rating();

-- Create function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(business_id UUID, key_name TEXT)
RETURNS TEXT AS $$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a random API key with prefix
  api_key := 'bpro_' || encode(gen_random_bytes(24), 'base64');
  
  -- Insert the new API key
  INSERT INTO api_keys (business_id, key_value, name)
  VALUES (business_id, api_key, key_name);
  
  RETURN api_key;
END;
$$ LANGUAGE plpgsql;