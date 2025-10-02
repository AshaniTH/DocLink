import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'


const MyAppointment = () => {

const{backendUrl,token, getDoctorsData}= useContext(AppContext)

const [appointments,setAppointments] = useState([])
const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const slotDateformat = (slotdate) =>{
  const dateArray = slotdate.split('_')
  return dateArray['0']+ " " +months[Number(dateArray[1])] + " " +dateArray[2]
}
const getuserAppointments = async()=>{
  try{
    const {data} = await axios.get(backendUrl +'/api/user/appointments',{headers:{token}})
    if (data.success){
      setAppointments(data.appointments.reverse())
    }

  }
  catch(error){
    console.log(error)
    toast.error(error.message)

  }
}

const cancelAppointment = async(appointmentId) =>{
  try{
    const {data} = await axios.post(backendUrl +'/api/user/cancel-appointment',{appointmentId},{headers:{token}})
    if (data.success){
      toast.success(data.message)
      getuserAppointments()
      getDoctorsData()
      
    }else{
      toast.error(data.message)
    }

  }
  catch(error){
    console.log(error)
    toast.error(error.message)

  }
}


const initializePayment = async (appointmentId) => {
  try {
    const { data } = await axios.post(backendUrl + '/api/user/initialize-payment', { appointmentId }, { headers: { token } })
    
    if (data.success) {
      // Initialize PayHere payment
      const payment = {
        ...data.paymentData,
        onCompleted: function(orderId) {
          console.log("Payment completed. OrderID:" + orderId);
          toast.success('Payment completed successfully!')
          getuserAppointments() // Refresh appointments
        },
        onDismissed: function() {
          console.log("Payment dismissed");
          toast.info('Payment was dismissed')
        },
        onError: function(error) {
          console.log("Error:" + error);
          toast.error('Payment failed: ' + error)
        }
      }

      // Check if PayHere is loaded
      if (window.payhere) {
        window.payhere.startPayment(payment)
      } else {
        toast.error('PayHere payment gateway not loaded')
      }
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.log(error)
    toast.error(error.message)
  }
}

useEffect(()=>{
  if(token){
    getuserAppointments()
  }
},[token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b' >My Appointment</p>
      <div>
{
  appointments.map((item,index)=>(
    <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
      <div>
        <img className='w-32 h-32 bg-indigo-50' src={item.docData.image} alt="" />
      </div>
      <div className='flex-1 text-sm text-zinc-600'>
        <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
        <p>{item.speciality}</p>
        <p className='text-zinc-700 font-medium mt-1'>Address:</p>
        <p className='text-xs' > {item.docData.address.line1}</p>
        <p className='text-xs'> {item.docData.address.line2}</p>
        <p className='text-xs mt-1'><span className='text-5m text-neutral-700 font-medium'>Date & Time </span>{slotDateformat(item.slotDate)} | {item.slotTime}</p>
      </div>
      <div></div>

      <div className='flex flex-col gap-2 justify-center'>
        {!item.cancelled && !item.payment && (
          <button 
            onClick={() => initializePayment(item._id)} 
            className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
          > 
            Pay Online 
          </button>
        )}
        {!item.cancelled && item.payment && (
          <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
            Paid
          </button>
        )}
        {!item.cancelled && !item.payment && (
          <button 
            onClick={() => cancelAppointment(item._id)} 
            className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-500 hover:text-white transition-all duration-300'
          >
            Cancel Appointment
          </button>
        )}
        {item.cancelled && (
          <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
            Appointment Cancelled
          </button>
        )}
      </div>

    </div>
  ))
}
      </div>
    </div>
  )
}

export default MyAppointment