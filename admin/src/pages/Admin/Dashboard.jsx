import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'

const Dashboard = () => {

  const { aToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  const formatDate = (dateString) => {
    try {
      // Handle the specific format used in the app: day_month_year
      if (typeof dateString === 'string' && dateString.includes('_')) {
        const dateArray = dateString.split('_');
        if (dateArray.length === 3) {
          const day = dateArray[0];
          const month = dateArray[1];
          const year = dateArray[2];
          
          const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          return `${day} ${months[Number(month)]} ${year}`;
        }
      }
      
      // Fallback for other date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if can't parse
      }
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Return original string if error
    }
  }

  const getStatusColor = (appointment) => {
    if (appointment.cancelled) return 'text-red-500'
    if (appointment.isCompleted) return 'text-green-500'
    return 'text-yellow-500'
  }

  const getStatusText = (appointment) => {
    if (appointment.cancelled) return 'Cancelled'
    if (appointment.isCompleted) return 'Completed'
    return 'Pending'
  }

  // Loading state
  if (!dashData) {
    return (
      <div className='m-5'>
        <div className='flex items-center justify-center min-h-96'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <p className='ml-4 text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='m-5'>
      
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Admin Dashboard</h1>
        <p className='text-gray-600'>Welcome back! Here's an overview of your clinic.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        
        {/* Doctors Card */}
        <div className='flex items-center gap-4 bg-white p-6 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md'>
          <img className='w-14' src={assets.doctor_icon} alt="Doctors" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
            <p className='text-gray-400'>Doctors</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='flex items-center gap-4 bg-white p-6 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md'>
          <img className='w-14' src={assets.appointments_icon} alt="Appointments" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='flex items-center gap-4 bg-white p-6 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md'>
          <img className='w-14' src={assets.patients_icon} alt="Patients" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className='flex items-center gap-4 bg-white p-6 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md'>
          <img className='w-14' src={assets.earning_icon} alt="Revenue" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>${dashData.revenue || 0}</p>
            <p className='text-gray-400'>Revenue</p>
          </div>
        </div>

      </div>

      {/* Latest Appointments Section */}
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-2.5 px-6 py-4 border-b border-gray-200'>
          <img src={assets.list_icon} alt="" className='w-5'/>
          <p className='font-semibold text-gray-800'>Latest Appointments</p>
        </div>

        <div className='pt-4 px-6'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            <div className='space-y-4'>
              {dashData.latestAppointments.slice(0, 5).map((item, index) => (
                <div className='flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 gap-4' key={index}>
                  
                  {/* Patient and Doctor Info */}
                  <div className='flex items-center gap-4 flex-1'>
                    <img 
                      className='rounded-full w-12 h-12 object-cover border-2 border-white shadow-sm' 
                      src={item.docData.image} 
                      alt="Doctor" 
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {item.userData.name}
                      </p>
                      <p className='text-xs text-gray-500 truncate'>
                        Dr. {item.docData.name}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className='flex flex-wrap items-center gap-4 md:gap-6'>
                    <div className='text-center'>
                      <p className='text-xs text-gray-500'>Date</p>
                      <p className='text-sm font-medium text-gray-700'>
                        {formatDate(item.slotDate)}
                      </p>
                    </div>
                    
                    <div className='text-center'>
                      <p className='text-xs text-gray-500'>Time</p>
                      <p className='text-sm font-medium text-gray-700'>
                        {item.slotTime}
                      </p>
                    </div>

                    <div className='text-center'>
                      <p className='text-xs text-gray-500'>Status</p>
                      <p className={`text-sm font-medium ${getStatusColor(item)}`}>
                        {getStatusText(item)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {!item.cancelled && !item.isCompleted && (
                      <div className='flex gap-2'>
                        <img 
                          onClick={() => completeAppointment(item._id)}
                          className='w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200' 
                          src={assets.tick_icon} 
                          alt="Complete" 
                          title="Mark as completed"
                        />
                        <img 
                          onClick={() => cancelAppointment(item._id)}
                          className='w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200' 
                          src={assets.cancel_icon} 
                          alt="Cancel" 
                          title="Cancel appointment"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <img src={assets.appointment_icon} alt="" className='w-16 mx-auto mb-4 opacity-50'/>
              <p className='text-gray-500'>No appointments found</p>
            </div>
          )}
        </div>

        {/* View All Link */}
        {dashData.latestAppointments && dashData.latestAppointments.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200'>
            <a 
              href='/all-appointments' 
              className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200'
            >
              View all appointments →
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className='mt-8'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          
          <a 
            href='/add-doctor' 
            className='flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg justify-center sm:justify-start'
          >
            <img src={assets.add_icon} alt="" className='w-5 h-5 filter invert'/>
            <span className='font-medium'>Add New Doctor</span>
          </a>

          <a 
            href='/doctors-list' 
            className='flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg justify-center sm:justify-start'
          >
            <img src={assets.list_icon} alt="" className='w-5 h-5 filter invert'/>
            <span className='font-medium'>Manage Doctors</span>
          </a>

          <a 
            href='/all-appointments' 
            className='flex items-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg justify-center sm:justify-start'
          >
            <img src={assets.appointments_icon} alt="" className='w-5 h-5 filter invert'/>
            <span className='font-medium'>View All Appointments</span>
          </a>

        </div>
      </div>

    </div>
  )
}

export default Dashboard