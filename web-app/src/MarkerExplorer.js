import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup, Circle} from 'react-leaflet';
import './MarkerExplorer.scss';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  queryMarkers,
  clearMarkers,
  selectMarker,
  updateQueryLocation,
  updateMarkerQueryLocationString,
  updateMarkerQueryDateStart,
  updateMarkerQueryDateEnd
} from './actions'
import {
  COLORS,
  API_URL
} from './constants'
import DatePicker from 'react-bootstrap-date-picker';
import config from './config.json';
import queryString from 'query-string';
import {makeRadius} from './utils';

class MarkerExplorer extends Component {
  constructor(props) {
    super(props);
    this.mapChanged = this.mapChanged.bind(this);
    this.updateSearchString = this.updateSearchString.bind(this);
    this.updateDateStart = this.updateDateStart.bind(this);
    this.updateDateEnd = this.updateDateEnd.bind(this);
    this.mapReady = this.mapReady.bind(this);
    this.mapMoveTimeout = null;
    this.textSearchTimeout = null;
  }

  mapChanged(m) {
    const bounds = m.target.getBounds();
    const center = m.target.getCenter();
    if (center.lat !== this.props.markers.query.location.coordinates.latitude
        || center.lng !== this.props.markers.query.location.coordinates.longitude
        || bounds._northEast.lat !== this.props.markers.query.location.bounds.northEast.latitude
        || bounds._northEast.lng !== this.props.markers.query.location.bounds.northEast.longitude
        || bounds._southWest.lat !== this.props.markers.query.location.bounds.southWest.latitude
        || bounds._southWest.lng !== this.props.markers.query.location.bounds.southWest.longitude
    ) {
      if (this.mapMoveTimeout) {
        window.clearTimeout(this.mapMoveTimeout)
      }
      this.mapMoveTimeout = window.setTimeout(() => {
        this.props.updateQueryLocation({
          coordinates: {
            latitude: center.lat,
            longitude: center.lng,
          },
          bounds: {
            northEast: {
              latitude: bounds._northEast.lat,
              longitude: bounds._northEast.lng,
            },
            southWest: {
              latitude: bounds._southWest.lat,
              longitude: bounds._southWest.lng,
            }
          }
        });
      },500);
    }
  }

  updateSearchString(event) {
    const str = event.target.value;
    if (this.textSearchTimeout) {
      window.clearTimeout(this.textSearchTimeout)
    }
    this.textSearchTimeout = window.setTimeout(() => {
      this.props.updateMarkerQueryLocationString(str);
    },500);
  }

  updateDateStart(date) {
    this.props.updateMarkerQueryDateStart(new Date(Date.parse(date)));
  }

  updateDateEnd(date) {
    this.props.updateMarkerQueryDateEnd(new Date(Date.parse(date)));
  }

  mapReady(m) {
    this.map = m.target
  }

  generateDownloadLink() {
    return API_URL + '/api/marker?' + queryString.stringify({
      offset: this.props.markers.query.paging.offset,
      limit: this.props.markers.query.paging.limit,
      latitude: this.props.markers.query.location.coordinates.latitude,
      longitude: this.props.markers.query.location.coordinates.longitude,
      radius: makeRadius(this.props.markers.query),
      dateStart: this.props.markers.query.date.start.toISOString(),
      dateEnd: this.props.markers.query.date.end.toISOString(),
      format: 'csv'
    });
  }

  render() {
    return (
      <div className="MarkerExplorer">
        <Map
          center={[
            this.props.markers.query.location.coordinates.latitude,
            this.props.markers.query.location.coordinates.longitude
          ]}
          bounds={[
            [
              this.props.markers.query.location.bounds.northEast.latitude,
              this.props.markers.query.location.bounds.northEast.longitude
            ],
            [
              this.props.markers.query.location.bounds.southWest.latitude,
              this.props.markers.query.location.bounds.southWest.longitude
            ]
          ]}
          onMoveend={this.mapChanged}
          whenReady={this.mapReady}
          >
          <TileLayer
             url={config.mapTileURL}
           />
           { this.props.markers.markers.map((marker) => (
             <Circle
              key={marker.id}
              center={[marker.latitude,marker.longitude]}
              radius={marker.radius}
              color={COLORS.COLOR_BLUE}
              stroke={0}
              fillOpacity={0.3}
              >
              <Marker position={[marker.latitude,marker.longitude]} riseOnHover={true}>
               <Popup>
                 <div className="marker-popup">
                   <p><strong>Homeless:</strong> {marker.homeless}</p>
                   <p><strong>Meals:</strong> {marker.meals}</p>
                   <p><strong>Clothes:</strong> {marker.clothes}</p>
                  </div>
               </Popup>
              </Marker>
             </Circle>
           ))}
        </Map>
        <div className="controls">
          <div className="panel panel-default">
            <div className="panel-heading">
              Search
            </div>
            <div className="panel-body">
              <div className="form">
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" id="location-search" className="form-control" onChange={(str) => this.updateSearchString(str)} />
                </div>
                <div className="form-group">
                  <label>Date Start</label>
                  <DatePicker value={this.props.markers.query.date.start.toISOString()} onChange={(date) => this.updateDateStart(date)} showClearButton={false} />
                </div>
                <div className="form-group">
                  <label>Date End</label>
                  <DatePicker value={this.props.markers.query.date.end.toISOString()} onChange={(date) => this.updateDateEnd(date)} showClearButton={false} />
                </div>
                <a className="btn btn-primary" download href={this.generateDownloadLink()}>Download Results</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const stateToProps = (state) => {
  return {
    markers: state.markers
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    queryMarkers,
    clearMarkers,
    selectMarker,
    updateQueryLocation,
    updateMarkerQueryLocationString,
    updateMarkerQueryDateStart,
    updateMarkerQueryDateEnd
  }, dispatch)
}

export default connect(stateToProps, dispatchToProps)(MarkerExplorer)
