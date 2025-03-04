-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'client', -- 'client', 'business', 'admin'
  phone TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  business_name TEXT,
  business_category TEXT,
  business_description TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pets table
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- dog, cat, etc.
  breed TEXT,
  age INTEGER,
  gender TEXT,
  photo_url TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- RLS policies for pets
CREATE POLICY "Owners can view their own pets" 
  ON pets FOR SELECT 
  USING (auth.uid() = owner_id);
  
CREATE POLICY "Owners can modify their own pets" 
  ON pets FOR ALL 
  USING (auth.uid() = owner_id);

CREATE POLICY "Business users can view client pets" 
  ON pets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'business'
    )
  );

-- Pet emergency contacts
CREATE TABLE pet_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pet_emergency_contacts
ALTER TABLE pet_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_emergency_contacts
CREATE POLICY "Pet owners can manage emergency contacts" 
  ON pet_emergency_contacts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM pets WHERE id = pet_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business users can view emergency contacts" 
  ON pet_emergency_contacts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'business'
    )
  );

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_amount DECIMAL(10, 2) NOT NULL,
  price_currency TEXT DEFAULT 'USD',
  duration INTEGER NOT NULL, -- in minutes
  location_options TEXT[], -- e.g. ['provider_location', 'client_location', 'virtual']
  capacity INTEGER DEFAULT 1,
  buffer_time INTEGER DEFAULT 0, -- extra time in minutes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Providers can manage their services" 
  ON services FOR ALL 
  USING (auth.uid() = provider_id);
  
CREATE POLICY "Anyone can view active services" 
  ON services FOR SELECT 
  USING (is_active = TRUE);

-- Service availability
CREATE TABLE service_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER, -- 0-6 for Sun-Sat, NULL if specific date
  specific_date DATE, -- NULL if recurring day of week
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on service_availability
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_availability
CREATE POLICY "Providers can manage their service availability" 
  ON service_availability FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM services WHERE id = service_id AND provider_id = auth.uid()
    )
  );
  
CREATE POLICY "Anyone can view service availability" 
  ON service_availability FOR SELECT 
  TO authenticated 
  USING (TRUE);

-- Service custom forms
CREATE TABLE service_custom_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  form_schema JSONB NOT NULL, -- JSON schema for the form
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on service_custom_forms
ALTER TABLE service_custom_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_custom_forms
CREATE POLICY "Providers can manage their service forms" 
  ON service_custom_forms FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM services WHERE id = service_id AND provider_id = auth.uid()
    )
  );
  
CREATE POLICY "Anyone can view service forms" 
  ON service_custom_forms FOR SELECT 
  TO authenticated 
  USING (TRUE);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  provider_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  pet_id UUID REFERENCES pets(id) ON DELETE RESTRICT,
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  total_price_amount DECIMAL(10, 2) NOT NULL,
  total_price_currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  client_notes TEXT,
  provider_notes TEXT,
  internal_notes TEXT,
  custom_form_data JSONB,
  cancellation_reason TEXT,
  cancellation_time TIMESTAMP WITH TIME ZONE,
  cancellation_by TEXT, -- client, provider, admin
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Clients can view their own bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = client_id);
  
CREATE POLICY "Clients can create bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = client_id);
  
CREATE POLICY "Clients can update their own bookings" 
  ON bookings FOR UPDATE 
  USING (auth.uid() = client_id AND status != 'completed');

CREATE POLICY "Providers can view bookings for their services" 
  ON bookings FOR SELECT 
  USING (auth.uid() = provider_id);
  
CREATE POLICY "Providers can update bookings for their services" 
  ON bookings FOR UPDATE 
  USING (auth.uid() = provider_id);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" 
  ON reviews FOR SELECT 
  TO authenticated 
  USING (TRUE);
  
CREATE POLICY "Clients can create reviews for their bookings" 
  ON reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND client_id = auth.uid() AND status = 'completed'
    )
  );

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_keys
CREATE POLICY "Businesses can manage their API keys" 
  ON api_keys FOR ALL 
  USING (auth.uid() = business_id);

-- Widget settings table
CREATE TABLE widget_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES users(id) ON DELETE CASCADE,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#10B981',
  font_family TEXT DEFAULT 'sans-serif',
  border_radius TEXT DEFAULT '8px',
  layout TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on widget_settings
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for widget_settings
CREATE POLICY "Businesses can manage their widget settings" 
  ON widget_settings FOR ALL 
  USING (auth.uid() = business_id);
  
CREATE POLICY "Anyone can view widget settings" 
  ON widget_settings FOR SELECT 
  TO authenticated 
  USING (TRUE);

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(business_id UUID, key_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
BEGIN
  -- Check if user exists and is a business
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = business_id AND role = 'business') THEN
    RAISE EXCEPTION 'User is not a business owner';
  END IF;
  
  -- Generate a random key
  api_key := encode(gen_random_bytes(24), 'hex');
  
  -- Insert the key
  INSERT INTO api_keys (business_id, key_name, key_value)
  VALUES (business_id, key_name, api_key);
  
  -- Return the key
  RETURN api_key;
END;
$$;

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_pets_timestamp
BEFORE UPDATE ON pets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_service_custom_forms_timestamp
BEFORE UPDATE ON service_custom_forms
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_widget_settings_timestamp
BEFORE UPDATE ON widget_settings
FOR EACH ROW EXECUTE FUNCTION update_timestamp();