import bcrypt from 'bcryptjs';
import User from "../models/user_model.js"
import jwt from 'jsonwebtoken'
export const Register = async (req, res) => {
    try {
        const { name, address, email, password } = req.body

        const checkRegisrationStatus = await User.findOne({ email })

        if (checkRegisrationStatus) {
            return res.status(409).json({
                status: false,
                message: "User Already Have Register"
            })

        }

        //hash password and Register the from in data base

        const hashPassword = bcrypt.hashSync(password)
        const newRegistration = new User({
            name, address, email, password: hashPassword
        })
        //save the new data
        await newRegistration.save()

        res.status(200).json({
            status: true,
            message: "Registartion Sucess"
        })

    } catch (error) {
        res.status(500).json({
            status: false, error
        })
    }

}


//login
export const Login = async (req, res) => {
    try {
        const {  email, password } = req.body

        const user = await User.findOne({ email }).lean().exec()

        if (!user) {
            return res.status(403).json({
                status: false,
                message: "Invalid Login Credntials"
            })}
            
            //check Password 
            const isVerifyPassword = await bcrypt.compare(password,user.password)
            if(!isVerifyPassword){
                return res.status(403).json({
                status: false,
                message: "Invalid Login Credntials"
            })
            }

            delete user.password

            //create the token for pass password
            const token = await jwt.sign(user, process.env.JWT_SECRET)

            res.cookie('access_token', token, {
                httpOnly: true
            
            })
            res.status(200).json({
                status: true,
                message: "Login Sucess"
            })
        

    } catch (error) {
        res.status(500).json({
            status: false, error
        })
    }

}