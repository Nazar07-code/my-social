import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Home.css";
import instance from "../axios";
import {
  postSave,
  postLike,
  postLikeDelete,
  postSaveDelete,
} from "../redux/slices/posts";
import { Comments } from "../components/Comments/Comment";

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLiked, setIsLiked] = useState({});
  const [isSaved, setIsSaved] = useState({});
  const [commentsChangeModal, setCommentsChangeModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.data?.user);

  useEffect(() => {
    instance
      .get("/posts/")
      .then((res) => setPosts(res.data))
      .catch((err) => console.warn(err));
  }, []);

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

  return (
    <div className="main-posts flex flex-col justify-center items-center gap-[50px]">
      {posts.map((post) => (
        <div
          key={post.id}
          className="main-post w-[600px] flex flex-col gap-5 overflow-hidden"
        >
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
              <Link
                to={`/user/${post.user.id}`}
                className="cursor-pointer text-[20px] font-semibold"
              >
                <img
                  className="rounded-full w-10 h-10"
                  src={post.avatar || "/images/avatar-default.svg"}
                  alt="avatar"
                />
              </Link>
              <Link
                to={`/user/${post.user.id}`}
                className="cursor-pointer text-[20px] font-semibold"
              >
                {post.user.username}
              </Link>
            </div>

            <div className="tags flex flex-wrap gap-2">
              {post.tags
                ?.split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="cursor-pointer font-semibold text-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
            </div>

            <p className="text-[18px] font-medium">{post.title}</p>
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
        </div>
      ))}
      <Comments
        changeComments={changeComments}
        commentsChangeModal={commentsChangeModal}
      />
    </div>
  );
}

export default Home;
