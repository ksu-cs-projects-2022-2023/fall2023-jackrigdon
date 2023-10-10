import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
/*import './App.css';*/


const libraries = ["places"];

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            selectedLocation: null
        };
        this.mapRef = React.createRef();
    }

    queries = ['skydiving in Kansas', 'skydiving in Missouri', 'skydiving in Oklahoma'];

    onMapLoad = (map) => {
        this.mapRef.current = map;
        this.searchPlaces(0);
    }

    searchPlaces = (index) => {
        if (index >= this.queries.length) return;

        const service = new window.google.maps.places.PlacesService(this.mapRef.current);

        const request = {
            query: this.queries[index],
            location: { lat: 38.5, lng: -98.0 },
            radius: '2414016'
        };

        service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(result => {
                    const detailsRequest = {
                        placeId: result.place_id,
                        fields: ['name', 'website', 'formatted_phone_number', 'opening_hours', 'geometry']
                    };

                    service.getDetails(detailsRequest, (details, detailsStatus) => {
                        if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                            this.setState(prevState => ({
                                locations: [...prevState.locations, details]
                            }));
                        }
                    });
                });

                setTimeout(() => {
                    this.searchPlaces(index + 1);
                }, 5000);
            } else {
                console.error(`Error fetching places for query: ${this.queries[index]}`);
                this.searchPlaces(index + 1);  // Continue with the next query even if the current one fails
            }
        });
    }
    render() {
        const containerStyle = {
            width: '100vw',
            height: '100vh'
        };

        const center = {
            lat: 38.5,
            lng: -98.0
        };

        return (
            <div>
                <h1 id="tabelLabel">Skydive Atlas</h1>

                <LoadScript googleMapsApiKey="**************************" libraries={libraries}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={6}
                        onLoad={this.onMapLoad}
                    >
                        {this.state.locations.map((location, index) => (
                            location.geometry && location.geometry.location ? (
                                <Marker
                                    key={index}
                                    position={location.geometry.location}
                                    title={location.name}
                                    onClick={() => this.setState({ selectedLocation: location })}
                                >
                                    {this.state.selectedLocation === location && (
                                        <InfoWindow
                                            position={location.geometry.location}
                                            onCloseClick={() => this.setState({ selectedLocation: null })}
                                        >
                                            <div>
                                                <h4>{location.name}</h4>
                                                <p>{location.formatted_address}</p>
                                                <p>{location.formatted_phone_number}</p>
                                                <a href={location.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                                                <p>{location.opening_hours && location.opening_hours.weekday_text.join(', ')}</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </Marker>
                            ) : null
                        ))}
                    </GoogleMap>
                </LoadScript>
            </div>
        );
    }
}