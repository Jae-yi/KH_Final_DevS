import React, { useEffect, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "@firebase/storage";
import { useNavigate, useParams } from "react-router-dom";
import SocialApi from "../../api/SocialApi";
import { storageService } from "../../api/fbase";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

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
  .editBt {
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

const SocialUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const params = useParams().socialId;
  let imageId = sessionStorage.getItem("social_imageId");
  // 기존 데이터 가져옴
  const [socialDetail, setSocialDetail] = useState("");
  // 기존 데이터를 넣어줄 곳
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [attachment, setAttachment] = useState(""); // 이미지를 string 으로 변환한 값
  // firebase 참조 주소(파일주소) : const로 바꿈
  //const [attachmentRef, setAttachmentRef] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [status, setStatus] = useState(true);
  const [tagStatus, setTagStatus] = useState(false);
  const [hashtag, setHashtag] = useState("");
  const [hashtags, setHashtags] = useState([]);

  const onChangeTitle = (title) => setTitleInput(title.target.value);
  const onChangeContent = (content) => setContentInput(content.target.value);

  // # 해시태그
  const onChangeHashtag = (e) => {
    const {
      target: { value },
    } = e;
    setHashtag(value);
  };
  const addHashtag = (e) => {
    if (e.key === "Enter") {
      if (hashtag === "" || hashtag.length > 10 || hashtags.length > 4) {
        alert("⚡ 해시태그는 1~10자의 단어로 최대 5개까지 입력 가능합니다 ⚡");
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

  // 문자로 된 파일을 이미지로 보여줌 - 미리보기 코드
  const onChangeImage = (e) => {
    const {
      target: { files },
    } = e;
    const theFile = files[0];
    // console.log("★ 이미지 파일", theFile);

    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result); // 바뀐 파일의 string값 저장
      // console.log(attachment);
    };
    reader.readAsDataURL(theFile);
    setInputVal(e.target.value);
    // console.log(inputVal);
  };
  const onClickEdit = async () => {
    // console.log("수정 버튼 클릭");
    if (titleInput === "" || contentInput === "") {
      alert("⚡ 제목과 내용은 필수 입력사항입니다. 꼭 작성해주세요 ⚡");
    } else {
      // ※ 1. 기존 이미지가 있을 때
      if (imageId !== "null") {
        // ※※ 1-1. 다른 이미지가 생겼을 때
        if (inputVal !== "") {
          // console.log(attachment);
          // console.log("1-1. 다른 이미지가 생겼을 때");
          // =============== 기존 이미지 삭제 =================
          // 파이어베이스 상 파일주소 지정
          const deleteAttachmentRef = ref(storageService, `/SOCIAL/${imageId}`);
          // 참조경로로 firebase 이미지 삭제
          await deleteObject(deleteAttachmentRef)
            // then이하 코드는 안타고, catch이하부터 탑니다 - J2
            .then(() => {
              // console.log("Firebase File deleted successfully !");
              setStatus(true);
            })
            .catch((error) => {
              // console.log("Uh-oh, File Delete error occurred!");
            });
          if (status === true) {
            // =============== 신규 이미지 저장 =================
            var attachmentUrl = null; // 이미지 URL
            var imageName = uuidv4(); // 이미지 UUID

            // 참조경로로 storage에 저장
            // 기존 setAttachmentRef 를 const로 변환 - J2
            const uploadAttachmentRef = ref(
              storageService,
              `/SOCIAL/${imageName}`
            );
            const response = await uploadString(
              uploadAttachmentRef,
              attachment,
              "data_url"
            );
            attachmentUrl = await getDownloadURL(response.ref);
            // api 전송
            const res = await SocialApi.socialUpdate(
              params,
              titleInput,
              contentInput,
              hashtags.join(","),
              attachmentUrl,
              imageName
            );

            if (res.data === true) {
              window.sessionStorage.setItem("social_imageId", imageName);
              window.sessionStorage.setItem("social_imageUrl", attachmentUrl);
              navigate(`/social/${params}`); //수정된 게시글로 이동
              alert("Social 게시글 수정 완료 !");
            } else {
              alert("Social 게시글 수정 실패 ");
              // console.log(res.data);
            }
          }
        } else if (attachment !== null) {
          // ※※ 1-2. 기존 이미지 그대로 유지할 때
          // console.log("1-2. 기존 이미지 그대로 유지할 때");
          const res = await SocialApi.socialUpdate(
            params,
            titleInput,
            contentInput,
            hashtags.join(","),
            attachment,
            imageId
          );
          if (res.data === true) {
            navigate(`/social/${params}`); // 수정된 게시글로 이동
            alert("Social 게시글 수정 완료 !");
          } else {
            alert("Social 게시글 수정 실패 ");
            // console.log(res.data);
          }
        }
      } else {
        // ※ 2. 기존 이미지가 없을 때
        // ※※ 2-1. 새로 이미지가 생겼을 때
        if (inputVal !== "") {
          // console.log("2-1. 새로 이미지가 생겼을 때");
          // 파일 참조 경로 지정
          attachmentUrl = null;
          imageName = uuidv4(); // 이미지 UUID
          const attachmentRef = ref(storageService, `/SOCIAL/${imageName}`);
          // 참조경로로 storage에 저장
          const response = await uploadString(
            attachmentRef,
            attachment,
            "data_url"
          );
          attachmentUrl = await getDownloadURL(response.ref);
          // api 전송
          const res = await SocialApi.socialUpdate(
            params,
            titleInput,
            contentInput,
            hashtags.join(","),
            attachmentUrl,
            imageName
          );

          if (res.data === true) {
            window.sessionStorage.setItem("social_imageId", imageName);
            window.sessionStorage.setItem("social_imageUrl", attachmentUrl);
            navigate(`/social/${params}`); //수정된 게시글로 이동
            alert("Social 게시글 수정 완료 !");
          } else {
            alert("Social 게시글 수정 실패 ");
            // console.log(res.data);
          }
        } else if (inputVal === "") {
          // ※ 2-2. 계속 이미지가 없을 때
          // console.log("2-2. 계속 이미지가 없을 때");
          // api 전송
          attachmentUrl = null;
          const res = await SocialApi.socialUpdate(
            params,
            titleInput,
            contentInput,
            hashtags.join(","),
            attachmentUrl
          );
          if (res.data === true) {
            navigate(`/social/${params}`); //수정된 게시글로 이동
            alert("Social 게시글 수정 완료 !");
          } else {
            alert("Social 게시글 수정 실패 ");
            // console.log(res.data);
          }
        }
      }
    }
  };

  useEffect(() => {
    const socialData = async () => {
      setLoading(true);
      try {
        // console.log("게시글ID : " + params);
        const response = await SocialApi.socialDetail(params);
        // 기존 데이터를 useState 값에 다 따로 받아주기 !
        setTitleInput(response.data.title);
        setContentInput(response.data.content);
        setHashtags(response.data.hashtag);
        setAttachment(response.data.image);
        // console.log(response.data);
      } catch (e) {
        // console.log(e);
      }
      setLoading(false);
    };
    socialData();
  }, []);
  if (loading) {
    return <WriteBox>조금만 기다려주세요...👩‍💻</WriteBox>;
  }
  return (
    <WriteBox>
      <div className="subtitle">Write anything you want 👩🏻‍💻✨</div>
      <div className="parentBox">
        <label>제목</label>
        <textarea
          className="title"
          value={titleInput}
          onChange={onChangeTitle}
        ></textarea>
        <hr />
        <label>내용</label>
        <textarea
          className="content"
          value={contentInput}
          onChange={onChangeContent}
        />
        <hr />
        {/* 해시태그 */}
        <label className="tag-label">#Hashtag</label>
        <textarea
          className="hashtag-textarea"
          value={hashtag}
          onKeyPress={addHashtag}
          onChange={onChangeHashtag}
          placeholder="태그하고 싶은 단어를 입력하세요."
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

        <label htmlFor="formFile" className="form-label">
          이미지 첨부
        </label>
        <div className="image-box">
          <input
            className="form-control"
            value={inputVal}
            type="file"
            id="formFile"
            accept="image/*"
            onChange={onChangeImage}
          />
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
        <button className="editBt" onClick={onClickEdit}>
          수 정
        </button>
      </div>
    </WriteBox>
  );
};

export default SocialUpdate;
