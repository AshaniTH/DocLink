import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import { v2 as cloudinary} from 'cloudinary'
import { payhereConfig, generateHash } from '../config/payhereConfig.js'
//API to rejister user

const registerUser = async (req,res) =>{
    try{
        const {name,email,password} =req.body

        if(!name || !email || !password){
            return res.json({success:false,message:"All fields are required"})
        }
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Invalid Email"})
        }

        if(password.length < 8){
            return res.json({success:false,message:"Weak Password"})
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true,token})

        

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
}
//api for user login
const loginUser = async (req,res) =>{
    try{
        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            return res.json({success:true,token})
        }else{
            return res.json({success:false,message:"Invalid credentials"})
        }
            
        

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//api to get user profile data
const getProfile = async (req, res) => {
    try{
        const {userId} = req.body;
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to update user profile
const updateProfile = async (req,res) =>{
    try{
        const {userId,name,phone,address,dob,gender} = req.body
        const imageFile = req.file

        if(!name || !phone || !dob ||!gender){
            return res.json({success:false,message:"Data missing"})

        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        if(imageFile){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})

            
    }
    res.json({success:true,message:"Profile Updated Successfully"})
}
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
}

//API to book appointment
const bookAppointment = async (req,res) =>{
    try{
        const {userId,docId,slotDate,slotTime} = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available){
            return res.json({success:false,message:'Doctor not available'})

        }
        let slots_booked = docData.slots_booked

        //checking for slot availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:'Slot not available'})
        }else{
            slots_booked[slotDate].push(slotTime)
        }
    }else{
        slots_booked[slotDate] = []
        slots_booked[slotDate].push(slotTime)
    }
    const userData = await userModel.findById(userId).select('-password')

    delete docData.slots_booked

    const appointmentData = {
        userId,
        docId,
        userData,
        docData,
        amount:docData.fees,
        slotTime,
        slotDate,
        date:Date.now()
    }
    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // save new slots data in docData

    await doctorModel.findByIdAndUpdate(docId,{slots_booked})

    res.json({success:true,message:'Appointment booked successfully'})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to get user appointments for frontend my appointment page 
const listAppointment = async (req,res) =>{
    try{
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true,appointments})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to cancel appointment

const cancelAppointment = async (req,res) =>{
    try{
        const {userId,appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        //verify appointment user

        if(appointmentData.userId !== userId){
            return res.json({success:false,message:"Unauthorized request"})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        // releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment cancelled successfully"})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to initialize PayHere payment
const initializePayment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const { userId } = req.body

        // Get appointment details
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        // Verify appointment belongs to user
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" })
        }

        // Check if already paid
        if (appointment.payment) {
            return res.json({ success: false, message: "Payment already completed" })
        }

        // Generate unique order ID
        const orderId = `ORDER_${appointmentId}_${Date.now()}`
        
        // Generate PayHere hash
        const hash = generateHash(orderId, appointment.amount, 'LKR')

        // PayHere payment data
        const paymentData = {
            merchant_id: payhereConfig.merchant_id,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-appointments`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-appointments`,
            notify_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/user/payment-notify`,
            order_id: orderId,
            items: `Consultation with ${appointment.docData.name}`,
            amount: appointment.amount,
            currency: 'LKR',
            hash: hash,
            first_name: appointment.userData.name.split(' ')[0],
            last_name: appointment.userData.name.split(' ')[1] || '',
            email: appointment.userData.email,
            phone: appointment.userData.phone || '',
            address: appointment.userData.address?.line1 || '',
            city: 'Colombo',
            country: 'Sri Lanka',
            sandbox: payhereConfig.sandbox
        }

        // Update appointment with order ID for tracking
        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            orderId: orderId,
            paymentInitiated: true 
        })

        res.json({ 
            success: true, 
            paymentData,
            checkoutUrl: payhereConfig.checkoutUrl
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify PayHere payment
const verifyPayment = async (req, res) => {
    try {
        const paymentData = req.body
        console.log('Payment notification received:', paymentData)

        // Import verifyPayment function from config
        const { verifyPayment: verifyPaymentHash } = await import('../config/payhereConfig.js')
        
        // Verify payment authenticity
        if (!verifyPaymentHash(paymentData)) {
            console.log('Payment verification failed')
            return res.status(400).send('Invalid payment data')
        }

        const { order_id, status_code, payhere_amount } = paymentData

        // Find appointment by order ID
        const appointment = await appointmentModel.findOne({ orderId: order_id })
        if (!appointment) {
            console.log('Appointment not found for order:', order_id)
            return res.status(404).send('Appointment not found')
        }

        // Update appointment based on payment status
        if (status_code == 2) { // Success
            await appointmentModel.findByIdAndUpdate(appointment._id, {
                payment: true,
                paymentStatus: 'completed',
                paymentAmount: payhere_amount,
                paymentDate: new Date()
            })
            console.log('Payment completed for appointment:', appointment._id)
        } else if (status_code == -1) { // Cancelled
            await appointmentModel.findByIdAndUpdate(appointment._id, {
                paymentStatus: 'cancelled'
            })
            console.log('Payment cancelled for appointment:', appointment._id)
        } else if (status_code == -2) { // Failed
            await appointmentModel.findByIdAndUpdate(appointment._id, {
                paymentStatus: 'failed'
            })
            console.log('Payment failed for appointment:', appointment._id)
        }

        res.status(200).send('OK')

    } catch (error) {
        console.log('Payment verification error:', error)
        res.status(500).send('Payment verification failed')
    }
}


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,initializePayment, verifyPayment}