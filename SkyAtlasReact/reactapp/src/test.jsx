import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GoogleLogin } from '@react-oauth/google';
import atlasLogo from './assets/AtlasLogo.png';

const libraries = ["places"];
const atlasLogo = './path-to-your-logo.png'; // Replace with your logo path

const App = () => {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const apiKey = '9a987c9434dd69ba9a0714016970da7e'; // Your API key

    useEffect(() => {
        const loadLocationsData = async () => {
            try {
                const response = await fetch('/skydiving_locationz.json'); // Correct path
                const loadedLocations = await response.json();
                const locationsWithWeather = await Promise.all(loadedLocations.map(async loc => {
                    const weatherData = await getWeather(loc.Latitude, loc.Longitude);
                    return { ...loc, weatherData };
                }));
                setLocations(locationsWithWeather);
            } catch (error) {
                console.error('Error loading locations data:', error);
            }
        };

        loadLocationsData();
    }, []);

    const getWeather = async (latitude, longitude) => {
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
    };

    const handleLoginSuccess = response => {
        console.log('Login Success:', response);
        setIsLoggedIn(true);
    };

    const handleLoginError = error => {
        console.error('Login Failed:', error);
    };

    const containerStyle = { width: '100vw', height: '100vh' };
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
                            >
                                {locations.map((location, index) => (
                                    <Marker
                                        key={index}
                                        position={{ lat: parseFloat(location.Latitude), lng: parseFloat(location.Longitude) }}
                                        title={location.Name}
                                        onClick={() => setSelectedLocation(location)}
                                    />
                                ))}
                                {selectedLocation && (
                                    <InfoWindow
                                        position={{ lat: parseFloat(selectedLocation.Latitude), lng: parseFloat(selectedLocation.Longitude) }}
                                        onCloseClick={() => setSelectedLocation(null)}
                                    >
                                        <div>
                                            <h4>{selectedLocation.Name}</h4>
                                            <p>Phone: {selectedLocation['Phone Number']}</p>
                                            <a href={selectedLocation.Website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                                            <p>Hours: {selectedLocation['Hours of Operation'].join(', ')}</p>
                                            {selectedLocation.weatherData && (
                                                <div>
                                                    <h5>Current Weather:</h5>
                                                    <p>Cloud Cover: {location.weatherData.cloudcover}%</p>
                                                    <p>Temperature: {location.weatherData.temperature}&deg;F</p>
                                                    <p>Wind: {location.weatherData.wind_speed} mph</p>
                                                    <p>Visibility: {location.weatherData.visibility} miles</p>
                                                </div>
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
