import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import MapChart from './Chart'
import Button from './Button'

const containerStyle = {
    width: '100%',
    height: '800px'
};

const initcenter = {
    lat: 54.150000,
    lng: -2.471432
};

function Map() {

    const [libraries] = useState(['places'])

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAPS_KEY,
        libraries: libraries
    })

    const [map, setMap] = React.useState(null)
    const [searchBox, setSearchBox] = useState(null)
    const [elevator, setElevator] = React.useState(null)
    const [elevations, setElevations] = React.useState([])
    const [points, setPoints] = React.useState([])
    const [markers, setMarkers] = React.useState([])
    const [line, setLine] = React.useState(null)
    const [chartActive, setChartActive] = React.useState(false)
    const [distance, setDistance] = React.useState(0)
    const [centre, setCentre] = React.useState(initcenter)
    const search = useRef(null)

    const onLoad = React.useCallback(function callback(map) {

        setElevator(new window.google.maps.ElevationService())

        setMap(map)

        // polyline extensions taken from http://www.geocodezip.com/scripts/v3_epoly.js
        window.google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
            var EarthRadiusMeters = 6378137.0; // meters
            var lat1 = this.lat();
            var lon1 = this.lng();
            var lat2 = newLatLng.lat();
            var lon2 = newLatLng.lng();
            var dLat = (lat2-lat1) * Math.PI / 180;
            var dLon = (lon2-lon1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = EarthRadiusMeters * c;
            return d;
        }

        window.google.maps.Polyline.prototype.GetPointsAtDistance = function(metres) {
            var next = metres;
            var points = [];
            // some awkward special cases
            if (metres <= 0) return points;
            var dist=0;
            var olddist=0;
            for (var i=1; (i < this.getPath().getLength()); i++) {
                olddist = dist;
                dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
                while (dist > next) {
                    var p1= this.getPath().getAt(i-1);
                    var p2= this.getPath().getAt(i);
                    var m = (next-olddist)/(dist-olddist);
                    points.push(new window.google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m));
                    next += metres;    
                }
            }
            return points;
        }
    }, [])

    const searchLoad = React.useCallback(function callback(search) {
        setSearchBox(search)
    }, [])

    useEffect(()=>{
        if(points.length) {
            elevator.getElevationForLocations({
                'locations': points
            }, (results, status)=>{
                setElevations(results)
            })
        }
    }, [points, elevator])

    function handleMapClick(e) {

        if(e) {
            const marker = e.latLng

            markers.push(marker)

            setMarkers(markers)
        }
        
        setElevations([])

        if(line) {
            line.setMap(null)
        }

        let newLine = new window.google.maps.Polyline({
            path: markers.map(marker => marker),
            strokeColor: "red",
            strokeOpacity: 0.4,
            strokeWeight: 4,
            map: map
        });

        setLine(newLine)

        if(markers.length > 1) {
            let dist = 0
            for(let i = 0; i < markers.length - 1; i++) {
                dist += window.google.maps.geometry.spherical.computeDistanceBetween(markers[i], markers[i + 1])
            }
            setDistance(dist)
        }
    }

    function handleMarkerClick(index) {
        // remove all markers after and including the one clicked from state.markers
        markers.length = index

        setMarkers(markers)

        // draw new line using updated markers
        handleMapClick(false)
    }

    function generateElevation() {
        if(line) {
            const l = line.GetPointsAtDistance(500)

            setPoints(l)

            setChartActive(true)
        }
    }

    function clearRoute() {

        setMarkers([])
        setPoints([])
        setElevations([])
        setDistance(0)

        if(line) {
            line.setMap(null)
        }
        
        setLine(null)

    }

    function onPlacesChanged() {
        clearRoute()

        if(searchBox) {
            if (searchBox.getPlaces().length === 0) return;
            
            const place = searchBox.getPlaces()[0]
            setCentre(place.geometry.location)
        }
    }

    function toggleChart() {
        setChartActive(!chartActive)
    }

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    return isLoaded ? (
        <section className="map h-auto bg-[#cadc72]">
                <div className='container'>
                    <div className='row justify-center'>
                        <div className='w-5/12'>
                            <StandaloneSearchBox ref={search} onLoad={searchLoad} onPlacesChanged={onPlacesChanged} >
                                <form>
                                    <label className="absolute left-[-999999px]" htmlFor="search">Choose destination</label>
                                    <input
                                        id="search"
                                        name='search'
                                        type="text"
                                        placeholder="Choose destination"
                                        className='p-4 mb-8 w-full border-gray-400 border rounded-md'
                                    />
                                </form>
                            </StandaloneSearchBox>
                            <div className='flex gap-4 mb-4'>
                                <Button className={`w-1/2 ${!markers.length ? 'bg-gray-300' : ''}` } action={ generateElevation } text="Get elevation"></Button>
                                <Button className={`w-1/2 ${!markers.length ? 'bg-gray-300' : ''}` } action={ clearRoute } text="Clear route"></Button>
                            </div>
                            <p className='p-4 text-[2rem]'>Total distance: <span className='font-bold'>{ (distance / 1000).toFixed(2) + 'km'}</span></p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='w-full'>
                            <GoogleMap
                            className="rounded-lg"
                                mapContainerStyle={containerStyle}
                                center={centre}
                                zoom={12}
                                mapTypeId={'hybrid'}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                onClick={ (e)=>handleMapClick(e) }
                            >
                                {markers.map((marker, index) => (
                                    <Marker
                                        id={index}
                                        key={index}
                                        position={marker}
                                        icon={index !== 0 ? 'images/marker.png' : 'images/marker_first.png'}
                                        onClick={(e)=>{ handleMarkerClick(index, e) }}

                                    />
                                ))}
                            </GoogleMap>
                            
                        </div>
                    </div>
                    <div className='row justify-center'>
                        <div className='w-2/3'>
                            <MapChart className={`fixed top-0 left-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-500 ${chartActive ? 'opacity-1' : 'opacity-0 pointer-events-none' }`} toggle={ toggleChart } points={ elevations } />
                        </div>
                        
                    </div>
                </div>
        </section>
    ) : <></>
}
  
export default React.memo(Map)