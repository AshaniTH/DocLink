
import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import adminModel from '../models/adminModel.js'
import crypto from 'crypto'
import sendMail from '../config/mail.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'



//API For adding doctors
const addDoctor = async ( req,res)=>{
    try{

        const {
            name,email,password,speciality,degree,experience,about,fees,address
        } = req.body
        const imageFile = req.file

        //checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile){
            return res.json({success:false,message:"Missing Details"})
        }

        //validating email format
        if (!validator.isEmail(email)){
            return res.json({success:false,message:"Invalid Email Format"})
        }

        //validating strong password
        if (password.length<8){
            return res.json({success:false,message:"Password must be at least 8 characters"})
        }

        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now(),

        }
        const newDoctor = new doctorModel(doctorData)
        
        await newDoctor.save()
        
        res.json({success:true,message:"Doctor Added Successfully"})

    } catch (error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
// API for admin login
const loginAdmin = async (req,res) =>{
    try{
        const {email,password} = req.body

        // First try looking up in DB-admins
        const admin = await adminModel.findOne({ email })
        if (admin) {
            const match = await bcrypt.compare(password, admin.password)
            if (match) {
                const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET)
                return res.json({ success: true, token })
            }
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        // Fallback to legacy env-based admin credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            return res.json({success:true,token})
        }

        res.json({success:false,message:"Invalid credentials"})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Admin - initiate forgot password
const forgotPasswordAdmin = async (req, res) => {
    try {
        const { email } = req.body
        // if admin record exists
        const admin = await adminModel.findOne({ email })
        if (!admin) return res.json({ success: false, message: 'No admin found with that email' })

        const token = crypto.randomBytes(20).toString('hex')
        admin.resetPasswordToken = token
        admin.resetPasswordExpires = Date.now() + 3600000
        await admin.save()

        const client = process.env.CLIENT_URL || 'http://localhost:5174'
        const resetUrl = `${client}/reset-password/${token}?type=admin`
        const text = `Reset your admin password: ${resetUrl}`
        const html = `<p>Reset your admin password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`

        await sendMail({ to: admin.email, subject: 'Admin Password Reset', text, html })
        res.json({ success: true, message: 'Password reset email sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin - complete reset
const resetPasswordAdmin = async (req, res) => {
    try {
        const { token, password } = req.body
        const admin = await adminModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        if (!admin) return res.json({ success: false, message: 'Invalid or expired token' })

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)
        admin.password = hashed
        admin.resetPasswordToken = undefined
        admin.resetPasswordExpires = undefined
        await admin.save()

        res.json({ success: true, message: 'Admin password updated successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get all doctors list for admin panel

const allDoctors = async (req,res)=>{
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }

}
//API to get all appointments list
const appointmentsAdmin = async (req,res) =>{
    try{
        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to cancel appointment for admin
const appointmentCancel = async (req,res) => {
    try{
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        
        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})
        
        res.json({success:true,message:'Appointment Cancelled'})
        
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to mark appointment complete for admin
const appointmentComplete = async (req,res) => {
    try{
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        
        await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted:true})
        
        res.json({success:true,message:'Appointment Completed'})
        
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to get dashboard statistics
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const appointments = await appointmentModel.find({})
        
        // Get latest appointments (already have userData and docData embedded)
        const latestAppointments = await appointmentModel.find({})
            .sort({ date: -1 })
            .limit(5)
        
        // Calculate total revenue from completed appointments
        const completedAppointments = appointments.filter(appointment => appointment.isCompleted && !appointment.cancelled)
        const totalRevenue = completedAppointments.reduce((total, appointment) => total + (appointment.amount || 0), 0)
        
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: new Set(appointments.map(appointment => appointment.userId)).size,
            latestAppointments: latestAppointments,
            revenue: totalRevenue
        }
        
        res.json({success: true, dashData})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {addDoctor,loginAdmin,allDoctors,appointmentsAdmin,appointmentCancel,appointmentComplete,adminDashboard,forgotPasswordAdmin,resetPasswordAdmin}