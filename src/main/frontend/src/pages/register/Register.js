import "./Register.css";

import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../../api/fbase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "@firebase/storage";

import { Link } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import Modal from "../../utill/Modal";
import Terms from "../register/Terms";
import UserApi from "../../api/UserApi";
import { storageService } from "../../api/fbase";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

const Box = styled.div`
  margin: 0 auto;
  padding: 0;
  font-family: "Gowun Dodum";
  background: linear-gradient(90deg, #ffe7e8, #8da4d0);
  overflow-x: hidden;
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
`;

const Content = styled.div`
  display: block;
  align-items: center;
  width: 40vw;
  justify-content: center;
  background-color: white;
  box-shadow: 0px 0px 24px #5c5696;
  @media screen and (max-width: 1024px) {
    width: 80vw;
  }
`;

const IdContainer = styled.div`
  position: relative;
  input {
    border: none;
    border-bottom: 1px solid black;
    outline: none;
    width: 100%;
    margin: 8px 0;
    padding: 10px 0;
  }
  input:hover,
  input:active {
    outline: none;
    border-bottom-width: 2px;
    border-bottom-color: #6a679e;
  }
  button {
    position: absolute;
    top: 15px;
    right: 5px;
    background: #fff;
    font-size: 0.8rem;
    border-radius: 1rem;
    border: 1px solid #d4d3e8;
    text-transform: uppercase;
    font-weight: 700;
    display: flex;
    align-items: center;
    color: #4c489d;
    box-shadow: 0px 2px 2px #5c5696;
    cursor: pointer;
    transition: 0.2s;
  }

  button:hover,
  button:focus,
  button:active {
    border-color: #6a679e;
    outline: none;
  }

  button:disabled {
    background: lightgray;
  }
`;

