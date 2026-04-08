import axios from 'axios';

const api = axios.create({
  // JSON 서버 혹은 백엔드 API 주소를 입력하세요
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
