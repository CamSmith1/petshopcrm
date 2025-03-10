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

-- Services table 
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency TEXT DEFAULT 'USD',
  duration INTEGER NOT NULL, -- in minutes
  location_options TEXT[],
  capacity INTEGER DEFAULT 1,
  buffer_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Availability table
CREATE TABLE IF NOT EXISTS service_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  day_of_week TEXT,
  specific_date DATE,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE
);

-- Service Custom Forms table
CREATE TABLE IF NOT EXISTS service_custom_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  form_schema JSONB NOT NULL
);

-- Service Staff Assignments table removed

-- Bookings table 
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Payment details
  total_price_amount DECIMAL(10,2) NOT NULL,
  total_price_currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  payment_method TEXT,
  
  -- Location and meeting details
  location TEXT NOT NULL,
  meeting_link TEXT,
  
  -- Cancellation details
  cancellation_reason TEXT,
  cancellation_time TIMESTAMP WITH TIME ZONE,
  cancellation_by TEXT,
  
  -- Rescheduling details
  rescheduled_from UUID REFERENCES bookings(id),
  
  -- Recurring booking details
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  recurring_end_date DATE,
  recurring_occurrences INTEGER,
  
  -- Form data
  custom_form_data JSONB,
  
  -- Notes
  client_notes TEXT,
  provider_notes TEXT,
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