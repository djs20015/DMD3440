document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([40.7128, -74.0060], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});


document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    document.getElementById('findGames').addEventListener('click', findPickleballGames);

    function findPickleballGames() {
        const zipCode = document.getElementById('zipCode').value;

        if (!zipCode) {
            alert('Please enter a ZIP Code.');
            return;
        }

        const overpassEndpoint = 'https://overpass-api.de/api/interpreter';
        const overpassQuery = `[out:json];node["sport"="pickleball"](around:2000,${zipCode});out;`;

        fetch(overpassEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `data=${encodeURIComponent(overpassQuery)}`,
            })
            .then(response => response.json())
            .then(data => {
                handlePickleballData(data);
            })
            .catch(error => console.error('Error:', error));
    }

    function handlePickleballData(data) {
        const pickleballIcon = L.icon({
            iconUrl: '/pickleball-icon.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        data.elements.forEach(element => {
            const {
                lat,
                lon
            } = element.center || element;

            L.marker([lat, lon], {
                    icon: pickleballIcon
                })
                .addTo(map)
                .bindPopup('Pickleball Game Location');
        });
    }
});



// Using Geolocation API to find nearby pickleball courts

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
        const {
            latitude,
            longitude
        } = position.coords;
        console.log(`Your location: ${latitude}, ${longitude}`);
        // Use the coordinates to find nearby pickleball courts
    });
}



const CACHE_NAME = 'my-cache';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(OFFLINE_URL);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            });
        })
    );
});

window.addEventListener('offline', () => {
    console.log('You are offline');
    alert('You are offline. Please check your internet connection.');
});

// Initialize Dexie database
const db = new Dexie('UserProfileDatabase');
db.version(1).stores({
    profiles: '++id, name, location, dob, skillLevel, favoriteSport',
});


function saveProfile() {
    const profile = {
        name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        dob: document.getElementById('dob').value,
        skillLevel: document.getElementById('skillLevel').value,
        favoriteSport: document.getElementById('favoriteSport').value,
    };

    // Save profile to Dexie database
    db.profiles.add(profile)
        .then(() => {
            alert('Profile saved!');
        })
        .catch(error => {
            console.error('Error saving profile:', error);
        });
}