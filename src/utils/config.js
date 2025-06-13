console.log('→ URL =', process.env.REACT_APP_API_BASE_URL);
console.log('→ Status =', process.env.REACT_APP_SQUARE_MODE);

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const SQUARE_APP_ID =
  process.env.REACT_APP_SQUARE_MODE === 'live'
    ? process.env.REACT_APP_SQUARE_APP_ID_LIVE
    : process.env.REACT_APP_SQUARE_APP_ID_TEST;

export const SQUARE_LOCATION_ID =
  process.env.REACT_APP_SQUARE_MODE === 'live'
    ? process.env.REACT_APP_SQUARE_LOCATION_ID_LIVE
    : process.env.REACT_APP_SQUARE_LOCATION_ID_TEST;