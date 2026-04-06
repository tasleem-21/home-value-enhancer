import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

const handleApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;
  throw new Error(message);
};

export const loginUser = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to login user.');
  }
};

export const registerUser = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to register user.');
  }
};

export const getAllProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch properties.');
  }
};

export const addProperty = async (data) => {
  try {
    const response = await api.post('/properties', data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add property.');
  }
};

export const updateProperty = async (id, data) => {
  try {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update property.');
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete property.');
  }
};

export default api;
