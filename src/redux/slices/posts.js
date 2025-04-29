import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../axios";

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData) => {
    const { data } = await instance.post("/posts/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }
);

export const postLike = createAsyncThunk("posts/postLike", async (postId) => {
  const { data } = await instance.post("/likes/", { post: postId });
  return data;
});

export const postLikeDelete = createAsyncThunk(
  "posts/postLikeDelete",
  async (postId) => {
    await instance.delete(`/likes/${postId}`);
    return postId;
  }
);

export const postSave = createAsyncThunk("posts/postSave", async (postId) => {
  const { data } = await instance.post("/save-post/", { post: postId });
  return data;
});

export const postSaveDelete = createAsyncThunk(
  "posts/postSaveDelete",
  async (postId) => {
    await instance.delete(`/save-post/${postId}`);
    return postId;
  }
);

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const { data } = await instance.get("/posts/");
  return data;
});

// export const fetchComments = createAsyncThunk(
//   "comments/fetchComments",
//   async () => {
//     const { data } = await instance.get(`/comments-post/${postId}`);
//     return data;
//   }
// );

// export const createComment = createAsyncThunk(
//   "comments/createComment",
//   async ({ postId, content, parent = null }) => {
//     const { data } = await instance.post("/comments/", {
//       content,
//       post: postId,
//       parent,
//     });
//     return data;
//   }
// );

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "loading",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "loaded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.status = "error";
        state.items = [];
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // .addCase(fetchComments.pending, (state) => {
      //   state.status = "loading";
      // })
      // .addCase(fetchComments.fulfilled, (state, action) => {
      //   state.status = "loaded";
      //   state.items = action.payload;
      // })
      // .addCase(fetchComments.rejected, (state) => {
      //   state.status = "error";
      //   state.items = [];
      // })
      // .addCase(createComment.fulfilled, (state, action) => {
      //   state.items.push(action.payload);
      // });
  },
});

export const postsReducer = postsSlice.reducer;
