console.log(localStorage.getItem('login'));
var user = localStorage.getItem('login');
var geojsonLayer;
var caop;

var map = L.map('map').setView([41.69, -8.83], 14);

var streets = L.tileLayer(
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

var satellite = L.tileLayer(
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

$('#blogout').click(function () {
  window.location = 'http://localhost:5000/';
});

$('#fSantuario').click(function () {
  getData();
});

$('#fJardins').click(function () {
  getData();
});

$('#fMonumentos').click(function () {
  getData();
});

$('#fPontos').click(function () {
  getData();
});

$('#fPoligonos').click(function () {
  getData();
});

$('#fLinhas').click(function () {
  getData();
});

$('#tipoMapa').on('change', function () {
  if ($('#tipoMapa').find(':selected').text() === 'Base') {
    map.removeLayer(satellite);
    map.addLayer(streets);
  } else if ($('#tipoMapa').find(':selected').text() === 'Satélite') {
    map.removeLayer(streets);
    map.addLayer(satellite);
  }
});

getMapa();

$('#btnPesquisa').click(function () {
  var local = $('#pesquisa').val();
  if (local !== '') {
    getCaop(local);
  } else {
    getData();
  }
});

var buffer;

$('#btnLimites').click(function () {
  fetch('http://localhost:5000/api/mapa')
    .then((res) => {
      return res.json();
    })
    .then((geojson) => {
      caop = L.geoJSON(geojson).addTo(map);
      getData();
    });
});

$('#btnLimitesR').click(function () {
  map.removeLayer(caop);
});

// create the sidebar instance and add it to the map
var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);
//.open("home");

// be notified when a panel is opened
sidebar.on('content', function (ev) {
  switch (ev.id) {
    case 'autopan':
      sidebar.options.autopan = true;
      break;
    default:
      sidebar.options.autopan = false;
  }
});

var style = {
  color: 'green',
  opacity: 1.0,
  fillOpacity: 1.0,
  weight: 2,
  clickable: false,
};

L.Control.FileLayerLoad.LABEL =
  '<img style="max-width: 70%; max-height: 70%; margin: 4px;" src="folder.svg" alt="file icon"/>';
var control = L.Control.fileLayerLoad({
  fitBounds: true,
  layerOptions: {
    style: style,
    pointToLayer: function (data, latlng) {
      return L.circleMarker(latlng, { style: style });
    },
  },
});
control.addTo(map);
control.loader.on('data:loaded', function (e) {
  var layer = e.layer;
  console.log(layer);
});

var drawPluginOptions = {
  position: 'topright',
  draw: {
    polygon: {
      allowIntersection: false, // Restricts shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
        message: "<strong>Oh snap!<strong> you can't draw that!", // Message that will show when intersect
      },
    },
    // disable toolbar item by setting it to false
    circle: false,
    rectangle: false,
    circlemarker: false,
  },
};

// Initialise the draw control and pass it the FeatureGroup of editable layers

if (user !== 'convidado') {
  var drawControl = new L.Control.Draw(drawPluginOptions);
  map.addControl(drawControl);
} else {
  $('#search').hide();
  $('#searchI').hide();
}

var newImage = {};

var newMarker = {
  nome: '',
  desc: '',
  tipo: '',
  imagem: '',
  latlng: {},
};

var newLine = {
  nome: '',
  desc: '',
  tipo: '',
  imagem: '',
  latlngs: [],
};

var newPolygon = {
  nome: '',
  desc: '',
  tipo: '',
  imagem: '',
  latlngs: [],
};

