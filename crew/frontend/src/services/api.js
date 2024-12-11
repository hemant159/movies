import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/crew';

export const getCrewList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crew list:', error);
    throw error;
  }
};

export const changeCrewShift = async (crewId, newShift) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/swap_shift`, {
      crewId, 
      newShift
    });
    return response.data;
  } catch (error) {
    console.error('Error changing crew shift:', error);
    throw error;
  }
};

export const swapCrewBus = async (fromCrewId, toCrewId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transfer_bus`, {
      fromCrewId, 
      toCrewId
    });
    return response.data;
  } catch (error) {
    console.error('Error swapping crew buses:', error);
    throw error;
  }
};
