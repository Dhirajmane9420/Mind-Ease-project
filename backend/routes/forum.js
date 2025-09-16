// routes/forum.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const Comment = require('../models/Comment');

// GET all forum posts
router.get('/', async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new forum post
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const newPost = new ForumPost({
      title: req.body.title,
      content: req.body.content,
      name: user.name,
      user: req.user.id,
    });
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new comment to a post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = new Comment({
      content: req.body.content,
      name: user.name,
      user: req.user.id,
      post: req.params.postId,
    });
    
    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- THIS IS THE NEW, MISSING ROUTE ---
// @route   GET api/forum/:postId/comments
// @desc    Get all comments for a post
// @access  Public
router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;