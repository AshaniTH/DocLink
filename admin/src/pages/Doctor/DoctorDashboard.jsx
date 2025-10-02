import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)

    useEffect(() => {
        if (dToken) {
            getDashData()
        }
    }, [dToken])

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
        return 'text-blue-500'
    }

    const getStatusText = (appointment) => {
        if (appointment.cancelled) return 'Cancelled'
        if (appointment.isCompleted) return 'Completed'
        return 'Pending'
    }

    return dashData && (
        <div className='m-5'>

            <div className='flex flex-wrap gap-3'>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.earning_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>${dashData.earnings}</p>
                        <p className='text-gray-400'>Earnings</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.appointments_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
                        <p className='text-gray-400'>Appointments</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.patients_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
                        <p className='text-gray-400'>Patients</p>
                    </div>
                </div>

            </div>

            <div className='bg-white'>
                <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
                    <img src={assets.list_icon} alt="" />
                    <p className='font-semibold'>Latest Appointments</p>
                </div>

                <div className='pt-4 border border-t-0'>
                    {dashData.latestAppointments.map((item, index) => (
                        <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50' key={index}>
                            <img className='rounded-full w-10' src={item.userData.image} alt="" />
                            <div className='flex-1 text-sm'>
                                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                                <p className='text-gray-600'>{formatDate(item.slotDate)}</p>
                            </div>
                            <div className='flex gap-2'>
                                {item.cancelled ? (
                                    <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                                ) : item.isCompleted ? (
                                    <p className='text-green-500 text-xs font-medium'>Completed</p>
                                ) : (
                                    <>
                                        <img
                                            onClick={() => cancelAppointment(item._id)}
                                            className='w-10 cursor-pointer'
                                            src={assets.cancel_icon}
                                            alt=""
                                        />
                                        <img
                                            onClick={() => completeAppointment(item._id)}
                                            className='w-10 cursor-pointer'
                                            src={assets.tick_icon}
                                            alt=""
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard