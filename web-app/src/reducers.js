import { combineReducers } from 'redux'
import {
  ACTION
} from './constants';
import {REHYDRATE} from 'redux-persist/constants';

const today = new Date();
const fallbackLat = 38.85435589092342;
const fallbackLon = -77.05896832309267;
const initialMarkersState = {
  query: {
    paging: {
      offset: 0,
      limit: 1000,
    },
    location: {
      coordinates: {
        latitude: fallbackLat,
        longitude: fallbackLon,
      },
      bounds: {
        northEast: {
          latitude: (fallbackLat - 0.05),
          longitude: (fallbackLon - 0.05),
        },
        southWest: {
          latitude: (fallbackLat + 0.05),
          longitude: (fallbackLon + 0.05),
        }
      },
    },
    date: {
      start: new Date(today.getTime() - (1000 * 60 * 60 * 24 * 30)),
      end: today
    },
    error: null
  },
  downloadLink: null,
  markers: [],
  selected: null
}

const markers = (state = initialMarkersState, action) => {
  switch (action.type) {
    case ACTION.MARKERS.QUERY:
      return Object.assign({},state,{
        query: action.query
      });
    case ACTION.MARKERS.QUERY_LOCATION:
      return Object.assign({},state,{
        query: Object.assign({},state.query,{
          location: action.location
        })
      });
    case ACTION.MARKERS.QUERY_DATE_START:
      return Object.assign({},state,{
        query: Object.assign({},state.query,{
          date: Object.assign({},state.query.date,{
            start: action.date
          })
        })
      });
    case ACTION.MARKERS.QUERY_DATE_END:
      return Object.assign({},state,{
        query: Object.assign({},state.query,{
          date: Object.assign({},state.query.date,{
            end: action.date
          })
        })
      });
    case ACTION.MARKERS.SET:
      return Object.assign({},state,{
        markers: action.markers,
        query: Object.assign({},state.query,{
          error: null
        })
      });
    case ACTION.MARKERS.SELECT:
      return Object.assign({},state,{
        selected: action.selected
      });
    case ACTION.MARKERS.CLEAR:
      return Object.assign({},state,{
        selected: null,
        markers: []
      });
    case ACTION.MARKERS.QUERY_FAILED:
      return Object.assign({},state,{
        query: Object.assign({},state.query,{
          error: action.error
        })
      });
    case REHYDRATE:
      var incoming = action.payload.markers
      if (incoming) {
        incoming.query.date.start = new Date(Date.parse(incoming.query.date.start))
        incoming.query.date.end = new Date(Date.parse(incoming.query.date.end))
        return incoming;
      } else {
        return state;
      }
    default:
      return state;
  }
}

const initialUserState = {
  token: null,
  user: null,
  error: null
};

const user = (state = initialUserState, action) => {
  switch (action.type) {
    case ACTION.USER.LOGIN_SUCCESS:
      return Object.assign({},state,{
        token: action.token,
        error: null
      });
    case ACTION.USER.LOGIN_FAILED:
      return Object.assign({},state,{
        token: null,
        error: action.error
      });
    case ACTION.USER.SIGNUP_SUCCESS:
      return Object.assign({},state,{
        token: action.token,
        error: null
      });
    case ACTION.USER.SIGNUP_FAILED:
      return Object.assign({},state,{
        token: null,
        error: action.error
      });
    case ACTION.USER.LOGOUT:
    case ACTION.USER.LOGIN:
    case ACTION.USER.SIGNUP:
      return Object.assign({},initialUserState);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  markers,
  user
})

export default rootReducer;
