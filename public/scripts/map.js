let streets = L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken:
      'pk.eyJ1Ijoic2lub3MiLCJhIjoiY2tveDA1MncyMGJleDJ2bXBwcWI4Z21yaiJ9.tyKb9O3EXOVojnRN5LYdeQ',
  }
).addTo(map);

let satellite = L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/satellite-v9',
    accessToken:
      'pk.eyJ1Ijoic2lub3MiLCJhIjoiY2tveDA1MncyMGJleDJ2bXBwcWI4Z21yaiJ9.tyKb9O3EXOVojnRN5LYdeQ',
  }
);
