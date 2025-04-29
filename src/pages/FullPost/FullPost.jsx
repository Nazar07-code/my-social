import React, { useState, useEffect } from "react";
import { Link, useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Comments } from "../../components/Comments/Comment";
import {
  postLike,
  postSave,
  postLikeDelete,
  postSaveDelete,
} from "../../redux/slices/posts";
import instance from "../../axios";
import "./FullPost.css";

const PostDetails = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState({});
  const [isSaved, setIsSaved] = useState({});
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsChangeModal, setCommentsChangeModal] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.data?.user);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Ошибка при получении данных поста:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchLikesAndSaves = async () => {
      if (!user?.id) return;

      try {
        const [likesRes, savedRes] = await Promise.all([
          instance.get(`/like/user/${user.id}/`),
          instance.get(`/saved/user/${user.id}/`),
        ]);

        const likedPosts =
          likesRes.data[0]?.like_items.map((item) => item.post.id) || [];
        const savedPosts =
          savedRes.data[0]?.saved_items.map((item) => item.post.id) || [];

        setIsLiked(
          likedPosts.reduce((acc, postId) => {
            acc[postId] = true;
            return acc;
          }, {})
        );

        setIsSaved(
          savedPosts.reduce((acc, postId) => {
            acc[postId] = true;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("Error to getting favorites/saved posts", err);
      }
    };

    fetchLikesAndSaves();
  }, [user?.id]);

  const liked = (post) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const alreadyLiked = isLiked[post.id];

    setIsLiked((prev) => ({ ...prev, [post.id]: !alreadyLiked }));

    if (alreadyLiked) {
      dispatch(postLikeDelete(post.id));
    } else {
      dispatch(postLike(post.id));
    }
  };

  const saved = (post) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const alreadySaved = isSaved[post.id];

    setIsSaved((prev) => ({ ...prev, [post.id]: !alreadySaved }));

    if (alreadySaved) {
      dispatch(postSaveDelete(post.id));
    } else {
      dispatch(postSave(post.id));
    }
  };

  const changeComments = () => {
    setCommentsChangeModal((prev) => !prev);
  };

  if (loading || !post) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="full-post w-[600px] flex flex-col gap-5 overflow-hidden mx-auto mt-10">
      <div className="flex justify-center">
        {post.media.length > 1 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full max-h-[600px]"
          >
            {post.media.map((item) => (
              <SwiperSlide key={item.id}>
                {item.media_type === "image" ? (
                  <img
                    src={item.media}
                    alt="media"
                    className="w-full max-h-[600px] object-cover"
                  />
                ) : item.media_type === "video" ? (
                  <video
                    src={item.media}
                    controls
                    className="w-full max-h-[600px] object-cover"
                  />
                ) : null}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : post.media.length === 1 ? (
          post.media[0].media_type === "image" ? (
            <img
              src={post.media[0].media}
              alt="media"
              className="w-full max-h-[600px] object-cover"
            />
          ) : (
            <video
              src={post.media[0].media}
              controls
              className="w-full max-h-[600px] object-cover"
            />
          )
        ) : null}
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="user flex gap-4 items-center">
          <img
            className="rounded-full w-10 h-10"
            src={post.avatar || "/images/avatar-default.svg"}
            alt="avatar"
          />
          <h1 className="cursor-pointer text-[20px] font-semibold">
            {post.user.username}
          </h1>
        </div>
        <div className="tags flex flex-wrap gap-2">
          {post.tags
            ?.split(",")
            .map((tag, idx) => tag.trim())
            .filter((tag) => tag)
            .map((tag, idx) => (
              <span key={idx} className="cursor-pointer text-blue-700">
                #{tag}
              </span>
            ))}
        </div>
        <p className="description">{post.description}</p>
        <div className="btns flex items-center justify-end gap-5">
          <button onClick={() => liked(post)} className="like-btn">
            <img
              src={
                isLiked[post.id]
                  ? "/images/heart-active.svg"
                  : "/images/heart.svg"
              }
              alt="Like"
            />
          </button>
          <button onClick={() => saved(post)} className="save-btn">
            <img
              src={
                isSaved[post.id]
                  ? "/images/saved-active.svg"
                  : "/images/saved.svg"
              }
              alt="Save"
            />
          </button>
          <button onClick={changeComments} className="comment-btn">
            <img src="/images/comment.svg" alt="Comment" />
          </button>
        </div>
      </div>
      <Comments
        changeComments={changeComments}
        commentsChangeModal={commentsChangeModal}
      />
    </div>
  );
};

export default PostDetails;
