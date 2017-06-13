export const ACTION = {
  MARKERS: {
    SELECT: 'MARKERS_SELECT',
    SET: 'MARKERS_SET',
    CLEAR: 'MARKERS_CLEAR',
    QUERY: 'MARKERS_QUERY',
    QUERY_LOCATION: 'MARKERS_QUERY_LOCATIONS',
    QUERY_DATE_START: 'MARKERS_QUERY_DATE_START',
    QUERY_DATE_END: 'MARKERS_QUERY_DATE_END',
    QUERY_FAILED: 'MARKERS_QUERY_FAILED',
  },
  USER: {
    LOGIN: 'USER_LOGIN',
    LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
    LOGIN_FAILED: 'USER_LOGIN_FAILED',
    SIGNUP: 'USER_SIGNUP',
    SIGNUP_SUCCESS: 'USER_SIGNUP_SUCCESS',
    SIGNUP_FAILED: 'USER_SIGNUP_FAILED',
    LOGOUT: 'USER_LOGOUT'
  }
}

export const API_URL = 'http://localhost:8000'

export const COLORS = {
  COLOR_BLUE: '#00b19e',
  COLOR_OFF_WHITE: '#e8e8e8',
  COLOR_GRAY: '#737373',
  COLOR_BROWN: '#67472f',
  COLOR_SALMON: '#FF2E43'
}

export const FEATURE_FLAGS = {
  USER_ACCOUNT: false
}
