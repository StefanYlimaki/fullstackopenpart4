const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

describe('api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    await User.insertMany(helper.initialUsers)
    await Blog.insertMany(helper.initialBlogs)
  })

  test('4.8 blogs return as json', async () => {
    await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/)

  })

  test('4.8 there are correct amount of blogs', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('4.9 the id-field is not _id', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].id).toBeDefined()
  })

  test('4.10 a valid blog can be added', async () => {
    const newUser = {
      username: 'steffe',
      name: 'Stefan Ylimäki',
      password: 'muumiukko'
    }

    await api.post('/api/users/').send(newUser)

    const userToBeLoggedIn = {
      username:'steffe',
      password:'muumiukko'
    }
    const response2 = await api.post('/api/login/').send(userToBeLoggedIn)

    let token = 'bearer '
    token += response2.body.token

    const newBlog = {
      id: '6a422b3a1b54a676234d17f9',
      title: 'Pekka Puupään seikkailut',
      author: 'Pekka Puupää',
      url: 'http://pekkapuupaa.com',
      likes: 2
    }

    await api
      .post('/api/blogs/')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('Pekka Puupään seikkailut')
  })

  test('4.11 likes set to zero by default', async () => {

    const newUser = {
      username: 'steffe',
      name: 'Stefan Ylimäki',
      password: 'muumiukko'
    }

    await api.post('/api/users/').send(newUser)

    const userToBeLoggedIn = {
      username:'steffe',
      password:'muumiukko'
    }

    const response = await api.post('/api/login/').send(userToBeLoggedIn)

    let token = 'bearer '
    token += response.body.token

    const newBlog = {
      _id: '6a422b3a1b54a676234d17f9',
      title: 'Pekka Puupään seikkailut',
      author: 'Pekka Puupää',
      url: 'http://pekkapuupaa.com',
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('Pekka Puupään seikkailut')

    const resultBlog = await api
      .get('/api/blogs/6a422b3a1b54a676234d17f9')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body.likes).toEqual(0)
  })

  test('4.12 blog POST without url and title return 400 Bad Request', async () => {
    const newUser = {
      username: 'steffe',
      name: 'Stefan Ylimäki',
      password: 'muumiukko'
    }

    await api.post('/api/users/').send(newUser)

    const userToBeLoggedIn = {
      username:'steffe',
      password:'muumiukko'
    }

    const response = await api.post('/api/login/').send(userToBeLoggedIn)

    let token = 'bearer '
    token += response.body.token

    const blogWithoutTitle = {
      _id: '6a422b3a1b54a676234d17f9',
      author: 'Pekka Puupää',
      url: 'http://pekkapuupaa.com',
      likes: 2,
      __v: 0
    }

    const blogWithoutUrl = {
      _id: '6b422b3a1b54a676234d17f9',
      title: 'Pekka Puupään seikkailut',
      author: 'Pekka Puupää',
      __v: 0
    }

    const blogWithoutUrlOrTitle = {
      _id: '6b422b3a1b54a676234d17f9',
      author: 'Pekka Puupää',
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .set('Authorization', token)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .set('Authorization', token)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrlOrTitle)
      .set('Authorization', token)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('4.13 a blog can be removed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToRemove = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToRemove.title)
  })

  test('4.14 blog can be edited', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]
    const editedBlog = { ...blogToEdit, likes: 100 }

    await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(editedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(100)

  })
})

afterAll(() => {
  mongoose.connection.close()
})