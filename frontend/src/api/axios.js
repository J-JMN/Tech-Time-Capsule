import axios from 'axios';

// If the REACT_APP_API_BASE_URL is set (in production), it will use that.
// Otherwise, it will default to '' (a relative path), which works with the local proxy.
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || ''
});

export default apiClient;