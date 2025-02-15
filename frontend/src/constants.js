let API_URI = 'https://csms002.pythonanywhere.com/';
if (process.env.NODE_ENV === 'development') {
  API_URI = 'https://csms002.pythonanywhere.com/';
}
export const API_BASE_URL = API_URI;
