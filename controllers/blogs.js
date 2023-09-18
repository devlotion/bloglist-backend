const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });

  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  const token = request.token;
  const user = request.user;

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!(token && decodedToken.id)) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blog = await new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user,
    likes: body.likes,
  });

  if (!blog.title || !blog.url) {
    response.status(400).end();
  }

  if (!blog.user) {
    blog.user = user;
  }

  if (!blog.likes) {
    blog.likes = 0;
  }

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!(token && decodedToken.id)) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const user = request.user;
  const blog = await Blog.findById(request.params.id);

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } else {
    return response.status(401).json({ error: "unauthorized operation" });
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.json(updatedBlog.toJSON());
});

module.exports = blogsRouter;
