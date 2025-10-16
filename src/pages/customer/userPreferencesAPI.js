import axios from "axios";

export const getUserPreferences = async (userId) => {
  try {
    const response = await axios.get(`/preferences/${userId}`);
    console.log("getUserPreferences response:", response.data); // now logs actual data
    return response.data.categories || [];
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return [];
  }
};

export const saveUserPreferences = async (userId, categories) => {
  const api = import.meta.env.REACT_APP_USER_SERVICE_URL;

  await axios.post(`${api}/api/auth/preferences`, {
    userId,
    categories,
  });
};
