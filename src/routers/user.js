const express = require('express')
const multer = require('multer')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middlewares/auth')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')


router.post('/users',async(req,res)=>{
    // creates a new user
    const user = new User(req.body)
    
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
    // // save the new user
    // user.save().then(()=>{
    //     res.send(user)
    // }).catch((error)=>{
    //     // update status code
    //     res.status(400)
    //     res.send(error)
    // })

})

router.post('/users/login',async(req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user, token})
    } catch(e){
        res.status(400).send()
    }
})
router.get('/users',async(req, res)=>{

    try{
        const user = await User.find({})
        res.send(user)
    } catch (e){
        res.status.send(e)
    }
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((error)=>{
    //     res.status(500).send()
    // })
})
router.get('/users/me', auth, async(req,res)=>{
    res.send(req.user)
})
// This will log you out from the particular device you are logged in
router.post('/users/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()

    } catch(e){
        res.status(500).send()

    }
    
})
// This will log you out from all devices
router.post('/users/logoutall', auth, async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch(e){
        res.status(500).send()
    }
})
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

// This can be used for changing your avatar and uploading it
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // This line will take the image from the client side and use sharp to restructure it before saving to DB
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}), (error, req, res, next)=>{
    res.status(400).send({error: error.message})
}

router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            throw new Error
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})
// router.get('/users/:id', async(req, res)=>{
//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
//         if (!user){
//             res.send(404).send()
//         }
//         res.send(user)
//     } catch(e){
//         res.status(500).send()
//     }
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         res.status(500).send('User does not exist')
//     //     }
//     //     res.send(user)
//     // }).catch((error)=>{
//     //     res.status(500).send()

//     // })
// })

// router.patch('/users/:id', async(req, res)=>{
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
//     if (!isValidOperation){
//         return res.status(400).send('Error: Invalid data')
//     }
//     try{
//         const user = await User.findByIdAndUpdate(req.params.id)
//         updates.forEach((update)=> user[update] = req.body[update])
//         await user.save()
//         // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true} )
//         if (!user){
//             return res.status(404).send()
//         }
//         res.send(user)

//     }catch(e){
//         res.status(500).send()

//     }

// })


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.delete('/users/:id', async(req,res)=>{

//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user){
//             return res.status(400).send()
//         }
//         res.send(user)
//     } catch(e){
//         res.status(500).send()
//     }

// })

router.delete('/users/me', auth, async (req, res) => {
    try {
        const userId = req.user._id
        await User.findByIdAndDelete(userId)
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router