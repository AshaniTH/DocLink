import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext.jsx'
import { assets } from '../../assets/assets.js'

const AllAppointment = () => {

  const {aToken,appointments,getAllAppointments,cancelAppointment,completeAppointment} = useContext(AdminContext)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(()=>{
    if (aToken){
      getAllAppointments()
    }
  },[aToken])

  const calculateAge = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Filter and search appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    const statusMatch = 
      filter === 'All' ? true :
      filter === 'Pending' ? !appointment.cancelled && !appointment.isCompleted :
      filter === 'Completed' ? appointment.isCompleted :
      filter === 'Cancelled' ? appointment.cancelled : true

    // Search by patient name or doctor name
    const searchMatch = searchTerm === '' || 
      appointment.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.docData.name.toLowerCase().includes(searchTerm.toLowerCase())

    return statusMatch && searchMatch
  })

  // Calculate statistics
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter(app => app.isCompleted).length
  const cancelledAppointments = appointments.filter(app => app.cancelled).length
  const pendingAppointments = appointments.filter(app => !app.isCompleted && !app.cancelled).length

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment(appointmentId)
    }
  }

  const handleCompleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to mark this appointment as completed?')) {
      completeAppointment(appointmentId)
    }
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      
      {/* Statistics Cards */}
      <div className='flex flex-wrap gap-3 mb-5'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{totalAppointments}</p>
            <p className='text-gray-400'>Total Appointments</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.tick_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-green-600'>{completedAppointments}</p>
            <p className='text-gray-400'>Completed</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.cancel_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-red-600'>{cancelledAppointments}</p>
            <p className='text-gray-400'>Cancelled</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointment_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-blue-600'>{pendingAppointments}</p>
            <p className='text-gray-400'>Pending</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className='flex flex-col sm:flex-row gap-4 mb-4'>
        {/* Search Bar */}
        <div className='flex-1'>
          <input
            type="text"
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
          />
        </div>
        
        {/* Filter Buttons */}
        <div className='flex gap-2'>
          {['All', 'Pending', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>No appointments found matching your criteria</p>
          </div>
        ) : (
          filteredAppointments.reverse().map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={item._id}>
              <p className='max-sm:hidden'>{index + 1}</p>
              
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" />
                <p>{item.userData.name}</p>
              </div>
              
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              
              <p>{item.slotDate}, {item.slotTime}</p>
              
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full bg-gray-200' src={item.docData.image} alt="" />
                <p>{item.docData.name}</p>
              </div>
              
              <p>${item.amount}</p>
              
              {item.cancelled 
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted 
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                      <img 
                        onClick={() => handleCancelAppointment(item._id)} 
                        className='w-10 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.cancel_icon} 
                        alt="Cancel" 
                        title="Cancel Appointment"
                      />
                      <img 
                        onClick={() => handleCompleteAppointment(item._id)} 
                        className='w-10 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.tick_icon} 
                        alt="Complete" 
                        title="Mark as Completed"
                      />
                    </div>
              }
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AllAppointment