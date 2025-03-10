const supabase = require('./config/supabase');

// Demo service data
const demoServices = [
  {
    title: 'Basic Dog Grooming',
    description: 'Complete grooming service including bath, brush, nail trim, ear cleaning, and basic haircut.',
    category: 'Grooming',
    price_amount: 45.00,
    price_currency: 'USD',
    duration: 60, // minutes
    location_options: ['In-store'],
    capacity: 1
  },
  {
    title: 'Deluxe Dog Grooming',
    description: 'Premium grooming package with specialized shampoo, conditioner, teeth brushing, and styled haircut.',
    category: 'Grooming',
    price_amount: 65.00,
    price_currency: 'USD',
    duration: 90, // minutes
    location_options: ['In-store'],
    capacity: 1
  },
  {
    title: 'Dog Walking - 30 min',
    description: 'A 30-minute walk for your dog with personalized attention and exercise.',
    category: 'Exercise',
    price_amount: 25.00,
    price_currency: 'USD',
    duration: 30, // minutes
    location_options: ['Home visit'],
    capacity: 3
  },
  {
    title: 'Dog Training Session',
    description: 'One-hour training session focusing on basic commands, leash training, and behavior correction.',
    category: 'Training',
    price_amount: 75.00,
    price_currency: 'USD',
    duration: 60, // minutes
    location_options: ['In-store', 'Home visit'],
    capacity: 1
  },
  {
    title: 'Overnight Pet Sitting',
    description: 'Overnight care for your dog in your home, including feeding, walks, and companionship.',
    category: 'Boarding',
    price_amount: 85.00,
    price_currency: 'USD',
    duration: 720, // 12 hours
    location_options: ['Home visit'],
    capacity: 1
  },
  {
    title: 'Nail Trim',
    description: 'Quick and stress-free nail trimming service for your dog.',
    category: 'Grooming',
    price_amount: 15.00,
    price_currency: 'USD',
    duration: 15, // minutes
    location_options: ['In-store'],
    capacity: 1
  },
  {
    title: 'Teeth Cleaning',
    description: 'Professional teeth cleaning to maintain your dog\'s dental health and fresh breath.',
    category: 'Health',
    price_amount: 40.00,
    price_currency: 'USD',
    duration: 30, // minutes
    location_options: ['In-store'],
    capacity: 1
  }
];

// Add a demo business user and services if they don't exist
async function addDemoData() {
  try {
    console.log('Checking for demo user...');
    
    // Check if demo business user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo@dogservices.com')
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // Not found code
      console.error('Error checking for existing user:', userError);
      return;
    }
    
    let businessId;
    
    if (!existingUser) {
      console.log('Creating demo business user...');
      
      // Create demo business user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: 'demo@dogservices.com',
          name: 'Demo Business',
          role: 'business',
          is_verified: true,
          business_name: 'Pawsome Dog Services',
          business_description: 'Full-service dog care center offering grooming, training, boarding, and more.',
          business_category: 'Pet Services',
          website: 'https://pawsomedogservices.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          street: '123 Main Street',
          city: 'Dogtown',
          state: 'CA',
          zip_code: '90210',
          country: 'USA',
          phone: '(555) 123-4567'
        })
        .select()
        .single();
      
      if (createUserError) {
        console.error('Error creating demo user:', createUserError);
        return;
      }
      
      businessId = newUser.id;
      console.log('Demo business created with ID:', businessId);
    } else {
      businessId = existingUser.id;
      console.log('Demo business already exists with ID:', businessId);
    }
    
    // Check if services already exist for this business
    const { data: existingServices, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('provider_id', businessId)
      .limit(1);
    
    if (servicesError) {
      console.error('Error checking for existing services:', servicesError);
      return;
    }
    
    if (existingServices && existingServices.length > 0) {
      console.log('Services already exist for demo business');
      return;
    }
    
    // Create demo services
    console.log('Adding demo services...');
    for (const service of demoServices) {
      const { error: createServiceError } = await supabase
        .from('services')
        .insert({
          ...service,
          provider_id: businessId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createServiceError) {
        console.error(`Error creating service "${service.title}":`, createServiceError);
      } else {
        console.log(`Service created: ${service.title}`);
      }
    }
    
    console.log('Demo data creation complete');
  } catch (err) {
    console.error('Error adding demo data:', err);
  }
}

module.exports = { addDemoData };