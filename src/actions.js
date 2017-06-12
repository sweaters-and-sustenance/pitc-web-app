import {
  ACTION,
  API_URL
} from './constants';
import queryString from 'query-string';
import config from './config.json';

function authenticatedRequest(dispatch,getState,action,method,payload,complete,errored) {
  // if (getState().user.token) {
    const params = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // 'Authorization': 'JWT ' + getState().user.token
      }
    }
    if (payload) {
      params.body = JSON.stringify(payload);
    }
    fetch(API_URL+action,params)
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.error) {
        errored(responseData.error);
      } else {
        complete(responseData);
      }
    })
    .catch((error) => {
      errored(error);
    })
  // } else {
  //   errored({'error':'Not logged in'});
  // }
}

export const userLogout = () => ({type: ACTION.USER.LOGOUT});

function authenticate(credentials,action,successAction,failureAction) {
  console.log(credentials)
  return (dispatch) => {
    fetch(API_URL+'/api/user/'+action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.token) {
        dispatch({type: successAction, token: responseData.token})
      } else if (responseData.error) {
        dispatch({type: failureAction, error: responseData.error})
      } else {
        dispatch({type: failureAction, error: 'Unknown error'})
      }
    })
    .catch((error) => {
      dispatch({type: failureAction, error: error.message})
    })
  }
}

export const userLogin = (credentials) => {
  return authenticate(credentials,'login',ACTION.USER.LOGIN_SUCCESS,ACTION.USER.LOGIN_FAILED);
}

export const userSignup = (credentials) => {
  return authenticate(credentials,'signup',ACTION.USER.SIGNUP_SUCCESS,ACTION.USER.SIGNUP_FAILED);
}

function runQuery(dispatch,getState) {
  const query = getState().markers.query;
  const radius = Math.sqrt(Math.pow(query.location.bounds.northEast.latitude - query.location.bounds.southWest.latitude,2) + Math.pow(query.location.bounds.northEast.longitude - query.location.bounds.southWest.longitude,2)) / 2;
  const action = '/api/marker?' + queryString.stringify({
    offset: query.paging.offset,
    limit: query.paging.limit,
    latitude: query.location.coordinates.latitude,
    longitude: query.location.coordinates.longitude,
    radius: radius,
    dateStart: query.date.start.toISOString(),
    dateEnd: query.date.end.toISOString()
  });
  authenticatedRequest(dispatch,getState,action,'GET',null,(markers) => {
    dispatch({
      type: ACTION.MARKERS.SET,
      markers
    });
  },(err) => {
    dispatch({
      type: ACTION.MARKERS.QUERY_FAILED,
      error: err.message
    });
  })
}

export const queryMarkers = () => {
  return (dispatch,getState) => {
    runQuery(dispatch,getState);
  }
}

export const updateQueryLocation = (location) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.MARKERS.QUERY_LOCATION,
      location
    });
    runQuery(dispatch,getState);
  }
}

export const clearMarkers = () => {
  return {
    type: ACTION.MARKERS.CLEAR
  }
}

export const selectMarker = (marker) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.MARKERS.SELECT,
      selected: getState().markers.findIndex((_marker) => {
        return marker.id === _marker.id;
      })
    })
  }
}

export const updateMarkerQueryLocationString = (str) => {
  return (dispatch,getState) => {
    const deltaLat = getState().markers.query.location.bounds.southWest.latitude - getState().markers.query.location.coordinates.latitude
    const deltaLon = getState().markers.query.location.bounds.southWest.longitude - getState().markers.query.location.coordinates.longitude

    fetch('https://maps.googleapis.com/maps/api/geocode/json?' + queryString.stringify({
      key: config.googleKey,
      address: str
    }))
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.error_message) {
          dispatch({
            type: ACTION.MARKERS.QUERY_FAILED,
            error: responseData.error_message
          })
        } else if (responseData.results && responseData.results.length > 0) {
          const lat = responseData.results[0].geometry.location.lat;
          const lng = responseData.results[0].geometry.location.lng;
          dispatch({
            type: ACTION.MARKERS.QUERY_LOCATION,
            location: {
              coordinates: {
                latitude: lat,
                longitude: lng,
              },
              bounds: {
                northEast: {
                  latitude: lat - deltaLat,
                  longitude: lng - deltaLon,
                },
                southWest: {
                  latitude: lat + deltaLat,
                  longitude: lng + deltaLon,
                }
              },
            }
          })
          runQuery(dispatch,getState);
        } else {
          dispatch({
            type: ACTION.MARKERS.QUERY_FAILED,
            error: 'No location found'
          })
        }
      })
      .catch((error) => {
        dispatch({
          type: ACTION.MARKERS.QUERY_FAILED,
          error: error
        })
      })
  }
}

export const updateMarkerQueryDateStart = (date) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.MARKERS.QUERY_DATE_START,
      date
    })
    runQuery(dispatch,getState);
  }
}

export const updateMarkerQueryDateEnd = (date) => {
  return (dispatch,getState) => {
    dispatch({
      type: ACTION.MARKERS.QUERY_DATE_END,
      date
    })
    runQuery(dispatch,getState);
  }
}
