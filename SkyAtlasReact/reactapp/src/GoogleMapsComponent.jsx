import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
    width: '400px',
    height: '400px'
};

const center = {
    lat: 37.7749,  // Example coordinates for San Francisco
    lng: -122.4194
};

function MyMapComponent() {
    return (
        <LoadScript
            googleMapsApiKey="AIzaSyClDu1YNOnPcPgfqgI_D_HwqjslP-bBaQA"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
            >
                {/* You can add markers, overlays, and other map features here */}
            </GoogleMap>
        </LoadScript>
    );
}

export default MyMapComponent;
