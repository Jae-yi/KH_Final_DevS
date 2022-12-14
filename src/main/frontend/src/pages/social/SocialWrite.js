import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SocialApi from "../../api/SocialApi";
import { storageService } from "../../api/fbase";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadString } from "@firebase/storage";

const WriteBox = styled.div`
  overflow-x: hidden;
  & > * {
    margin: 0;
    padding: 0;
    font-size: 20px;
  }
  .subtitle {
    font-family: "Alfa Slab One", cursive;
    text-align: center;
    font-size: 25px;
    padding: 10px;
    margin: 20px;
  }
  .parentBox {
    font-family: "Gowun Dodum", sans-serif;
    max-width: 1024px;
    min-width: 350px;
    margin: 0px auto;
    padding: 5px;
    /* border: 1px solid black; */
    background-color: rgba(211, 188, 230, 0.25);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
  }
  label {
    margin: 10px 20px;
  }
  textarea {
    padding: 10px;
    margin: 0px 20px;
    resize: none;
    box-sizing: border-box;
    box-shadow: 5px 5px 10px rgba(0, 0, 255, 0.2);
    border: none;
    border-radius: 10px;
    color: rgb(98, 98, 112);
    background-color: rgba(245, 245, 245, 255);
    &::placeholder {
      color: rgb(98, 98, 112);
    }
  }
  .title {
    height: 50px;
  }
  .content {
    height: 600px;
  }
  hr {
    width: 98%;
    height: 1px;
    border: 0;
    background-color: rgba(209, 209, 209, 0.8);
  }
  .submitBt {
    width: 96%;
    height: 40px;
    margin: 20px auto;
    border: none;
    border-radius: 10px;
    box-shadow: 5px 5px 10px rgba(0, 0, 255, 0.2);
    transition-duration: 0.3s;
    &:hover {
      color: white;
      background-color: rgba(190, 100, 255, 0.5);
      box-shadow: 5px 5px 10px rgba(190, 100, 255, 0.2);
      left: 5px;
      margin-top: 5px;
      box-shadow: none;
    }
  }
  .image-box {
    display: flex;
    margin: 0 20px;
  }
  .form-control {
    height: 100%;
    border-radius: 10px;
    font-size: 20px;
    box-shadow: 5px 5px 10px rgba(0, 0, 255, 0.2);
    color: rgb(98, 98, 112);
    margin-right: 10px;
  }
  .hashtag-textarea {
    /* width: 500px; */
  }
  .hashtags-box {
    display: flex;
    flex-wrap: wrap;
    margin: 15px;
  }
  .hashtags {
    margin: 5px 5px;
    padding: 8px;
    font-style: italic;
    background-color: rgba(219, 219, 219);
    background-color: rgba(219, 219, 219, 0.5);
    background-color: rgba(3, 0, 209, 0.2);
    border-radius: 10px;
    box-shadow: 0 1px 3px grey;
  }
`;

const SocialWrite = () => {
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem("userEmail");
  const [hashtag, setHashtag] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [attachment, setAttachment] = useState("");
  const [tagStatus, setTagStatus] = useState(false);
  const onChangeTitle = (title) => setTitleInput(title.target.value);
  const onChangeContent = (content) => setContentInput(content.target.value);

  // ????????? ??? ????????? ???????????? ????????? - ???????????? ??????
  const onFileChange = (e) => {
    const {
      target: { files },
    } = e;
    const theFile = files[0];
    // console.log(theFile);

    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };
  // # ????????????
  const onChangeHashtag = (e) => {
    const {
      target: { value },
    } = e;
    setHashtag(value);
  };
  const addHashtag = (e) => {
    if (e.key === "Enter") {
      if (hashtag === "" || hashtag.length > 10 || hashtags.length > 4) {
        alert("??? ??????????????? 1~10?????? ????????? ?????? 5????????? ?????? ??????????????? ???");
      } else {
        setHashtags([...hashtags, hashtag]);
        setTagStatus(true);
      }
    }
  };
  const onDeleteHash = (index) => {
    hashtags.splice(index, 1);
    setTagStatus(true);
  };
  useEffect(() => {
    setTagStatus(false);
    setHashtag("");
  }, [tagStatus, hashtags]);

  const onClickSubmit = async () => {
    if (titleInput === "" || contentInput === "") {
      alert("??? ????????? ????????? ?????? ?????????????????????. ??? ?????????????????? ???");
    } else {
      let attachmentUrl = null;
      let imageName = null;

      if (attachment !== "") {
        // ?????? ?????? ?????? ??????
        imageName = uuidv4(); // ????????? UUID
        const attachmentRef = ref(storageService, `/SOCIAL/${imageName}`);
        // ??????????????? storage??? ??????
        const response = await uploadString(
          attachmentRef,
          attachment,
          "data_url"
        );
        attachmentUrl = await getDownloadURL(response.ref);
        // console.log("??? ????????? ?????? : " + attachmentUrl);
        // console.log("??? ????????? UUID : " + imageName);
      }
      const res = await SocialApi.socialWrite(
        userEmail,
        titleInput,
        contentInput,
        hashtags.join(","),
        attachmentUrl,
        imageName
      );
      // console.log("?????? ?????? ??????");
      if (res.data.result === "SUCCESS") {
        window.alert("Social ????????? ?????? ?????? !");
        navigate(`/social`);
      } else {
        window.alert("Social ????????? ?????? ?????? ???");
        // console.log(res.data);
      }
    }
  };

  return (
    <WriteBox>
      <div className="subtitle">Write anything you want ??????????????????</div>
      <div className="parentBox">
        <label>??????</label>
        <textarea
          className="title"
          placeholder="???????????? ????????? ??????????????????."
          value={titleInput}
          onChange={onChangeTitle}
        ></textarea>
        <hr />
        <label>??????</label>
        <textarea
          className="content"
          placeholder="??????, ????????? ???????????? ?????????????????? (????????????)???*:?????????^"
          value={contentInput}
          onChange={onChangeContent}
        />
        {/* ???????????? */}
        <label className="tag-label">#Hashtag</label>
        <textarea
          className="hashtag-textarea"
          value={hashtag}
          onKeyPress={addHashtag}
          onChange={onChangeHashtag}
          placeholder="???????????? ?????? ????????? ???????????????."
        />
        <div className="hashtags-box">
          {hashtags.map((e, index) => (
            <span
              className="hashtags"
              onClick={() => onDeleteHash(index)}
              key={index}
            >
              #{e}
            </span>
          ))}
        </div>

        <hr />
        <label htmlFor="formFile" className="form-label">
          ????????? ??????
        </label>
        <div className="image-box">
          <input
            className="form-control"
            type="file"
            id="formFile"
            accept="image/*"
            onChange={onFileChange}
          />
          {/* ????????? ???????????? */}
          {attachment && (
            <img
              src={attachment}
              className="preview"
              width="50px"
              height="50px"
              alt=""
            />
          )}
        </div>
        <button className="submitBt" onClick={onClickSubmit}>
          ??? ???
        </button>
      </div>
    </WriteBox>
  );
};

export default SocialWrite;
