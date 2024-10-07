
const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

const auth = require('../middlewares/auth')


router.post('/tasks',auth,async(req, res)=>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body, owner: req.user._id
    })

    try{
        await task.save()
        res.send(task)
    } catch (error){
        res.status(400).send(error)
    }

    // task.save().then(()=>{
    //     console.log(task)
    //     res.send(task)
    // }).catch((error)=>{
    //     res.status(400)
    //     res.send(error)
    // })
})



// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
// router.get('/tasks', auth,async(req, res)=>{
//     const match ={}
//     const sort = {}
//     if (req.query.completed){
//         match.completed = req.query.completed === 'true'
//     }
//     if (req.query.sortBy){
//         const parts = req.query.sortBy.split(':')
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
//     }
//     try{
//         // const task = await Task.find({})
//         await req.user.populate({
//             path: 'tasks',
//             match,
//             // These limit and skips are used for pagination and these are queries provided by the browser
//             limit: parseInt(req.query.limit),
//             skip: parseInt(req.query.skip),
//             sort: sort

//         }).execPopulate()
    
//         res.send(req.user.tasks)
//     } catch (e){
//         res.status(500).send(e)
//     }
//     // Task.find().then((task)=>{
//     //     res.send(task)
//     // }).catch(()=>{
//     //     res.status(500)
//     // })
// })

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})





router.get('/tasks/:id',auth, async (req, res)=>{
    const _id = req.params.id

    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task){
            res.send(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
    // Task.findById(_id).then((task)=>{
    //     if (!task){
    //        return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((error)=>{
    //     res.status(500).send()

    // })
})



router.patch('/tasks/:id', auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation){
        return res.status(400).send('Error: Invalid data')
    }
    try{
        // find the task, alter the task property , save the task 
        // const task = await Task.findByIdAndUpdate(req.params.id)
        const task = await Task.findOne({_id, owner: req.user._id})


        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true} )
        if (!task){
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        
        
        res.send(task)

    }catch(e){
        res.status(500).send()

    }

})

router.delete('/tasks/:id', auth, async(req,res)=>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
        if (!task){
            return res.status(400).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }

})

module.exports = router