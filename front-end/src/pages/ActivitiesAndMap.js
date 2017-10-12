import React, { Component } from 'react';
import { Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

const MapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyCnSa0UV1EelPqTT2Uo3CyxSfnkDIcTwaA",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px`, padding: `20px`}} />,
    mapElement: <div style={{ height: `100%` }} />,
    center: { lat: 32.722752, lng: -117.168310 }
  }),
    withScriptjs,
    withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={12}
    defaultCenter={props.center}
  >
    { props.activities.map((activity) =>{
    return (
      <Marker key={activity.id} position={{ lat: activity.latitude, lng: activity.longitude }} onClick={props.onMarkerClick.bind(this, activity)} />
    )})}
  </GoogleMap>
)



class ActivitiesAndMap extends Component {

  constructor(props){
    super(props);
    this.state = {
      showModal:false,
      isMarkerShown: true,
      currentActivity: null
    }
  }

  render() {
    return (
      <div>
        <MapComponent
        onMarkerClick={this.open.bind(this)}
        activities={this.props.activities}
        />
        <ListGroup>
        {this.props.activities.map((activity) =>{
          return (
            <ListGroupItem key = {activity.id}>
              <button className = "activity" onClick={this.open.bind(this, activity)}>
                {activity.name}
              </button>
              {this.modal()}
            </ListGroupItem>
          )
        })}
        </ListGroup>
      </div>
    );
  }

  close() {
    this.setState({ showModal: false });
  }

  open(activity) {
    this.setState({
      showModal: true,
      currentActivity: activity
    });
  }

  complete(activity) {
    let self = this
    //changing the button text doesn't work yet :( so sad
    document.getElementById("completeButton").innerText = "Locating..."
    window.navigator.geolocation.getCurrentPosition(function(pos){
      var R = 6371
      var dLat = (activity.latitude-pos.coords.latitude)
      var dLon = (activity.longitude-pos.coords.longitude)
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos.coords.latitude) * Math.cos(activity.latitude) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      var d = R * c
      console.log(d < 100);
      if( d < 100 ){
        self.props.handleComplete(activity.id)
        self.setState({ showModal: false })
        alert("Congrats on completing an activity! Keep it up!")
        document.getElementById("completeButton").innerText = "Complete"
      } else {
        self.setState({ showModal: false })
        alert("You are outside of the activity's location. Get closer!")
        console.log("d is greater than 100");
        document.getElementById("completeButton").innerText = "Complete"

      }
    })
  }


  modal() {
    if(this.state.currentActivity){
      const theModal = (
        <Modal show={this.state.showModal}
        onHide={this.close.bind(this)}
        >
          <Modal.Header>
            <Modal.Title>{this.state.currentActivity.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{this.state.currentActivity.description}</p>
            <hr/>
            <h4>Longitude: {this.state.currentActivity.longitude}</h4>
            <h4>Latitude: {this.state.currentActivity.latitude}</h4>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.close.bind(this)}>Close</button>
            <button id="completeButton" onClick={this.complete.bind(this, this.state.currentActivity)}>Complete</button>
          </Modal.Footer>
        </Modal>
        )
      return theModal
    } else {
      return <div></div>
    }
  }

};

export default ActivitiesAndMap;
