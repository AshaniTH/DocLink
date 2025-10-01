import jwt from 'jsonwebtoken'

//user authentication middleware
const authUser = async (req,res,next)=>{
    try{
        console.log('Headers:', req.headers); // Debug: Check all headers
        const token = req.headers.token || req.headers.authorization?.replace('Bearer ', '')
        console.log('Extracted token:', token); // Debug: Check extracted token
        
        if (!token){
            return res.json({success:false,message:"Not authorized login again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        console.log('Decoded token:', token_decode); // Debug: Check decoded token

        // Initialize req.body if it doesn't exist (for GET requests)
        if (!req.body) {
            req.body = {}
        }
        
        req.body.userId = token_decode.id
        console.log('Set userId:', req.body.userId); // Debug: Check userId

        next()

    }
    catch(error){
        console.log('Auth error:', error)
        res.json({success:false,message:error.message})

    }

}

export default authUser