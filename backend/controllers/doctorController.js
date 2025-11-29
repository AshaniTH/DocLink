import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
import sendMail from '../config/mail.js'

const changeAvailability = async (req,res) => {
    try{
        const{docId} = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
        res.json({success:true,message:'Availability status changed'})
    }
    catch(error){
        console.log(error)
       res.json({success:false,message:error.message}) 
    }

}

const doctorList = async (req,res) =>{
    try{
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get doctor appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Mark appointment as completed by doctor
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment completed' })
        } else {
            return res.json({ success: false, message: 'Mark Failed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel appointment by doctor
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment cancelled' })
        } else {
            return res.json({ success: false, message: 'Cancellation Failed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get doctor dashboard data
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update doctor profile from doctor panel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId } = req
        const { fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Doctor - initiate forgot password
const forgotPasswordDoctor = async (req, res) => {
    try {
        const { email } = req.body
        const doctor = await doctorModel.findOne({ email })
        if (!doctor) return res.json({ success: false, message: 'No doctor found with that email' })

        const token = crypto.randomBytes(20).toString('hex')
        doctor.resetPasswordToken = token
        doctor.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        await doctor.save()

        const client = process.env.CLIENT_URL || 'http://localhost:5174'
        const resetUrl = `${client}/reset-password/${token}?type=doctor`

        const text = `You requested a password reset. Click/visit the link to reset your password: ${resetUrl}`
        const html = `<p>You requested a password reset.</p><p>Click the link below to reset your password (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`

        await sendMail({ to: doctor.email, subject: 'Doctor Password Reset', text, html })

        res.json({ success: true, message: 'Password reset email sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Doctor - complete reset with token
const resetPasswordDoctor = async (req, res) => {
    try {
        const { token, password } = req.body
        const doctor = await doctorModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        if (!doctor) return res.json({ success: false, message: 'Invalid or expired token' })

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)
        doctor.password = hashed
        doctor.resetPasswordToken = undefined
        doctor.resetPasswordExpires = undefined
        await doctor.save()

        res.json({ success: true, message: 'Password updated successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    forgotPasswordDoctor,
    resetPasswordDoctor
}