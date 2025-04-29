import React from "react";

import "./Comment.css";

export const Comments = ({ commentsChangeModal, changeComments }) => {
  return (
    <div
      className={`comments ${
        commentsChangeModal ? "open" : ""
      } z-90 flex flex-col gap-2 p-4`}
    >
      <button onClick={changeComments} className="cross">
        <p className="text-[25px]">✕</p>
      </button>
      <div className="">
        <div className="comment ">
          <div className="title flex gap-4 items-center my-3">
            <img className="w-[30px]" src="/images/avatar-default.svg" alt="" />
            <b>htrgfthygfbtrbfg</b>
          </div>
          <p>hgfbrthfgbtrhfgbtrhgfbv</p>
          <div className="text">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
          </div>
        </div>
      </div>
    </div>
  );
};
