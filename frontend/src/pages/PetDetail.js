import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';

const PetDetail = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would make API calls
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock pet data
        const mockPet = {
          id: petId,
          name: 'Buddy',
          type: 'Dog',
          breed: 'Golden Retriever',
          age: 3,
          weight: 65,
          gender: 'Male',
          microchipId: '985121033452367',
          notes: 'Friendly, but gets anxious during grooming. Prefers male groomers.',
          allergies: 'Sensitive to flea medication',
          medicalConditions: 'None',
          medications: 'None',
          vaccinations: [
            {
              name: 'Rabies',
              date: '2024-01-15',
              expiryDate: '2025-01-15'
            },
            {
              name: 'DHPP',
              date: '2023-11-10',
              expiryDate: '2024-11-10'
            }
          ],
          photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        };
        
        // Mock owner data
        const mockOwner = {
          id: 'c12345',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, USA'
        };
        
        // Mock appointments data
        const mockAppointments = [
          {
            id: 'a1',
            date: '2024-03-10',
            time: '10:00 AM',
            service: 'Premium Grooming',
            status: 'completed',
            notes: 'Nail trim was difficult'
          },
          {
            id: 'a2',
            date: '2024-03-25',
            time: '2:30 PM',
            service: 'Basic Grooming',
            status: 'upcoming',
            notes: ''
          }
        ];
        
        setPet(mockPet);
        setOwner(mockOwner);
        setAppointments(mockAppointments);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        toast.error('Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPetData();
  }, [petId]);
  
  const handleEditPet = () => {
    // In a real app, this would navigate to an edit form
    toast.info('Edit pet functionality would open here');
  };
  
  const handleDeletePet = () => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      // In a real app, this would make an API call
      toast.success('Pet has been deleted');
      navigate('/pets');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!pet) {
    return (
      <div className="error-state">
        <h2>Pet Not Found</h2>
        <p>The pet you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/pets" className="btn btn-primary">Back to Pets</Link>
      </div>
    );
  }
  
  return (
    <div className="pet-detail-page">
      <PageHeader
        title={pet.name}
        subtitle={`${pet.breed} · ${pet.age} years old`}
        actions={
          <>
            <button className="btn btn-secondary mr-2" onClick={handleEditPet}>
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDeletePet}>
              <i className="fas fa-trash mr-1"></i> Delete
            </button>
          </>
        }
        backLink="/pets"
      />
      
      <div className="grid grid-2">
        <Card title="Pet Information">
          <div className="pet-info">
            <div className="pet-photo">
              {pet.photoUrl ? (
                <img src={pet.photoUrl} alt={pet.name} />
              ) : (
                <div className="pet-photo-placeholder">
                  <span>{pet.name[0]}</span>
                </div>
              )}
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type</span>
                <span className="info-value">{pet.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Breed</span>
                <span className="info-value">{pet.breed}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{pet.age} years</span>
              </div>
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">{pet.weight} lbs</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{pet.gender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Microchip ID</span>
                <span className="info-value">{pet.microchipId || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="section-divider"></div>
          
          <div className="pet-notes">
            <h3>Notes</h3>
            <p>{pet.notes || 'No notes available.'}</p>
          </div>
        </Card>
        
        <Card title="Medical Information">
          <div className="info-section">
            <h4>Allergies</h4>
            <p>{pet.allergies || 'None reported'}</p>
          </div>
          
          <div className="info-section">
            <h4>Medical Conditions</h4>
            <p>{pet.medicalConditions || 'None reported'}</p>
          </div>
          
          <div className="info-section">
            <h4>Medications</h4>
            <p>{pet.medications || 'None reported'}</p>
          </div>
          
          <div className="section-divider"></div>
          
          <div className="info-section">
            <h4>Vaccinations</h4>
            {pet.vaccinations && pet.vaccinations.length > 0 ? (
              <div className="vaccinations-list">
                {pet.vaccinations.map((vaccination, index) => (
                  <div key={index} className="vaccination-item">
                    <div className="vaccination-name">{vaccination.name}</div>
                    <div className="vaccination-dates">
                      <div>Given: {new Date(vaccination.date).toLocaleDateString()}</div>
                      <div>Expires: {new Date(vaccination.expiryDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No vaccination records available.</p>
            )}
          </div>
        </Card>
      </div>
      
      <div className="mt-4">
        <Card title="Owner Information">
          <div className="owner-info">
            <h3>{owner?.name || 'Unknown'}</h3>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{owner?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{owner?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{owner?.address || 'N/A'}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <Link to={`/customers/${owner?.id}`} className="btn btn-secondary btn-sm">
                View Customer Profile
              </Link>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mt-4">
        <Card 
          title="Appointment History" 
          actions={
            <Link to={`/appointments/new?petId=${petId}`} className="btn btn-primary btn-sm">
              Schedule Appointment
            </Link>
          }
        >
          {appointments.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.service}</td>
                      <td>
                        <span className={`badge badge-${appointment.status === 'completed' ? 'success' : 'primary'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>{appointment.notes || 'No notes'}</td>
                      <td>
                        <Link to={`/appointments/${appointment.id}`} className="btn btn-secondary btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No appointment history available for this pet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PetDetail;