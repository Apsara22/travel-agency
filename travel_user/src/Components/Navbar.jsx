import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/GlobeWay.png";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        className={`star ${i <= rating ? 'filled' : ''}`}
      >
        ★
      </span>
    );
  }
  return <div className="star-rating">{stars}</div>;
};

// Function to check if a company is travel/trekking/tour related
const isTravelRelated = (company) => {
  const travelKeywords = ['travel', 'tour', 'trek', 'trekking', 'adventure', 'expedition', 'sightseeing'];
  const name = company.name.toLowerCase();
  const description = company.description.toLowerCase();
  
  return travelKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
};

// Function to calculate distance between two coordinates in kilometers (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1); // Return distance with 1 decimal place
};

export const Navbar = () => {
   const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const centerPosition = [27.7172, 85.3240]; // Center of Kathmandu
  const [searchQuery, setSearchQuery] = useState('');
  const [travelCompanies, setTravelCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [distance, setDistance] = useState(null); // Added for distance display
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mapRef = useRef();

  const getaddress = async () => {
  try {
    const apiUrl = `${baseUrl}/api/auth/register`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}

// Usage in useEffect:
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getaddress();
      // Handle data here
    } catch (error) {
      // Handle error here
    }
  };
  
  fetchData();
}, []);

  useEffect(() => {
    const fetchTravelCompanies = async () => {
      try {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
          (
            node["tourism"](around:5000,${centerPosition[0]},${centerPosition[1]});
            way["tourism"](around:5000,${centerPosition[0]},${centerPosition[1]});
            relation["tourism"](around:5000,${centerPosition[0]},${centerPosition[1]});
          );
          out center;
          >;
          out skel qt;`;
        
        const response = await fetch(overpassUrl);
        const data = await response.json();
        
        const companies = data.elements
          .filter(element => element.tags && element.tags.name)
          .map(element => ({
            name: element.tags.name,
            position: element.lat ? [element.lat, element.lon] : 
                     element.center ? [element.center.lat, element.center.lon] : 
                     centerPosition,
            description: element.tags.tourism || "Travel company",
            rating: Math.floor(Math.random() * 3) + 3
          }))
          .filter(isTravelRelated);
        
        setTravelCompanies(companies.slice(0, 20));
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        console.error("Error fetching travel companies:", err);
        
        setTravelCompanies([
          {
            name: "Himalayan Adventures",
            position: [27.7194, 85.3184],
            description: "Specializing in trekking and mountain expeditions",
            rating: 5
          },
          {
            name: "Nepal Eco Tours",
            position: [27.7105, 85.3256],
            description: "Sustainable travel experiences in Nepal",
            rating: 4
          },
          {
            name: "Kathmandu Travel Hub",
            position: [27.7223, 85.3321],
            description: "City tours and cultural experiences",
            rating: 4
          }
        ]);
      }
    };
    
    fetchTravelCompanies();
  }, [centerPosition]);

  const fetchRoute = async (destination) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${centerPosition[1]},${centerPosition[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRoute(data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
        // Calculate straight-line distance using Haversine formula
        const dist = calculateDistance(
          centerPosition[0], centerPosition[1],
          destination[0], destination[1]
        );
        setDistance(dist);
      }
    } catch (err) {
      console.error("Error fetching route:", err);
      setRoute([centerPosition, destination]);
      // Calculate straight-line distance even if routing fails
      const dist = calculateDistance(
        centerPosition[0], centerPosition[1],
        destination[0], destination[1]
      );
      setDistance(dist);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    fetchRoute(company.position);
    
    if (mapRef.current) {
      mapRef.current.flyTo(company.position, 15);
    }
    
    // Close mobile menu when a company is selected on mobile
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const filteredCompanies = travelCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && isTravelRelated(company);
  });

  const sidebarCompanies = filteredCompanies.slice(0, 6);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="mobile-logo">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
      </div>

      <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="sidebar-nav">
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="logo" />
          </div>
          
          <div className='search-container'>
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder='Search travel companies...' 
              className="search-input" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="companies-list">
            <h3>Top Travel Companies</h3>
            {isLoading ? (
              <p>Loading companies...</p>
            ) : error ? (
              <p>Error loading data. Showing sample companies.</p>
            ) : (
              <ul>
                {sidebarCompanies.map((company, index) => (
                  <li 
                    key={index} 
                    className={`company-item ${selectedCompany?.name === company.name ? 'selected' : ''}`}
                    onClick={() => handleCompanyClick(company)}
                  >
                    <div className="company-info">
                      <span className="company-name">{company.name}</span>
                      <StarRating rating={company.rating} />
                      {/* Display distance when this company is selected */}
                      {selectedCompany?.name === company.name && distance && (
                        <div className="distance-info">
                          Distance: {distance} km
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="logout-container">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="map-container">
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={centerPosition}>
              <Popup>Your Location (Kathmandu Center)</Popup>
            </Marker>
            
            {route && (
              <Polyline 
                positions={route} 
                color="blue"
                weight={5}
                opacity={0.7}
              />
            )}
            
            {filteredCompanies.map((company, index) => (
              <Marker 
                key={index} 
                position={company.position}
                eventHandlers={{
                  click: () => handleCompanyClick(company)
                }}
              >
                <Popup>
                  <strong>{company.name}</strong><br />
                  {company.description}<br />
                  <StarRating rating={company.rating} />
                  {/* Display distance in popup */}
                  {selectedCompany?.name === company.name && distance && (
                    <div className="distance-info-popup">
                      Distance from center: {distance} km
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};