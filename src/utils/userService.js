// src/utils/userService.js
import fetchData from './fetchData';
import { API_BASE_URL } from './config';

export const createUser = async (name, email, password) => {
  const data = await fetchData(
    `${API_BASE_URL}/api/users`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }
  );

  return data;
};

export const loginUser = async (email, password) => {
  const data = await fetchData(
    `${API_BASE_URL}/api/users/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );

  return data;
};
