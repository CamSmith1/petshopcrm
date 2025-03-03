import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('business');
  const [businessSettings, setBusinessSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    timezone: '',
    currency: 'USD',
    logo: null
  });
  
  const [appointmentSettings, setAppointmentSettings] = useState({
    defaultDuration: 30,
    bufferTime: 15,
    minimumNotice: 4,
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance.',
    requireDeposit: false,
    depositAmount: 0
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderTime: 24,
    adminNotifications: true
  });
  
  const [widgetSettings, setWidgetSettings] = useState({
    primaryColor: '#4CAF50',
    secondaryColor: '#2196F3',
    fontFamily: 'Roboto, sans-serif',
    allowGuestBooking: true,
    requirePayment: false
  });

  useEffect(() => {
    // Simulated data loading
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      setBusinessSettings({
        businessName: 'Pawsome Dog Services',
        email: 'info@pawsome.example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, CA 90210',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        logo: null
      });
      
      setLoading(false);
    }, 800);
  }, []);

  const handleBusinessSettingsChange = (e) => {
    const { name, value } = e.target;
    setBusinessSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointmentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWidgetSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWidgetSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    // Handle logo file upload
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, this would upload the file
      toast.info('Logo upload functionality would be implemented here');
    }
  };

  const handleSaveSettings = (settingsType) => {
    // In a real implementation, this would save to API
    toast.success(`${settingsType} settings saved successfully!`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <PageHeader title="Settings" />

      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Business Information
          </button>
          <button 
            className={`settings-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointment Settings
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`settings-tab ${activeTab === 'widget' ? 'active' : ''}`}
            onClick={() => setActiveTab('widget')}
          >
            Widget Customization
          </button>
          <button 
            className={`settings-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users & Permissions
          </button>
          <button 
            className={`settings-tab ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing & Subscription
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'business' && (
            <div className="settings-panel">
              <h2>Business Information</h2>
              <p className="settings-description">
                Update your business details shown to customers and on invoices.
              </p>

              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={businessSettings.businessName}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={businessSettings.email}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={businessSettings.phone}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Business Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={businessSettings.address}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={businessSettings.timezone}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                  >
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                    <option value="America/Chicago">Central Time (US & Canada)</option>
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={businessSettings.currency}
                    onChange={handleBusinessSettingsChange}
                    className="form-control"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="logo">Business Logo</label>
                  <div className="logo-upload">
                    <div className="current-logo">
                      {businessSettings.logo ? (
                        <img src={businessSettings.logo} alt="Business Logo" />
                      ) : (
                        <div className="logo-placeholder">
                          <span>No logo uploaded</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="form-control-file"
                    />
                    <small className="form-text text-muted">
                      Recommended size: 250x250 pixels. Max file size: 2MB.
                    </small>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSaveSettings('Business')}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="settings-panel">
              <h2>Appointment Settings</h2>
              <p className="settings-description">
                Configure how appointments are booked and managed.
              </p>

              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="defaultDuration">Default Appointment Duration (minutes)</label>
                  <select
                    id="defaultDuration"
                    name="defaultDuration"
                    value={appointmentSettings.defaultDuration}
                    onChange={handleAppointmentSettingsChange}
                    className="form-control"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bufferTime">Buffer Time Between Appointments (minutes)</label>
                  <select
                    id="bufferTime"
                    name="bufferTime"
                    value={appointmentSettings.bufferTime}
                    onChange={handleAppointmentSettingsChange}
                    className="form-control"
                  >
                    <option value="0">No buffer</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="minimumNotice">Minimum Booking Notice (hours)</label>
                  <select
                    id="minimumNotice"
                    name="minimumNotice"
                    value={appointmentSettings.minimumNotice}
                    onChange={handleAppointmentSettingsChange}
                    className="form-control"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cancellationPolicy">Cancellation Policy</label>
                  <textarea
                    id="cancellationPolicy"
                    name="cancellationPolicy"
                    value={appointmentSettings.cancellationPolicy}
                    onChange={handleAppointmentSettingsChange}
                    className="form-control"
                    rows="3"
                  />
                  <small className="form-text text-muted">
                    This will be shown to customers during booking.
                  </small>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="requireDeposit"
                    name="requireDeposit"
                    checked={appointmentSettings.requireDeposit}
                    onChange={handleAppointmentSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="requireDeposit" className="form-check-label">
                    Require deposit for booking
                  </label>
                </div>

                {appointmentSettings.requireDeposit && (
                  <div className="form-group">
                    <label htmlFor="depositAmount">Deposit Amount (%)</label>
                    <input
                      type="number"
                      id="depositAmount"
                      name="depositAmount"
                      value={appointmentSettings.depositAmount}
                      onChange={handleAppointmentSettingsChange}
                      className="form-control"
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSaveSettings('Appointment')}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Notification Settings</h2>
              <p className="settings-description">
                Configure email and text notifications for you and your customers.
              </p>

              <form className="settings-form">
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="emailNotifications" className="form-check-label">
                    Send email notifications to customers
                  </label>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="smsNotifications" className="form-check-label">
                    Send SMS notifications to customers
                  </label>
                  <small className="form-text text-muted">
                    Additional charges may apply for SMS notifications.
                  </small>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="appointmentReminders"
                    name="appointmentReminders"
                    checked={notificationSettings.appointmentReminders}
                    onChange={handleNotificationSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="appointmentReminders" className="form-check-label">
                    Send appointment reminders
                  </label>
                </div>

                {notificationSettings.appointmentReminders && (
                  <div className="form-group">
                    <label htmlFor="reminderTime">Send reminder (hours before appointment)</label>
                    <select
                      id="reminderTime"
                      name="reminderTime"
                      value={notificationSettings.reminderTime}
                      onChange={handleNotificationSettingsChange}
                      className="form-control"
                    >
                      <option value="2">2 hours</option>
                      <option value="4">4 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                    </select>
                  </div>
                )}

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="adminNotifications"
                    name="adminNotifications"
                    checked={notificationSettings.adminNotifications}
                    onChange={handleNotificationSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="adminNotifications" className="form-check-label">
                    Receive notifications for new bookings and changes
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSaveSettings('Notification')}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'widget' && (
            <div className="settings-panel">
              <h2>Widget Customization</h2>
              <p className="settings-description">
                Customize the appearance and behavior of your booking widget.
              </p>

              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="primaryColor">Primary Color</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={widgetSettings.primaryColor}
                      onChange={handleWidgetSettingsChange}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={widgetSettings.primaryColor}
                      onChange={handleWidgetSettingsChange}
                      name="primaryColor"
                      className="color-text form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="secondaryColor">Secondary Color</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={widgetSettings.secondaryColor}
                      onChange={handleWidgetSettingsChange}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={widgetSettings.secondaryColor}
                      onChange={handleWidgetSettingsChange}
                      name="secondaryColor"
                      className="color-text form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fontFamily">Font Family</label>
                  <select
                    id="fontFamily"
                    name="fontFamily"
                    value={widgetSettings.fontFamily}
                    onChange={handleWidgetSettingsChange}
                    className="form-control"
                  >
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Lato', sans-serif">Lato</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                  </select>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="allowGuestBooking"
                    name="allowGuestBooking"
                    checked={widgetSettings.allowGuestBooking}
                    onChange={handleWidgetSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="allowGuestBooking" className="form-check-label">
                    Allow guest bookings (no account required)
                  </label>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    id="requirePayment"
                    name="requirePayment"
                    checked={widgetSettings.requirePayment}
                    onChange={handleWidgetSettingsChange}
                    className="form-check-input"
                  />
                  <label htmlFor="requirePayment" className="form-check-label">
                    Require payment at booking
                  </label>
                </div>

                <div className="widget-preview">
                  <h4>Widget Preview</h4>
                  <div className="widget-preview-frame" style={{
                    fontFamily: widgetSettings.fontFamily,
                    borderColor: widgetSettings.primaryColor
                  }}>
                    <div className="preview-header" style={{ backgroundColor: widgetSettings.primaryColor }}>
                      <h3>Book an Appointment</h3>
                    </div>
                    <div className="preview-body">
                      <div className="preview-service" style={{ borderColor: widgetSettings.secondaryColor }}>
                        <span>Dog Walking</span>
                        <button style={{ backgroundColor: widgetSettings.secondaryColor }}>Select</button>
                      </div>
                      <div className="preview-service" style={{ borderColor: widgetSettings.secondaryColor }}>
                        <span>Grooming</span>
                        <button style={{ backgroundColor: widgetSettings.secondaryColor }}>Select</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSaveSettings('Widget')}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="settings-panel">
              <h2>Users & Permissions</h2>
              <p className="settings-description">
                Manage staff accounts and access permissions.
              </p>

              <div className="users-list">
                <div className="user-card">
                  <div className="user-info">
                    <div className="user-avatar">JS</div>
                    <div className="user-details">
                      <h4>John Smith</h4>
                      <p>john.smith@example.com</p>
                      <span className="user-role admin">Administrator</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="btn btn-sm btn-outline-primary">Edit</button>
                  </div>
                </div>

                <div className="user-card">
                  <div className="user-info">
                    <div className="user-avatar">SJ</div>
                    <div className="user-details">
                      <h4>Sarah Johnson</h4>
                      <p>sarah.johnson@example.com</p>
                      <span className="user-role">Staff</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="btn btn-sm btn-outline-primary">Edit</button>
                    <button className="btn btn-sm btn-outline-danger">Remove</button>
                  </div>
                </div>
              </div>

              <div className="add-user-container">
                <button className="btn btn-primary">
                  + Add User
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-panel">
              <h2>Billing & Subscription</h2>
              <p className="settings-description">
                Manage your subscription plan and payment details.
              </p>

              <div className="current-plan">
                <h3>Current Plan</h3>
                <div className="plan-info">
                  <div className="plan-name">
                    <span className="plan-badge premium">Premium</span>
                    <span className="plan-price">$29.99/month</span>
                  </div>
                  <div className="plan-features">
                    <ul>
                      <li>Unlimited appointments</li>
                      <li>Up to 5 staff accounts</li>
                      <li>Email reminders</li>
                      <li>Payment processing</li>
                      <li>Widget customization</li>
                    </ul>
                  </div>
                </div>

                <div className="plan-actions">
                  <button className="btn btn-outline-primary">Change Plan</button>
                </div>
              </div>

              <div className="payment-method">
                <h3>Payment Method</h3>
                <div className="card-info">
                  <div className="card-icon">💳</div>
                  <div className="card-details">
                    <p>Visa ending in 4242</p>
                    <p>Expires: 12/2025</p>
                  </div>
                </div>

                <div className="payment-actions">
                  <button className="btn btn-outline-primary">Update Payment Method</button>
                </div>
              </div>

              <div className="billing-history">
                <h3>Billing History</h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Mar 1, 2025</td>
                        <td>Premium Plan - Monthly</td>
                        <td>$29.99</td>
                        <td><span className="status-badge badge-success">Paid</span></td>
                        <td><button className="btn btn-sm btn-link">Download</button></td>
                      </tr>
                      <tr>
                        <td>Feb 1, 2025</td>
                        <td>Premium Plan - Monthly</td>
                        <td>$29.99</td>
                        <td><span className="status-badge badge-success">Paid</span></td>
                        <td><button className="btn btn-sm btn-link">Download</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;