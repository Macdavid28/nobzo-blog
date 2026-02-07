import { Post } from "../models/post.model.js";

export const createPost = async(req,res) =>{
    try {
        const {title,content,author,tags} = req.body;       

        if(!title || !content || !tags){
            return res.status(400).json({success:false,message:"fill all required fields"})
        }

        const slug = title
          .split(" ")
          .join("-")
          .replace(/[^\w-]+/g, "");

        const existingSlug = await Post.findOne({slug})
        if(existingSlug){
            return res.status(400).json({success:false,message:"Slug already exists"})
        }
        
        const newPost = await Post.create({
            title,
            slug,
            content,
            author:req.userId,
            tags
        })
        const post = await Post.findById(newPost._id).select("-user")
        await post.save()
        res.status(201).json({success:true,message:"post created successfully",post})
    } catch (error) {
        res.status(500).json({success:false,message:error.message || "Internal server error"})
    }
}



export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const tag = req.query.tag || "";
        const authorId = req.query.author || "";
        const status = req.query.status || "published";

        // Optional Auth Logic
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            try {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                req.userId = decode.userId;
            } catch (error) {
                console.log("Token verification failed:", error.message);
                // Invalid token, treat as public
            }
        }

        console.log("User ID:", req.userId);
        console.log("Status Query:", status);

        const query = { deletedAt: null };

        let selectFields = "";
        let populateFields = "name email";

        if (!req.userId) {
             // Public user
             query.status = "published";
             // Hide status
             selectFields = "-status"; 

             // Hide email
             populateFields = "name";
        } else {
             // Auth user
             if (status === 'draft') {
                 // Custom to them: can only see their own drafts
                 query.status = 'draft';
                 query.author = req.userId;
             } else {
                 query.status = status;
             }
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ];
        }

        if (tag) {
            query.tags = { $in: [tag] };
        }

        if (authorId) {
            query.author = authorId;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .select(selectFields)
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
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({ slug, status: "published", deletedAt: null }).populate(
            "author",
            "name email"
        );

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, status } = req.body;

        const post = await Post.findOne({ _id: id, deletedAt: null });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.author.toString() !== req.userId) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized to update this post" });
        }

        if (title) {
             const slug = title
            .toLowerCase()
            .split(" ")
            .join("-")
            .replace(/[^\w-]+/g, "");
            
            const existingSlug = await Post.findOne({slug, _id: {$ne: id}})
            if(existingSlug){
                return res.status(400).json({success:false,message:"Slug already exists"})
            }
            post.title = title;
            post.slug = slug;
        }

        if (content) {post.content = content};
        if (tags) {post.tags = tags};
        if (status) {post.status = status};
        
        await post.save();

        res.status(200).json({ success: true, message: "Post updated successfully", data: post });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({ _id: id, deletedAt: null });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.author.toString() !== req.userId) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized to delete this post" });
        }

        post.deletedAt = new Date();
        await post.save();

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

