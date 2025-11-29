import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

const ResetPassword = () => {
    const { backendUrl } = useContext(AdminContext)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const { token } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const params = new URLSearchParams(location.search)
    const type = (params.get('type') || 'admin').toLowerCase()

    const onSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 8) return toast.error('Password must be at least 8 characters')
        if (password !== confirm) return toast.error('Passwords do not match')

        try {
            const url = (type === 'doctor') ? `${backendUrl}/api/doctor/reset-password` : `${backendUrl}/api/admin/reset-password`
            const { data } = await axios.post(url, { token, password })
            if (data.success) {
                toast.success(data.message)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmit} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg '>
                <p className='text-2xl font-semibold m-auto'>Reset Password</p>
                <div className='w-full '>
                    <p>New Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
                </div>
                <div className='w-full '>
                    <p>Confirm Password</p>
                    <input onChange={(e) => setConfirm(e.target.value)} value={confirm} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
                </div>

                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Reset Password</button>
            </div>
        </form>
    )
}

export default ResetPassword