function Register() {
  const [userEmail, setUserEmail] = useState("");
  const [kakaoEmail, setKakaoEmail] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [displayName, setDisplayName] = useState(""); // firebase?????? ??????
  const [password, setPassword] = useState("");
  const [inputConPw, setInputConPw] = useState("");
  const [phone, setPhone] = useState("");
  const phoneRef = useRef();

  const [imgFile, setImgFile] = useState("");
  const imgRef = useRef();

  const [isConId, setIsConId] = useState(false);
  const [ConIdMessage, setConIdMessage] = useState("");

  //????????? ???????????? ??????
  const [isValidPw, setIsValidPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  //???????????? ???????????? ??????
  const [isConPw, setIsConPw] = useState(false);
  const [conPwMessage, setConPwMessage] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isDuplCheck, setIsDuplCheck] = useState(true);
  const [isDuplCheckYn, setIsDuplCheckYn] = useState(false);
  const [isPhoneDuplCheck, setIsPhoneDuplCheck] = useState(true);
  const [isPhoneDuplCheckYn, setIsPhoneDuplCheckYn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ????????? ??????
  useEffect(() => {
    const originEmail = sessionStorage.getItem("kakaoEmail");
    const originNickname = sessionStorage.getItem("kakaoNickName");
    if (originEmail || originNickname) {
      setKakaoEmail(originEmail);
      setUserEmail(originEmail);
      setUserNickname(originNickname);
      setDisplayName(originNickname); // ??????????????????
      setIsDuplCheckYn(true);
    }
  }, []);

  //????????? ????????? firebase ?????? ??? ?????? ????????????
  const saveImgFile = (e) => {
    const {
      target: { files },
    } = e;
    const theFile = files[0];

    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setImgFile(result);
    };
    reader.readAsDataURL(theFile);
  };

  // ???????????? ????????????
  const onChangeId = (e) => {
    const idCheck = e.target.value;
    setUserEmail(idCheck);

    const regExp =
      /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    if (regExp.test(idCheck) !== true) {
      setConIdMessage("??????????????? ????????? ???????????? ????????????.");
      setIsConId(false);
      setIsDuplCheck(true);
    } else {
      setConIdMessage("");
      setIsConId(true);
      setIsDuplCheck(false);
    }
  };

  const onChangeNickname = (e) => {
    setUserNickname(e.target.value);
    setDisplayName(e.target.value); // ??????????????????
  };

  const onChangePassword = (e) => {
    const pwdCheck = e.target.value;
    setPassword(pwdCheck);

    const regExp =
      /(?=.*\d{1,50})(?=.*[~`!@#$%\\^&*()-+=]{1,50})(?=.*[a-zA-Z]{1,50}).{8,50}$/;

    if (regExp.test(pwdCheck) !== true) {
      setPwMessage("8?????? ?????? ??????, ??????, ??????????????? ???????????? ????????? ?????????.");
      setIsValidPw(false);
    } else {
      setPwMessage("");
      setIsValidPw(true);
    }
  };

  const onChecked = ({ target }) => {
    setIsChecked(!isChecked);
  };

  // ????????? ?????? ???????????????
  const onChangePhone = (e) => {
    const value = phoneRef.current.value.replace(/\D+/g, "");
    const numberLength = 11;

    var result = "";

    for (let i = 0; i < value.length && i < numberLength; i++) {
      switch (i) {
        case 3:
          result += "-";
          break;

        case 7:
          result += "-";
          break;

        default:
          break;
      }
      result += value[i];
    }
    phoneRef.current.value = result;
    setPhone(e.target.value);
    if (phone.valueOf().length === 12) {
      setIsPhoneDuplCheck(false);
    } else {
      setIsPhoneDuplCheck(true);
    }
  };

  // ???????????? ????????????
  const onChangeConPw = (e) => {
    const passwordCurrent = e.target.value;
    setInputConPw(passwordCurrent);
    if (passwordCurrent !== password) {
      setConPwMessage("??????????????? ???????????? ????????????.");
      setIsConPw(false);
    } else {
      setConPwMessage("??????????????? ???????????????.");
      setIsConPw(true);
    }
  };

  // ????????? ????????????
  const onDuplCheck = async () => {
    if (userEmail === "") {
      window.alert("ID(EMAIL)??? ??????????????????.");
      return;
    }

    const duplCheck = await UserApi.duplCheck(userEmail);
    if (duplCheck.data === true) {
      window.confirm("?????? ????????? ID(EMAIL)?????????.");
      setIsDuplCheckYn(true);
    } else {
      window.confirm("????????? ID(EMAIL)?????????.");
      setIsDuplCheckYn(false);
    }
  };

  // ??????????????? ????????????
  const onPhoneDuplCheck = async () => {
    if (phone === "") {
      window.alert("??????????????? ??????????????????.");
      return;
    }

    const duplPhoneCheck = await UserApi.phoneDuplCheck(phone);

    if (duplPhoneCheck.data === true) {
      window.confirm("?????? ????????? ?????????????????????.");
      setIsPhoneDuplCheckYn(true);
    } else {
      window.confirm("????????? ?????????????????????.");
      setIsPhoneDuplCheckYn(false);
    }
  };

  // ?????? ??????
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // ????????????
  const onClickReg = async () => {
    if (true) {
      let profileImage = null;
      let profileImagePath = null;

      // ?????? ???????????? ????????? ??? ???????????????
      if (userEmail === "") {
        window.alert("ID(EMAIL)??? ??????????????????.");
        return;
      }

      if (isDuplCheckYn === false) {
        window.alert("ID(EMAIL)??? ?????? ????????? ??????????????????.");
        return;
      }

      if (userNickname === "") {
        window.alert("???????????? ??????????????????.");
        return;
      }

      if (password === "") {
        window.alert("??????????????? ??????????????????.");
        return;
      }

      if (isConPw === false) {
        window.alert("???????????? ??????????????? ??????????????????.");
        return;
      }

      if (phone === "") {
        window.alert("??????????????? ??????????????????.");
        return;
      }

      if (isPhoneDuplCheckYn === false) {
        window.alert("???????????? ?????? ????????? ??????????????????.");
        return;
      }

      if (isChecked === false) {
        window.alert("????????? ??????????????????.");
        return;
      }

      if (imgFile === "") {
        window.alert("????????? ???????????? ??????????????????.");
        return;
      }

      // ???????????? ???????????? ??????
      if (imgFile !== "") {
        //?????? ?????? ?????? ??????(FireBase??? ????????? ?????? ??????)
        profileImage = uuidv4();

        // ??????????????? ??????
        const attachmentRef = ref(storageService, `/USER/${profileImage}`);
        //storage ?????? ????????? ?????? ????????? ??????
        await uploadString(attachmentRef, imgFile, "data_url");
        //storage ?????? ????????? ???????????? ????????????
        profileImagePath = await getDownloadURL(attachmentRef);
      }

      // ????????????
      const userReg = await UserApi.userReg(
        userEmail,
        password,
        userNickname,
        phone,
        profileImage,
        profileImagePath
      );

      //???????????? ?????? ?????? ?????????
      if (userReg.data !== null) {
        sessionStorage.clear();
        // ----------------------firebase ?????? ????????? ???????????????!-----------------------------------
        const result = await createUserWithEmailAndPassword(
          auth,
          userEmail,
          userReg.data.password
        );

        // ??????????????????
        try {
          //Update profile
          await updateProfile(result.user, {
            displayName,
            photoURL: profileImagePath,
          });
          //create user on firestore
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            displayName,
            userEmail,
            photoURL: profileImagePath,
          });

          //create empty user chats on firestore
          await setDoc(doc(db, "userChats", result.user.uid), {});
          profileImagePath = profileImagePath;
        } catch (err) {
          console.log(err);
        }
        window.confirm("??????????????? ?????????????????????.");
        window.location.replace("/");
      } else {
        window.confirm("??????????????? ??????????????????.");
      }
    }
  };

  return (
    <Box>
      <Container>
        <Content>
          <Link to="/">
            <MdArrowBack size="24" style={{ margin: 10 }} />
          </Link>
          <h1 class="form-title">Register Here</h1>
          <div>
            <form className="register-form" method="POST">
              <img
                className="profile-img"
                src={
                  imgFile
                    ? imgFile
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt="????????? ?????????"
                style={{
                  width: "15vh",
                  height: "15vh",
                  borderRadius: "50%",
                }}
              />
              <label className="profileImg-label" htmlFor="profileImg">
                Add Image
              </label>
              <input
                type="file"
                accept="image/*"
                id="profileImg"
                onChange={saveImgFile}
                ref={imgRef}
              />
              {kakaoEmail !== "" ? (
                <IdContainer>
                  <input
                    type="text"
                    value={userEmail}
                    style={{ background: "#F2F3F4" }}
                    readOnly
                  />
                </IdContainer>
              ) : (
                <IdContainer>
                  <input
                    type="text"
                    placeholder="ID(EMAIL)"
                    value={userEmail}
                    onChange={onChangeId}
                  />
                  <button
                    type="button"
                    onClick={onDuplCheck}
                    disabled={isDuplCheck}
                  >
                    ????????????
                  </button>
                </IdContainer>
              )}
              <span
                className={`message ${isConId ? "success" : "error"}`}
                style={{ color: "#ff0000", fontSize: "0.8rem" }}
              >
                {ConIdMessage}
              </span>
              <input
                type="text"
                placeholder="NICKNAME"
                value={userNickname}
                onChange={onChangeNickname}
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={onChangePassword}
              />
              <span
                className={`message ${isValidPw ? "success" : "error"}`}
                style={{ color: "#ff0000", fontSize: "0.8rem" }}
              >
                {pwMessage}
              </span>
              <input
                type="password"
                placeholder="VERIFY PASSWORD"
                value={inputConPw}
                onChange={onChangeConPw}
              />
              <span
                className={`message ${isConPw ? "success" : "error"}`}
                style={{ color: "#ff0000", fontSize: "0.8rem" }}
              >
                {conPwMessage}
              </span>
              <IdContainer>
                <input
                  type="text"
                  placeholder="PHONE"
                  ref={phoneRef}
                  value={phone}
                  onChange={onChangePhone}
                />
                <button
                  type="button"
                  onClick={onPhoneDuplCheck}
                  disabled={isPhoneDuplCheck}
                >
                  ????????????
                </button>
              </IdContainer>
              <div className="terms_check">
                <input
                  type="checkbox"
                  id="check"
                  value={isChecked}
                  onChange={onChecked}
                />
                <label
                  style={{
                    textDecorationLine: "none",
                    color: "#7875b5",
                  }}
                  onClick={openModal}
                >
                  Agree to terms & conditions
                </label>
                <Modal
                  open={modalOpen}
                  close={closeModal}
                  header="DevS ???????????? ??????"
                  style={{ width: "300px" }}
                >
                  <Terms />
                </Modal>
              </div>
              <button
                type="button"
                className="register_btn"
                onClick={onClickReg}
              >
                <span>Submit</span>
              </button>
            </form>
          </div>
        </Content>
      </Container>
    </Box>
  );
}

export default Register;
