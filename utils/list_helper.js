/* eslint-disable no-unused-vars */
const blog = require('../models/blog')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 1) {
    return blogs[0].likes
  }

  let sumOfLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)

  return sumOfLikes
}

const favoriteBlog = (blogs) => {
  let mostLikes = Math.max(...blogs.map(blog => blog.likes))
  let favorite = blogs.find(({ likes }) => likes === mostLikes)

  return {
    'title': favorite.title,
    'author': favorite.author,
    'likes': favorite.likes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}