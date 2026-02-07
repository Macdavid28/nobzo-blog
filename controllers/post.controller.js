import { Post } from "../models/post.model.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const postStatus = status || "draft";

    if (!["draft", "published"].includes(postStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be draft or published",
      });
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const existingSlug = await Post.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    }

    const newPost = await Post.create({
      title,
      slug,
      content,
      author: req.userId,
      tags: Array.isArray(tags) ? tags : [],
      status: postStatus,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const tag = req.query.tag || "";
    const authorId = req.query.author || "";
    const status = req.query.status;

    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    const query = { deletedAt: null };
    let populateFields = "name";

    if (!req.userId) {
      query.status = "published";
    } else {
      populateFields = "name email";

      if (status === "draft") {
        query.status = "draft";
        query.author = req.userId;
      } else if (status === "published") {
        query.status = "published";
      } else {
        query.$or = [
          { status: "published" },
          { status: "draft", author: req.userId },
        ];
      }
    }

    if (search) {
      query.$or = query.$or || [];
      query.$or.push(
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      );
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (authorId) {
      if (!req.userId || authorId === req.userId) {
        query.author = authorId;
      } else {
        query.author = authorId;
        query.status = "published";
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", populateFields);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = { slug, deletedAt: null };

    if (!req.userId) {
      query.status = "published";
    } else {
      query.$or = [
        { status: "published" },
        { status: "draft", author: req.userId },
      ];
    }

    const post = await Post.findOne(query).populate("author", "name email");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, status } = req.body;

    const post = await Post.findOne({ _id: id, deletedAt: null });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this post",
      });
    }

    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (title) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      const existingSlug = await Post.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists",
        });
      }

      post.title = title;
      post.slug = slug;
    }

    if (content) post.content = content;
    if (Array.isArray(tags)) post.tags = tags;
    if (status) post.status = status;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, deletedAt: null });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this post" });
    }

    post.deletedAt = new Date();
    await post.save();

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
