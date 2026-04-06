const ACCESS_TOKEN_KEY = 'ramaRemo.accessToken';
const USER_PHOTO_KEY_PREFIX = 'ramaRemo.userPhoto';
const THEME_KEY = 'ramaRemo.theme';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function getUserPhotoKey(userId: number) {
  return `${USER_PHOTO_KEY_PREFIX}.${userId}`;
}

export function getStoredUserPhoto(userId: number) {
  return localStorage.getItem(getUserPhotoKey(userId));
}

export function setStoredUserPhoto(userId: number, photoDataUrl: string) {
  localStorage.setItem(getUserPhotoKey(userId), photoDataUrl);
}

export function clearStoredUserPhoto(userId: number) {
  localStorage.removeItem(getUserPhotoKey(userId));
}

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

export function setStoredTheme(themeId: string) {
  localStorage.setItem(THEME_KEY, themeId);
}
