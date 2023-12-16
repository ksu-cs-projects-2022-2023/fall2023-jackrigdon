import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GoogleLogin } from '@react-oauth/google';
import atlasLogo from './assets/AtlasLogo.png';
import './App.css';
const libraries = ["places"];
import greenIcon from './assets/map_pin_green.svg';
import lightGreenIcon from './assets/map_pin_light_green.svg';
import yellowIcon from './assets/map_pin_yellow.svg';
import orangeIcon from './assets/map_pin_orange.svg';
import redIcon from './assets/map_pin_red.svg';


const App = () => {
    const center = { lat: 38.5, lng: -98.0 };
    const [locations, setLocations] = useState([]);
    const [showReviews, setShowReviews] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const apiKey = '9a987c9434dd69ba9a0714016970da7e'; // Your API key
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [mapCenter, setMapCenter] = useState(center); // Initially set to the default center
    const [reviewsPopupPosition, setReviewsPopupPosition] = useState({ x: 20, y: 20 }); // Initial position



    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value) {
            const suggestions = locations.filter(location =>
                location.name.toLowerCase().includes(value.toLowerCase())
            );
            setSearchSuggestions(suggestions);
        } else {
            setSearchSuggestions([]);
        }
    };
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

    const selectSuggestion = (location) => {
        setSelectedLocation(location);
        setSearchTerm('');
        setSearchSuggestions([]);
        // Additional logic to focus on the selected location on the map
    };

    /*const handleDragStart = (e) => {
        const initialX = e.clientX - reviewsPopupPosition.x;
        const initialY = e.clientY - reviewsPopupPosition.y;
        setDraggingData({ initialX, initialY });
    };

    const handleDrag = (e) => {
        if (e.clientX === 0 && e.clientY === 0) {
            return; // Ignore false events
        }
        const newX = e.clientX - draggingData.initialX;
        const newY = e.clientY - draggingData.initialY;
        setReviewsPopupPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
        setDraggingData({ initialX: 0, initialY: 0 }); // Reset dragging data
    };*/

    // Add these event handlers to the review popup


    useEffect(() => {
        
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

    const selectIcon = (score) => {
        let iconUrl;
        if (score >= 9) {
            iconUrl = greenIcon;
        } else if (score >= 7) {
            iconUrl = lightGreenIcon;
        } else if (score >= 5) {
            iconUrl = yellowIcon;
        } else if (score >= 3) {
            iconUrl = orangeIcon;
        } else {
            iconUrl = redIcon;
        }

        return {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(30, 30), // Adjust the size as needed
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15)
        };
    };

    const getSkydivingSuitability = (score) => {
        if (score >= 9) {
            return { text: "Great", score };
        } else if (score >= 7) {
            return { text: "Good", score };
        } else if (score >= 5) {
            return { text: "Moderate", score };
        } else if (score >= 3) {
            return { text: "Moderately Bad", score };
        } else {
            return { text: "Not Ideal", score };
        }
    };



    
    const handleLoginSuccess = async (response) => {
        console.log('Login Success:', response);
        setIsLoggedIn(true);

        try {
            const token = response.credential;
            const apiResponse = await axios.post('https://localhost:7187/WeatherForecast/authenticate', { token });
            console.log('User authenticated:', apiResponse.data);
        } catch (error) {
            console.error('Error in user authentication:', error);
        }
    };


    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        // Retrieve form data
        const formData = new FormData(e.target);
        const latitude = parseFloat(formData.get('latitude'));
        const longitude = parseFloat(formData.get('longitude'));
        const comment = formData.get('comment');
        const rating = parseInt(formData.get('rating'), 10);

        // Construct review object
        const review = {
            latitude,
            longitude,
            comment,
            rating
        };

        // Submit the review
        await submitReview(review);

        // Close the review popup after submission
        setShowReviewPopup(false);
    };



    const submitReview = async (reviewData) => {
        try {
            const response = await fetch('https://localhost:7187/WeatherForecast/Review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                console.log('Review submitted successfully');
                // Optionally, refresh the locations data to reflect the new review
                loadLocationsData();
            } else {
                console.error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };



    const handleLoginError = error => {
        console.error('Login Failed:', error);
    };

    const containerStyle = { width: '100%', height: '100%' };
    
    /*const svgIcon = {
        url: './assets/map_pin_orange.svg', // Path to your SVG file
        scaledSize: new window.google.maps.Size(30, 30), // Adjust the size as needed
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(15, 15)
    };*/
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
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search dropzones..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchSuggestions.length > 0 && (
                                <div className="dropdown">
                                    {searchSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item"
                                            onClick={() => selectSuggestion(suggestion)}
                                        >
                                            {suggestion.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    <div className="map-container">
                        <LoadScript googleMapsApiKey="AIzaSyClDu1YNOnPcPgfqgI_D_HwqjslP-bBaQA" libraries={libraries}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={mapCenter}
                                zoom={6}
                                onLoad={() => setMapLoaded(true)}
                            >
                                {filteredLocations.map((location, index) => (
                                    <Marker
                                        key={index}
                                        position={{ lat: location.latitude, lng: location.longitude }}
                                        title={location.Name}
                                        icon={selectIcon(location.skydivingScore)}
                                        onClick={() => {
                                            setSelectedLocation(location);
                                            setMapCenter({ lat: location.latitude, lng: location.longitude });
                                        }}
                                    />

                                ))}
                                {selectedLocation && (
                                    <div className="info-and-reviews-container">
                                        <InfoWindow
                                                position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                                            onCloseClick={() => setSelectedLocation(null)}
                                        >
                                                <div className="location-info-popup">
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
                                                            <p>Wind Direction: {selectedLocation.weather.windDirection}</p>
                                                            <p>Visibility: {selectedLocation.weather.visibility} miles</p>
                                                            <p>
                                                                Average User Rating: {selectedLocation.reviews && selectedLocation.reviews.length > 0 ?
                                                                    (`${selectedLocation.averageRating}/10`) :
                                                                    ('n/a')}
                                                            </p>

                                                            <h5>Skydiving Suitability:</h5>

                                                            <p>{`${getSkydivingSuitability(selectedLocation.skydivingScore).text} (Score: ${getSkydivingSuitability(selectedLocation.skydivingScore).score}/10)`}</p>
                                                            <button onClick={() => setShowReviewPopup(true)}>Reviews</button>
                                                            
                                                        </div>
                                                    ) : (
                                                        <p>Weather Data Unavailable</p>
                                                    )}
                                                </div>

                                        </InfoWindow>
                                            {showReviewPopup && (
                                                <div
                                                    className="reviews-popup"
                                                    
                                                >
                                                    <button className="close-button" onClick={() => setShowReviewPopup(false)}>X</button>
                                                    <h5>Reviews for {selectedLocation.name}</h5>
                                                    <ul>
                                                        {selectedLocation.reviews && selectedLocation.reviews.length > 0 ? (
                                                            selectedLocation.reviews.map((review, index) => (
                                                                <li key={index}>
                                                                    <p>Rating: {review.rating}/10</p>
                                                                    <p>Comment: {review.comment}</p>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <p>No reviews available</p>
                                                        )}
                                                    </ul>
                                                    <h5>Post a Review</h5>
                                                    <form onSubmit={handleReviewSubmit}>
                                                        <input type="hidden" name="latitude" value={selectedLocation.latitude} />
                                                        <input type="hidden" name="longitude" value={selectedLocation.longitude} />
                                                        <input type="text" name="comment" placeholder="Your Comment" required />
                                                        <input type="number" name="rating" placeholder="Rating (1-10)" min="1" max="10" required />
                                                        <button type="submit">Submit Review</button>
                                                    </form>
                                                </div>
                                            )}
                                    </div>
                                    
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
