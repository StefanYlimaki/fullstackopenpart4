
const lodash = require('lodash')

const dummy = (blogs) => {
  if(blogs)
    return 1
  return 1
}

const totalLikes = (blogs) => {
  const result = blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)

  return result
}

const favoriteBlog = (blogs) => {
  let result = blogs[0]
  blogs.map(blog => blog.likes > result.likes ? result = blog : result)
  return result._id
}

const mostBlogs = (blogs) => {
  const authorsGroupedByBlogs = lodash(blogs).groupBy('author').map(a => ({ author: a[0].author, blogs: a.length })).sortBy('blogs').value()
  return blogs.length === 0
    ? null
    : lodash.last(authorsGroupedByBlogs)
}

const mostLikes = (blogs) => {
  const authorsGroupedByLikes = lodash(blogs).groupBy('author').map(a => ({ author: a[0].author, likes: a.reduce((sum, a) => {return sum + a.likes}, 0) })).sortBy('likes').value()
  return blogs.length === 0
    ? null
    : lodash.last(authorsGroupedByLikes)
}


module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }