import React, { Component } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const libraries = ["places"];

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            selectedLocation: null,
            weatherData: null
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
                this.searchPlaces(index + 1);
            }
        });
    }

    getWeather = async (lat, lon) => {
        const apiKey = '9a987c9434dd69ba9a0714016970da7e';
        const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${lat},${lon}`;

        try {
            const { data } = await axios.get(url);
            return data;
        } catch (error) {
            console.error("Error fetching weather data", error);
        }
    }

    onMarkerClick = async (location) => {
        const weatherData = await this.getWeather(location.geometry.location.lat(), location.geometry.location.lng());
        this.setState({ selectedLocation: location, weatherData });
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

                <LoadScript googleMapsApiKey="AIzaSyClDu1YNOnPcPgfqgI_D_HwqjslP-bBaQA" libraries={libraries}>
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
                                    onClick={() => this.onMarkerClick(location)}
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
                                                {this.state.weatherData && this.state.weatherData.current && (
                                                    <div>
                                                        <h5>Weather:</h5>
                                                        <p>{this.state.weatherData.current.weather_descriptions ? this.state.weatherData.current.weather_descriptions[0] : 'N/A'}</p>
                                                        <p>Temperature: {this.state.weatherData.current.temperature ? this.state.weatherData.current.temperature + '°C' : 'N/A'}</p>
                                                        <p>Wind: {this.state.weatherData.current.wind_speed ? this.state.weatherData.current.wind_speed + ' kph' : 'N/A'}</p>
                                                    </div>
                                                )}

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
