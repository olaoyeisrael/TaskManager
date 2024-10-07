// const request = require('supertest')
// const app = require('../src/app')
// const User = require('../src/models/user')
// const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

// beforeEach(setupDatabase)






// test('Should signup a new user', async()=>{
//     const response = await request(app).post('/users').send({
//         name: 'Asiwaju Damilare',
//         email: 'olaoyeaisrael@gmail.com',
//         password: 'Asiwaju412'
//     }).expect(201)

//     // Assert that the database was changed correctly
//     const user = await User.findById(response.body.user._id)
//     expect(user).not.toBeNull()

//     // Assertions about the response
//     expect(response.body).toMatchObject({
//         user: {
//             name: 'Asiwaju Damilare',
//             email: 'olaoyeaisrael@gmail.com',
//         }, 
//         token: user.tokens[0].token
//     })
//     expect (user.password).not.toBe('Asiwaju412')
// })

// test('Should login an existing user', async()=>{
//     const response = await request(app).post('/users/login').send({
//         email: userOne.email,
//         password: userOne.password
//     }).expect(200)
//     const user = await User.findById(userOneId)
//     expect (response.body.token).toBe(user.tokens[1].token)

// } )

// test('Should not login a nonexisting user', async()=>{
//     await request(app).post('/users/login').send({
//         email: 'aduragbemi@gmail.com',
//         password: userOne.password
//     }).expect(400)
// } )


// test('should get profile for user', async()=>{
//     await request(app)
//         .get('/users/me')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .send()
//         .expect(200)
// })

// test('should not get profile for an unauthenticated user', async()=>{
//     await request(app)
//         .get('/users/me')
//         .send()
//         .expect(401)
// })

// test('should delete profile for a user', async()=>{
//     await request(app)
//         .delete('/users/me')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .send()
//         .expect(200)
//     const user = await User.findById(userOneId)
//     expect(user).toBeNull() 
// })

// // test('should delete profile for a user', async()=>{
// //     await request(app)
// //         .delete('/users/me')
// //         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
// //         .send()
// //         .expect(200)
// // })

// test('should not delete profile for an unauthorized user', async()=>{
//     await request(app)
//         .delete('/users/me')
//         .send()
//         .expect(401)
// })

// test('Should upload avatar image', async ()=>{
//     await request(app)
//         .post('/users/me/avatar')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .attach('avatar', 'tests/fixtures/noun-mentorship.png')
//         .expect(200)

//     const user = await User.findById(userOneId)
//     expect (user.avatar).toEqual(expect.any(Buffer))
// })

// test('Should update valid user field', async ()=>{
//     await request(app)
//         .patch('/users/me')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .send({
//             name: 'Adura'
//         })
//         .expect(200)

//     const user = await User.findById(userOneId)
//     expect(user.name).toEqual('Adura')

// })

// test('Should not update invalid user field', async ()=>{
//     await request(app)
//         .patch('/users/me')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .send({
//             loaction: 'Nigeria'
//         })
//         .expect(400)
// })

const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'MyPass777!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'thisisnotmypass'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/noun-mentorship.png')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jess'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Philadelphia'
        })
        .expect(400)
})