map.on('draw:created', function (e) {
  var type = e.layerType,
    layer = e.layer;

  if (type === 'marker') {
    newMarker.latlng = layer._latlng;
    L.popup()
      .setContent(
        '<span><b>Nome do ponto</b></span><br/><input id="tipo" type="hidden" value="marker"><input id="shapeName" type="text"/><br/><br/><span><b>Descrição</b></span><br/><textarea id="shapeDesc" cols="25" rows="5"></textarea><br/><br/><span><b>Tipo</b></span><br/><select id="tipoP"><option>Santuário</option><option>Jardins</option><option>Monumentos</option></select><br/><br/><span><b>Imagem</b></span><br/><input type="file" id="imagem" accept="image/*"><br/><br/><input type="button" id="okBtn" value="Guardar" onclick="setInfo()"/>'
      )
      .setLatLng(layer._latlng)
      .openOn(map);
  } else if (type === 'polygon') {
    newPolygon.latlngs = layer._latlngs[0];
    L.popup()
      .setContent(
        '<span><b>Nome da área</b></span><br/> <input id="tipo" type="hidden" value="polygon"><input id="shapeName" type="text" /><br /><br /><span><b>Descrição</b></span><br /><textarea id="shapeDesc" cols="25" rows="5"></textarea><br /><br /><span><b>Tipo</b></span><br /><select id="tipoP"><option>Santuário</option><option>Jardins</option><option>Monumentos</option></select><br /><br /><span><b>Imagem</b></span><br /><input type="file" id="imagem" accept="image/*"><br /><br /><input type="button" id="okBtn" value="Guardar" onclick="setInfo()" />'
      )
      .setLatLng(layer._latlngs[0][0])
      .openOn(map);
  } else if (type === 'polyline') {
    newLine.latlngs = layer._latlngs;
    L.popup()
      .setContent(
        '<span><b>Nome da linha</b></span><br/> <input id="tipo" type="hidden" value="line"><input id="shapeName" type="text" /><br /><br /><span><b>Descrição</b></span><br /><textarea id="shapeDesc" cols="25" rows="5"></textarea><br /><br /><span><b>Tipo</b></span><br /><select id="tipoP"><option>Santuário</option><option>Jardins</option><option>Monumentos</option></select><br /><br /><span><b>Imagem</b></span><br /><input type="file" id="imagem" accept="image/*"><br /><br /><input type="button" id="okBtn" value="Guardar" onclick="setInfo()" />'
      )
      .setLatLng(layer._latlngs[0])
      .openOn(map);
  }
});

function setInfo() {
  var hasImage = true;
  if ($('#imagem').get(0).files.length === 0) {
    hasImage = false;
  } else {
    newImage = $('#imagem').prop('files')[0];
  }
  if ($('#tipo').val() === 'marker') {
    newMarker.nome = $('#shapeName').val();
    newMarker.desc = $('#shapeDesc').val();
    newMarker.tipo = $('#tipoP').val();
    saveMarker(hasImage);
  } else if ($('#tipo').val() === 'polygon') {
    newPolygon.nome = $('#shapeName').val();
    newPolygon.desc = $('#shapeDesc').val();
    newPolygon.tipo = $('#tipoP').val();
    savePolygon(hasImage);
  } else if ($('#tipo').val() === 'line') {
    newLine.nome = $('#shapeName').val();
    newLine.desc = $('#shapeDesc').val();
    newLine.tipo = $('#tipoP').val();
    saveLine(hasImage);
  }
  map.closePopup();
}

function saveMarker(hasImage) {
  if (!hasImage) {
    newMarker.imagem = 'default.png';
    fetch('http://localhost:5000/api/marker', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        marker: newMarker,
      }),
    });
    getData();
  } else {
    formData = new FormData();
    formData.append('imagem', newImage);
    fetch('http://localhost:5000/api/image', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((path) => {
        newMarker.imagem = path;
        fetch('http://localhost:5000/api/marker', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            marker: newMarker,
          }),
        });
        getData();
      });
  }
}

