const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('api tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are correct amount of blogs', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('the id-field is not _id', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].id).toBeDefined()
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      _id: '6a422b3a1b54a676234d17f9',
      title: 'Pekka Puupään seikkailut',
      author: 'Pekka Puupää',
      url: 'http://pekkapuupaa.com',
      likes: 2,
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('Pekka Puupään seikkailut')
  })

  test('a blog without likes can be added', async () => {
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

  test('blog POST without url and title return 400 Bad Request', async () => {
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

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

  })

  test('the first blog is about React patterns', async () => {
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].title).toEqual('React patterns')
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      _id: '6a422b3a1b54a676234d17f9',
      author: 'Pekka Puupää',
      url: 'http://pekkapuupaa.com',
      likes: 2,
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })


  afterAll(() => {
    mongoose.connection.close()
  })
})