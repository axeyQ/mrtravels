// src/lib/PricingCalculator.js

/**
 * Calculates the precise duration between two date objects
 * @param {Date} startTime - The start time
 * @param {Date} endTime - The end time
 * @returns {Object} Object containing hours, minutes, and total minutes
 */
export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0, totalMinutes: 0 };
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      totalMinutes
    };
  };
  
  /**
   * Calculates the rental price based on duration and hourly rate
   * with specific thresholds for hourly increments
   * @param {Date} startTime - The start time
   * @param {Date} endTime - The end time
   * @param {number} hourlyRate - The hourly rate in rupees
   * @returns {Object} Object containing price and duration details
   */
  export const calculateRentalPrice = (startTime, endTime, hourlyRate) => {
    if (!startTime || !endTime || !hourlyRate) {
      return {
        price: 0,
        duration: { hours: 0, minutes: 0, totalMinutes: 0 },
        formattedDuration: '0 hours'
      };
    }
  
    // Calculate exact duration
    const duration = calculateDuration(startTime, endTime);
    let price = 0;
    
    // Minimum booking is charged at the full hourly rate
    if (duration.totalMinutes <= 70) {
      // Up to 1 hour 10 minutes (70 minutes) - charge one hour
      price = hourlyRate;
    } else if (duration.totalMinutes <= 120) {
      // Between 1 hour 11 minutes and 2 hours - charge 1.5 hours
      price = hourlyRate * 1.5;
    } else {
      // Beyond 2 hours, calculate based on the number of complete hours
      // plus potentially a half-hour charge
      const fullHours = Math.floor(duration.totalMinutes / 60);
      const remainingMinutes = duration.totalMinutes % 60;
      
      price = fullHours * hourlyRate;
      
      // Add half-hour charge if remaining minutes > 10 but <= 70 beyond full hour
      if (remainingMinutes > 0 && remainingMinutes <= 70) {
        price += 0.5 * hourlyRate;
      } else if (remainingMinutes > 70) {
        // Add full hour charge if remaining minutes > 70
        price += hourlyRate;
      }
    }
    
    // Format the duration for display
    let formattedDuration = '';
    if (duration.hours > 0) {
      formattedDuration += `${duration.hours} hour${duration.hours !== 1 ? 's' : ''}`;
    }
    if (duration.minutes > 0) {
      formattedDuration += `${duration.hours > 0 ? ' ' : ''}${duration.minutes} minute${duration.minutes !== 1 ? 's' : ''}`;
    }
    if (formattedDuration === '') {
      formattedDuration = '0 minutes';
    }
    
    return {
      price: Math.round(price), // Round to nearest rupee
      duration,
      formattedDuration
    };
  };
  
  /**
   * Generates a breakdown of the pricing for the rental
   * @param {Date} startTime - The start time
   * @param {Date} endTime - The end time
   * @param {number} hourlyRate - The hourly rate in rupees
   * @returns {Array} Array of pricing breakdown items
   */
  export const getPriceBreakdown = (startTime, endTime, hourlyRate) => {
    if (!startTime || !endTime || !hourlyRate) return [];
    
    const duration = calculateDuration(startTime, endTime);
    const breakdown = [];
    const totalMinutes = duration.totalMinutes;
    
    if (totalMinutes <= 70) {
      // Up to 1 hour 10 minutes
      breakdown.push({
        description: `${duration.hours} hour${duration.hours !== 1 ? 's' : ''} ${duration.minutes} minute${duration.minutes !== 1 ? 's' : ''}`,
        rate: `₹${hourlyRate} minimum`,
        amount: hourlyRate
      });
    } else if (totalMinutes <= 120) {
      // Between 1 hour 11 minutes and 2 hours
      breakdown.push({
        description: `${duration.hours} hour${duration.hours !== 1 ? 's' : ''} ${duration.minutes} minute${duration.minutes !== 1 ? 's' : ''}`,
        rate: `₹${hourlyRate * 1.5} (1.5 hour rate)`,
        amount: hourlyRate * 1.5
      });
    } else {
      // Beyond 2 hours - with detailed breakdown
      const fullHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      breakdown.push({
        description: `${fullHours} full hour${fullHours !== 1 ? 's' : ''}`,
        rate: `₹${hourlyRate} per hour`,
        amount: fullHours * hourlyRate
      });
      
      if (remainingMinutes > 0) {
        if (remainingMinutes <= 70) {
          breakdown.push({
            description: `${remainingMinutes} additional minute${remainingMinutes !== 1 ? 's' : ''}`,
            rate: `₹${hourlyRate/2} (half hour rate)`,
            amount: hourlyRate/2
          });
        } else {
          breakdown.push({
            description: `${remainingMinutes} additional minute${remainingMinutes !== 1 ? 's' : ''}`,
            rate: `₹${hourlyRate} (full hour rate)`,
            amount: hourlyRate
          });
        }
      }
    }
    
    return breakdown;
  };