import { addDays, format, isAfter, setHours, setMinutes, isWeekend, nextMonday } from 'date-fns';

/**
 * Calculates the expected delivery date based on the 5:30 PM cutoff rule.
 * Rule: 
 * - Before 5:30 PM -> Next business day delivery
 * - After 5:30 PM -> 2+ days later (2nd business day)
 */
export function calculateDeliveryDate(orderDate = new Date()) {
  const cutoffTime = setMinutes(setHours(orderDate, 17), 30); // 5:30 PM
  const isAfterCutoff = isAfter(orderDate, cutoffTime);
  
  let deliveryDate = addDays(orderDate, isAfterCutoff ? 2 : 1);
  
  // Skip weekends (Deliveries only on business days)
  while (isWeekend(deliveryDate)) {
    deliveryDate = addDays(deliveryDate, 1);
  }
  
  return deliveryDate;
}

export function formatDeliveryDate(date) {
  return format(date, 'EEEE, MMM do, yyyy');
}

export function getDemandWindow() {
  const today = new Date();
  const window = [];
  
  for (let i = 0; i < 6; i++) {
    const date = addDays(today, i);
    window.push({
      date,
      formatted: format(date, 'MMM do'),
      day: format(date, 'EEE'),
      isClosed: i === 0 && isAfter(today, setMinutes(setHours(today, 17), 30))
    });
  }
  
  return window;
}

