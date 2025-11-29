import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'

const ForgotPassword = () => {
    const { backendUrl } = useContext(AdminContext)
    const { backendUrl: backendUrlDoc } = useContext(DoctorContext)
    const [email, setEmail] = useState('')
    const location = useLocation()

    // type can be provided as query param ?type=Admin or ?type=Doctor
    const params = new URLSearchParams(location.search)
    const type = (params.get('type') || 'Admin').toLowerCase()

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = (type === 'doctor') ? `${backendUrl}/api/doctor/forgot-password` : `${backendUrl}/api/admin/forgot-password`
            // backendUrl is same for both AdminContext in admin app
            const { data } = await axios.post(url, { email })
            if (data.success) toast.success(data.message)
            else toast.error(data.message)
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmit} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg '>
                <p className='text-2xl font-semibold m-auto'>Forgot Password</p>
                <div className='w-full '>
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
                </div>

                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Send Reset Link</button>
            </div>
        </form>
    )
}

export default ForgotPassword
