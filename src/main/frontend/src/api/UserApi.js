import axios from "axios";

// const HEADER = { "Content-type": "application/json; charset=UTF-8" };

const UserApi = {
  // ID(Email) 중복체크
  duplCheck: async function (id) {
    const idCheck = {
      userEmail: id,
    };
    return await axios.post("/api/duplCheck", idCheck);
  },

  // 전화번호 중복체크
  phoneDuplCheck: async function (phone) {
    const phoneCheck = {
      phone: phone,
    };
    return await axios.post("/api/phoneDuplCheck", phoneCheck);
  },

  //회원가입
  userReg: async function (
    id,
    pwd,
    nickname,
    phone,
    profileImage,
    profileImagePath
  ) {
    const userObj = {
      userEmail: id,
      password: pwd,
      userNickname: nickname,
      phone: phone,
      profileImage: profileImage,
      profileImagePath: profileImagePath,
    };
    return await axios.post("/api/register", userObj);
  },

  // 일반 로그인
  userLogin: async function (id, pwd) {
    const loginObj = {
      userEmail: id,
      password: pwd,
    };
    return await axios.post("/api/login", loginObj);
  },

  // 카카오 로그인
  kakaoLogin: async function (email, nickname) {
    const loginObj = {
      userEmail: email,
      userNickname: nickname,
    };
    return await axios.post("/api/kakaoLogin", loginObj);
  },

  //회원정보 수정
  userUpdate: async function (
    id,
    pwd,
    nickname,
    phone,
    profileImage,
    profileImagePath
  ) {
    const UpdateObj = {
      userEmail: id,
      password: pwd,
      userNickname: nickname,
      phone: phone,
      profileImage: profileImage,
      profileImagePath: profileImagePath,
    };
    return await axios.put("/api/update", UpdateObj);
  },

  // 회원정보 찾기(아이디찾기)
  findId: async function (phone) {
    const AccountInfo = {
      phone: phone,
    };
    return await axios.post("/api/findId", AccountInfo);
  },

  // 회원정보 찾기(비밀번호찾기)
  findPwd: async function (id, phone) {
    const AccountInfo = {
      userEmail: id,
      phone: phone,
    };
    return await axios.post("/api/findPwd", AccountInfo);
  },

  // 회원탈퇴
  delete: async function (userEmail) {
    return await axios.delete(`/api/delete/${userEmail}`);
  },
};

export default UserApi;
