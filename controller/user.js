import userModel from '../model/user.js'
import Token from '../model/token.js'
import Auth from '../common/auth.js'
import Randomstring from 'randomstring'
import sendEmail from '../common/sendMail.js'

const create = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(!user){
            req.body.password = await Auth.hashPassword(req.body.password)
            await userModel.create(req.body)
            res.status(201).send({
                message:"User Created Successfully"
             })
        }
        else
        {
            res.status(400).send({message:`User with ${req.body.email} already exists`})
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

const login = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(user)
        {
            let hashCompare = await Auth.hashCompare(req.body.password,user.password)
            if(hashCompare)
            {
                let token = await Auth.createToken({
                    id:user._id,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    email:user.email,
                })
                let userData = await userModel.findOne({email:req.body.email},{_id:0,password:0,createdAt:0,email:0})
                res.status(200).send({
                    message:"Login Successfull",
                    token,
                    userData
                })
            }
            else
            {
                res.status(400).send({
                    message:`Invalid Password`
                })
            }
        }
        else
        {
            res.status(400).send({
                message:`Account with ${req.body.email} does not exists!`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

const getAllUsers = async(req,res)=>{
    try {
        let users = await userModel.find()
        res.status(200).send({
            message:"Users Fetched Successfully",
            users
            
        })
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

const forgetPassword = async (req, res)=>{
    try {
        await Token.deleteMany();
        const user = await userModel.findOne({email:req.body.email});
    
        if (!user)
        {
            return res.send("user with given email doesn't exist");
        }
else{
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
        token = await new Token({   
            userId: user._id,
            token:`${Randomstring.generate({
                length: 7,
                charset: 'alphabetic'
              })}`
        }).save();
    }
    console.log(user)
    res.send({
        token,
        message:"ok",
 email:`${req.body.email}`,
})
await sendEmail(user.email,"Password reset",token.token)
}
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
    })
}
}

const resetPassword = async (req, res) => {
    try {
            const token= await Token.findOne()
            const Id =token.userId
            let user = await userModel.findOne({_id:Id})
            if(Id.toString() != user._id.toString())
            {
                    return res.send("userId doesn't match");
            }
            const key=token.token
            const key1=req.body.token
            if(key!=key1)
            {
                return res.send("Reset key doesn't match");
            }
            req.body.password = await Auth.hashPassword(req.body.password)
            user.password=req.body.password
            await user.save();
            await Token.deleteOne();
            res.status(200).send({message:"Password reset successfully."})

    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
};


export default {
    create,
    login,
    getAllUsers,
    resetPassword,
    forgetPassword
}