const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  author: String,
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = String(returnedObject._id)
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog