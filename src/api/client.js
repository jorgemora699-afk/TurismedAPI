  import axios from 'axios';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const API_URL = 'https://turismedback-production.up.railway.app';

 const API_URL = 'https://turismedback-production.up.railway.app';

  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor: agrega el token JWT automáticamente a cada request
  client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  export default client;