function saveLine(hasImage) {
  if (!hasImage) {
    newLine.imagem = 'default.png';
    fetch('http://localhost:5000/api/line', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        line: newLine,
      }),
    });
    getData();
  } else {
    formData = new FormData();
    formData.append('imagem', newImage);
    fetch('http://localhost:5000/api/image', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((path) => {
        newLine.imagem = path;
        fetch('http://localhost:5000/api/line', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            line: newLine,
          }),
        });
        getData();
      });
  }
}

function savePolygon(hasImage) {
  if (!hasImage) {
    newPolygon.imagem = 'images/default.png';
    fetch('http://localhost:5000/api/polygon', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        polygon: newPolygon,
      }),
    });
    getData();
  } else {
    formData = new FormData();
    formData.append('imagem', newImage);
    fetch('http://localhost:5000/api/image', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((path) => {
        newPolygon.imagem = path;
        fetch('http://localhost:5000/api/polygon', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            polygon: newPolygon,
          }),
        });
        getData();
      });
  }
}

function deleteGeo(id, path) {
  fetch('http://localhost:5000/api/delete', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
    body: JSON.stringify({
      id,
      path,
    }),
  });
  map.closePopup();
  getData();
}

function getData() {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }
  fetch('http://localhost:5000/api/data')
    .then((res) => {
      return res.json();
    })
    .then((geojson) => {
      if (geojson.features !== null) {
        geojsonLayer = L.geoJSON(geojson, {
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type === 'Point') {
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300" />
              </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300" />
              </br>
              <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            } else if (feature.geometry.type === 'Polygon') {
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              </br>
              <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            } else if (feature.geometry.type === 'LineString') {
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              </br>
              <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            }
            layer.bindPopup(pop);
          },
          pointToLayer: function (feature, latlng) {
            var iconSantuario = L.AwesomeMarkers.icon({
              icon: 'church',
              prefix: 'fa',
              markerColor: 'black',
            });

            var iconJardins = L.AwesomeMarkers.icon({
              icon: 'tree',
              prefix: 'fa',
              markerColor: 'green',
            });

            var iconMonumentos = L.AwesomeMarkers.icon({
              icon: 'landmark',
              prefix: 'fa',
              markerColor: 'orange',
            });

            switch (feature.properties.f4) {
              case 'Santuário':
                return L.marker(latlng, { icon: iconSantuario });
              case 'Jardins':
                return L.marker(latlng, { icon: iconJardins });
              case 'Monumentos':
                return L.marker(latlng, { icon: iconMonumentos });
            }
          },
          style: function (feature) {
            if (
              feature.geometry.type === 'Polygon' ||
              feature.geometry.type === 'LineString'
            ) {
              switch (feature.properties.f4) {
                case 'Santuário':
                  return { color: 'black' };
                case 'Jardins':
                  return { color: 'green' };
                case 'Monumentos':
                  return { color: 'orange' };
              }
            }
          },
          filter: function (feature, layer) {
            var tipo = feature.properties.f4;
            var geo = feature.geometry.type;

            switch (tipo) {
              case 'Santuário':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Jardins':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Monumentos':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
            }
          },
        }).addTo(map);
      }
    });
}

function getMapa() {
  if (caop === undefined) {
    fetch('http://localhost:5000/api/mapa')
      .then((res) => {
        return res.json();
      })
      .then((geojson) => {
        caop = L.geoJSON(geojson.data).addTo(map);
        getData();
      });
  }
}

