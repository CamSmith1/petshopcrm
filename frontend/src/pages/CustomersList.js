import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      try {
        // Add search parameter if available
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await api.getCustomers(params);
        
        // Transform customer data to match expected format
        const formattedCustomers = response.data.customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || 'Not provided',
          petCount: 0, // Could be fetched in the future
          lastAppointment: customer.last_booking_date || 'No bookings yet',
          totalSpent: customer.total_spent ? `$${customer.total_spent.toFixed(2)}` : '$0.00',
          status: customer.status || 'active'
        }));
        
        setCustomers(formattedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
        
        // Fallback to empty array
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending when switching fields
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm)
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle special cases
    if (sortBy === 'totalSpent') {
      // Remove $ and convert to number
      aValue = parseFloat(aValue.replace('$', ''));
      bValue = parseFloat(bValue.replace('$', ''));
    } else if (sortBy === 'lastAppointment') {
      // Convert to date
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <PageHeader title="Customers" />

      <div className="card">
        <div className="card-header">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="card-actions">
            <Link to="/customers/add" className="btn btn-primary">
              + Add Customer
            </Link>
          </div>
        </div>

        <div className="card-body">
          {sortedCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No customers found</h3>
              <p>
                {searchTerm 
                  ? `No customers matching "${searchTerm}"`
                  : 'You don\'t have any customers yet. Add your first customer to get started.'}
              </p>
              {!searchTerm && (
                <Link to="/customers/add" className="btn btn-primary">
                  Add Customer
                </Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable-header">
                      Name
                      {sortBy === 'name' && (
                        <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th onClick={() => handleSort('email')} className="sortable-header">
                      Email
                      {sortBy === 'email' && (
                        <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th>Phone</th>
                    <th onClick={() => handleSort('lastAppointment')} className="sortable-header">
                      Last Booking
                      {sortBy === 'lastAppointment' && (
                        <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th onClick={() => handleSort('totalSpent')} className="sortable-header">
                      Total Spent
                      {sortBy === 'totalSpent' && (
                        <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <Link to={`/customers/${customer.id}`} className="customer-name-link">
                          {customer.name}
                        </Link>
                      </td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{formatDate(customer.lastAppointment)}</td>
                      <td>{customer.totalSpent}</td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                          <Link to={`/customers/${customer.id}/edit`} className="btn btn-sm btn-outline-secondary">
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersList;