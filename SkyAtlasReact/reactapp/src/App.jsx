import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GoogleLogin } from '@react-oauth/google';
import atlasLogo from './assets/AtlasLogo.png';
import './App.css';
const libraries = ["places"];


const App = () => {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const apiKey = '9a987c9434dd69ba9a0714016970da7e'; // Your API key
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        const loadLocationsData = async () => {
            try {
                const response = await fetch('https://localhost:7187/WeatherForecast/skydiving-locations');
                const data = await response.json();
                console.log('Fetched data:', data); // Check the fetched data
                setLocations(data);
            } catch (error) {
                console.error('Error loading locations data:', error);
            }
        };
        if(mapLoaded) { // Fetch data only after the map has loaded
            loadLocationsData();
        }
    }, [mapLoaded]);

    /*const getWeather = async (latitude, longitude) => {
        const url = `https://api.weatherstack.com/current?access_key=${apiKey}&query=${latitude},${longitude}&units=f`;
        try {
            const response = await axios.get(url);
            if (response.data && response.data.current) {
                console.log('Weather data fetched:', response.data.current); // Log the fetched data
                return response.data.current;
            } else {
                console.error('No weather data found:', response);
                return null;
            }
        } catch (error) {
            console.error("Error fetching weather data", error);
            return null;
        }
    };*/
    
    const handleLoginSuccess = response => {
        console.log('Login Success:', response);
        setIsLoggedIn(true);
    };

    const handleLoginError = error => {
        console.error('Login Failed:', error);
    };

    const containerStyle = { width: '100%', height: '100%' };
    const center = { lat: 38.5, lng: -98.0 };

    return (
        <div>
            {!isLoggedIn ? (
                <div className="login-container">
                    <div className="login-box">
                        <img src={atlasLogo} alt="Atlas Logo" className="login-logo" />
                        <h1 className="login-title">Login to Access Skydive Atlas</h1>
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={handleLoginError}
                            className="login-button"
                        />
                    </div>
                </div>
            ) : (
                <div className="main-container">
                    <h1 id="titleLabel">Skydive Atlas</h1>
                    <div className="map-container">
                        <LoadScript googleMapsApiKey="AIzaSyClDu1YNOnPcPgfqgI_D_HwqjslP-bBaQA" libraries={libraries}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={6}
                                onLoad={() => setMapLoaded(true)}
                            >
                                {locations.map((location, index) => (
                                    <Marker
                                        key={index}
                                        position={{ lat: location.latitude, lng: location.longitude }}
                                        title={location.Name}
                                        onClick={() => setSelectedLocation(location)}
                                    />
                                ))}
                                {selectedLocation && (
                                    <InfoWindow
                                            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                                        onCloseClick={() => setSelectedLocation(null)}
                                    >
                                            <div>
                                                <h4>{selectedLocation.name || 'Name Unavailable'}</h4>
                                                <p>Phone: {selectedLocation.phoneNumber || 'Phone Number Unavailable'}</p>
                                                <a href={selectedLocation.website || '#'} target="_blank" rel="noopener noreferrer">
                                                    {selectedLocation.website ? 'Visit Website' : 'Website Unavailable'}
                                                </a>
                                                <p>Hours: {selectedLocation.hoursOfOperation ? selectedLocation.hoursOfOperation.join(', ') : 'Hours Unavailable'}</p>
                                                {selectedLocation.weather ? (
                                                    <div>
                                                        <h5>Current Weather:</h5>
                                                        <p>Cloud Cover: {selectedLocation.weather.cloudCover}%</p>
                                                        <p>Temperature: {selectedLocation.weather.feelsLike}&deg;F</p>
                                                        <p>Wind: {selectedLocation.weather.windSpeed} mph</p>
                                                    </div>
                                                ) : (
                                                    <p>Weather Data Unavailable</p>
                                                )}
                                            </div>

                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App
