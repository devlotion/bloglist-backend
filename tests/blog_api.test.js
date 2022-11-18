const mongoose = require('mongoose')
const supertest = require('supertest')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => {blog.save()})
  await Promise.all(promiseArray)
})

describe('Return GET requests', () => {
  let headers

  beforeEach(async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'admin',
    }

    await api
      .post('/api/users')
      .send(newUser)

    const result = await api
      .post('/api/login')
      .send(newUser)

    headers = {
      'Authorization': `bearer ${result.body.token}`
    }
  })
  test('Return all blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .set(headers)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('Return POST requests', () => {
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      name: 'Admin',
      password: 'admin',
    }

    await api
      .post('/api/users')
      .send(user)

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })

  test('Create new blog post', async () => {
    const newBlog = {
      title: 'Test blog title',
      author: 'Test Author',
      url: 'localhost',
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('Check if likes property is missing', async () => {
    const newBlog = {
      title: 'Test blog title2',
      author: 'Test Author2',
      url: 'http://testblog.com/test2.html',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .set(headers)
      .expect('Content-Type', /application\/json/)
  })

  test('Check if new blog is missing title or url properties', async () => {
    const newBlog = {
      author: 'Test author',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .set(headers)
  })
})

describe('Check ID property', () => {
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      name: 'Admin',
      password: 'admin',
    }

    await api
      .post('/api/users')
      .send(user)

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })

  test('is ID property defined properly', async () => {
    const response = await api
      .get('/api/blogs')
      .set(headers)

    expect(response.body[0].id).toBeDefined()
  })
})

describe('deletion of blog', () => {
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      name: 'Admin',
      password: 'admin',
    }

    await api
      .post('/api/users')
      .send(user)

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })

  test('deletion of note should return 204 if valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set(headers)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(t => t.titles)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('PUT requests', () => {
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      name: 'Admin',
      password: 'admin',
    }

    await api
      .post('/api/users')
      .send(user)

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })

  test('updated likes of a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    blogToUpdate.likes = 100

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .set(headers)
      .expect(200)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
