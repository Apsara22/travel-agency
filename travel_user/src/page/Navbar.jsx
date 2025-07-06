import React, { useState, useEffect, useRef } from 'react';
import Login from "../Components/Login"
import Logo from "../assets/GlobeWay.png";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

export const Navbar = () => {

  const centerPosition = [27.7172, 85.3240]; // Center of Kathmandu
  const [searchQuery, setSearchQuery] = useState('');
  const [travelCompanies, setTravelCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    const fetchTravelCompanies = async () => {
      try {
        // Using Overpass API to query tourism-related businesses in Kathmandu
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
        
        // Process the data to match our format
        const companies = data.elements
          .filter(element => element.tags && element.tags.name)
          .map(element => ({
            name: element.tags.name,
            position: element.lat ? [element.lat, element.lon] : 
                     element.center ? [element.center.lat, element.center.lon] : 
                     centerPosition,
            description: element.tags.tourism || "Travel company",
            rating: Math.floor(Math.random() * 3) + 3 // Random rating 3-5 for demo
          }))
          .filter(isTravelRelated); // Filter to only travel-related companies
        
        setTravelCompanies(companies.slice(0, 20)); // Limit to 20 results for map
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        console.error("Error fetching travel companies:", err);
        
        // Fallback to static data if API fails
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
          },
          {
            name: "Everest Journey Planners",
            position: [27.7158, 85.3089],
            description: "Expert guides for Everest region treks",
            rating: 5
          },
          {
            name: "Valley Sightseeing",
            position: [27.7052, 85.3173],
            description: "Day trips around Kathmandu Valley",
            rating: 3
          },
          {
            name: "Annapurna Trekking Agency",
            position: [27.7201, 85.3205],
            description: "Guided treks in the Annapurna region",
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
      }
    } catch (err) {
      console.error("Error fetching route:", err);
      // Fallback to straight line if routing fails
      setRoute([centerPosition, destination]);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    fetchRoute(company.position);
    
    // Fly to the company location
    if (mapRef.current) {
      mapRef.current.flyTo(company.position, 15);
    }
  };

  // Filter companies based on search query and ensure they're travel-related
  const filteredCompanies = travelCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && isTravelRelated(company);
  });

  // Get first 6 companies for sidebar display
  const sidebarCompanies = filteredCompanies.slice(0, 6);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    <Login />
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-nav">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        
        <div className='mb-3'>
          <form action="">
            <input 
              type="text" 
              placeholder='Search travel companies...' 
              className="search-input" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </form>
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
      
      <div className="main-content">
        <div style={{ height: '100vh', width: '100%' }}>
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
            
            {/* Center position marker */}
            <Marker position={centerPosition}>
              <Popup>Your Location (Kathmandu Center)</Popup>
            </Marker>
            
            {/* Route polyline */}
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
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};