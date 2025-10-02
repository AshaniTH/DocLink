import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

    const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)

    useEffect(() => {
        if (dToken) {
            getAppointments()
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

    const calculateAge = (dob) => {
        const birth = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    return (
        <div className='w-full max-w-6xl m-5'>

            <p className='mb-3 text-lg font-medium'>All Appointments</p>

            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
                <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Fees</p>
                    <p>Status</p>
                    <p>Action</p>
                </div>

                {appointments.map((item, index) => (
                    <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
                        <p className='max-sm:hidden'>{index + 1}</p>
                        <div className='flex items-center gap-2'>
                            <img className='w-8 rounded-full' src={item.userData.image} alt="" />
                            <p>{item.userData.name}</p>
                        </div>
                        <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
                        <p>{formatDate(item.slotDate)}, {item.slotTime}</p>
                        <p>${item.amount}</p>
                        <div className='flex'>
                            {item.cancelled ? (
                                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                            ) : item.isCompleted ? (
                                <p className='text-green-500 text-xs font-medium'>Completed</p>
                            ) : (
                                <p className='text-blue-500 text-xs font-medium'>Pending</p>
                            )}
                        </div>
                        <div className='flex gap-1'>
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
    )
}

export default DoctorAppointments