function getCaop(local) {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }
  fetch('http://localhost:5000/api/caop', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      local,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((geojson) => {
      if (geojson.features !== null) {
        geojsonLayer = L.geoJSON(geojson, {
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type === 'Point') {
              var pop = L.popup().setContent(
                `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300" />
              </br>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            } else if (feature.geometry.type === 'Polygon') {
              var pop = L.popup().setContent(
                `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            } else if (feature.geometry.type === 'LineString') {
              var pop = L.popup().setContent(
                `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            }
            layer.bindPopup(pop);
          },
          pointToLayer: function (feature, latlng) {
            var iconSantuario = L.AwesomeMarkers.icon({
              icon: 'church',
              prefix: 'fa',
              markerColor: 'black',
            });

            var iconJardins = L.AwesomeMarkers.icon({
              icon: 'tree',
              prefix: 'fa',
              markerColor: 'green',
            });

            var iconMonumentos = L.AwesomeMarkers.icon({
              icon: 'landmark',
              prefix: 'fa',
              markerColor: 'orange',
            });

            switch (feature.properties.f4) {
              case 'Santuário':
                return L.marker(latlng, { icon: iconSantuario });
              case 'Jardins':
                return L.marker(latlng, { icon: iconJardins });
              case 'Monumentos':
                return L.marker(latlng, { icon: iconMonumentos });
            }
          },
          style: function (feature) {
            if (
              feature.geometry.type === 'Polygon' ||
              feature.geometry.type === 'LineString'
            ) {
              switch (feature.properties.f4) {
                case 'Santuário':
                  return { color: 'black' };
                case 'Jardins':
                  return { color: 'green' };
                case 'Monumentos':
                  return { color: 'orange' };
              }
            }
          },
          filter: function (feature, layer) {
            var tipo = feature.properties.f4;
            var geo = feature.geometry.type;

            switch (tipo) {
              case 'Santuário':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Jardins':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Monumentos':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
            }
          },
        }).addTo(map);
      }
    });
}

function getBuffer(raio) {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }
  fetch('http://localhost:5000/api/buffer', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      raio,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((geojson) => {
      buffer = L.geoJSON(geojson.buffer).addTo(map);
      if (geojson.features !== null) {
        geojsonLayer = L.geoJSON(geojson, {
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type === 'Point') {
              var pop = L.popup().setContent(
                `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300" />
              </br>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            } else if (feature.geometry.type === 'Polygon') {
              var pop = L.popup().setContent(
                `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            } else if (feature.geometry.type === 'LineString') {
              var pop = L.popup().setContent(
                `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${feature.properties.f4}</span><br/><br/>
              <img src="${feature.properties.f5}" height="200" width="300"/>
              <input type="button" id="okBtn" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
              );
            }
            layer.bindPopup(pop);
          },
          pointToLayer: function (feature, latlng) {
            var iconSantuario = L.AwesomeMarkers.icon({
              icon: 'church',
              prefix: 'fa',
              markerColor: 'black',
            });

            var iconJardins = L.AwesomeMarkers.icon({
              icon: 'tree',
              prefix: 'fa',
              markerColor: 'green',
            });

            var iconMonumentos = L.AwesomeMarkers.icon({
              icon: 'landmark',
              prefix: 'fa',
              markerColor: 'orange',
            });

            switch (feature.properties.f4) {
              case 'Santuário':
                return L.marker(latlng, { icon: iconSantuario });
              case 'Jardins':
                return L.marker(latlng, { icon: iconJardins });
              case 'Monumentos':
                return L.marker(latlng, { icon: iconMonumentos });
            }
          },
          style: function (feature) {
            if (
              feature.geometry.type === 'Polygon' ||
              feature.geometry.type === 'LineString'
            ) {
              switch (feature.properties.f4) {
                case 'Santuário':
                  return { color: 'black' };
                case 'Jardins':
                  return { color: 'green' };
                case 'Monumentos':
                  return { color: 'orange' };
              }
            }
          },
          filter: function (feature, layer) {
            var tipo = feature.properties.f4;
            var geo = feature.geometry.type;

            switch (tipo) {
              case 'Santuário':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fSantuario').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Jardins':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fJardins').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
              case 'Monumentos':
                switch (geo) {
                  case 'Point':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPontos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'Polygon':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fPoligonos').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  case 'LineString':
                    if (
                      $('#fMonumentos').is(':checked') &&
                      $('#fLinhas').is(':checked')
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                }
            }
          },
        }).addTo(map);
      }
    });
}
