const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/post");
const path = require("path");
const checkAuth = require("../middleware/check-auth");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) error = null;
    cb(error, path.join(__dirname, "..", "images"));
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("_")
      .split(path.extname(file.originalname))
      .join("");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

// CREATE Post
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: req.file ? url + "/images/" + req.file.filename : "",
      creator: req.userData.userId,
    });

    post
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Post added successfully",
          post: { ...result._doc, id: result._id },
        });
      })
      .catch(() => {
        res.status(500).json({ message: "Creating post failed!" });
      });
  }
);

// UPDATE Post (only by creator)
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    const post = {
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
    };

    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
      .then((result) => {
        if (result.matchedCount > 0) {
          res.status(200).json({ message: "Update successful!" });
        } else {
          res.status(401).json({ message: "Not authorized!" });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Could not update post!" });
      });
  }
);

// GET All Posts
router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentpage;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch(() => {
      res.status(500).json({ message: "Fetching posts failed!" });
    });
});

// GET Single Post
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error fetching post!" });
    });
});

// DELETE Post (only by creator)
router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Post deleted!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Deleting post failed!" });
    });
});

module.exports = router;
