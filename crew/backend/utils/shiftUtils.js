/**
 * Get IST (Indian Standard Time) Date
 * @returns {Date} - Current date and time in IST
 */
const getISTDate = () => {
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return new Date(istTime);
  };
  
  /**
   * Check if the crew's shift is currently active or will start in the next 15 minutes
   * @param {string} shift - The shift of the crew (morning, afternoon, evening)
   * @returns {boolean} - True if the shift is currently active or will start in the next 15 minutes
   */
  const isShiftActiveOrStartingSoon = (shift) => {
    const now = getISTDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    let shiftStartTime, shiftEndTime;
  
    if (shift === "morning") {
      shiftStartTime = new Date(today.setHours(6, 0, 0, 0)); // 6:00 AM
      shiftEndTime = new Date(today.setHours(12, 0, 0, 0));  // 12:00 PM
    } else if (shift === "afternoon") {
      shiftStartTime = new Date(today.setHours(12, 0, 0, 0)); // 12:00 PM
      shiftEndTime = new Date(today.setHours(18, 0, 0, 0));   // 6:00 PM
    } else if (shift === "evening") {
      shiftStartTime = new Date(today.setHours(18, 0, 0, 0)); // 6:00 PM
      shiftEndTime = new Date(today.setHours(23, 59, 59, 999)); // 11:59:59 PM
    }
  
    const timeDifference = (shiftStartTime - now) / (1000 * 60); // Time difference in minutes
    const isStartingSoon = timeDifference > 0 && timeDifference <= 15;
  
    return (now >= shiftStartTime && now < shiftEndTime) || isStartingSoon;
  };
  
  module.exports = {
    isShiftActiveOrStartingSoon,
    getISTDate
  };
  