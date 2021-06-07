async function getData() {
  const raw = await fetch('http://localhost:5000/api/categorias');
  const allCategorias = await raw.json();

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
          onEachFeature: async function (feature, layer) {
            // const categoria = await getCategoriaID(feature.properties.f4);
            const categoria = allCategorias.filter(
              (c) => c.id === feature.properties.f4
            );
            if (feature.geometry.type === 'Point') {
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                <img src="${feature.properties.f5}" height="200" width="300" />
                </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome do ponto</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                <img src="${feature.properties.f5}" height="200" width="300" />
                </br>
                <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            } else if (feature.geometry.type === 'Polygon') {
              const area = Math.floor(feature.properties.f6 * 100) / 100;
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                    <span><b>Area:</b></span><br/><span>${area} m2</span><br/><br/>
                    <img src="${feature.properties.f5}" height="200" width="300"/>
                </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome da área</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                    <span><b>Area:</b></span><br/><span>${area} m2</span><br/><br/>
                    <img src="${feature.properties.f5}" height="200" width="300"/>
                </br>
                <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            } else if (feature.geometry.type === 'LineString') {
              const tamanho = Math.floor(feature.properties.f6 * 100) / 100;
              if (user === 'convidado') {
                var pop = L.popup().setContent(
                  `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                    <span><b>Tamanho:</b></span><br/><span>${tamanho} m</span><br/><br/>
                    <img src="${feature.properties.f5}" height="200" width="300"/>
                </br>`
                );
              } else {
                var pop = L.popup().setContent(
                  `<span><b>Nome da linha</b></span><br/><span>${feature.properties.f2}</span><br/><br/><span><b>Descrição</b></span><br/><span>${feature.properties.f3}</span><br/><br/><span><b>Tipo</b></span><br/><span>${categoria[0].nome}</span><br/><br/>
                    <span><b>Tamanho:</b></span><br/><span>${tamanho} m</span><br/><br/>
                    <img src="${feature.properties.f5}" height="200" width="300"/>
                </br>
                <input type="button" value="Apagar" onclick="deleteGeo(${feature.properties.f1}, \'${feature.properties.f5}\')"/>`
                );
              }
            }
            layer.bindPopup(pop);
          },
          pointToLayer: function (feature, latlng) {
            const categoria = allCategorias.filter(
              (c) => c.id === feature.properties.f4
            )[0];

            return L.marker(latlng, {
              icon: L.AwesomeMarkers.icon({
                icon: 'info-circle',
                prefix: 'fa',
                markerColor: categoria.cor,
              }),
            });
          },
          style: function (feature) {
            const categoria = allCategorias.filter(
              (c) => c.id === feature.properties.f4
            )[0];
            if (
              feature.geometry.type === 'Polygon' ||
              feature.geometry.type === 'LineString'
            ) {
              return { color: categoria.cor };
            }
          },
          filter: function (feature, layer) {
            const categoria = allCategorias.filter(
              (c) => c.id === feature.properties.f4
            )[0];
            const geo = feature.geometry.type;

            switch (geo) {
              case 'Point':
                if (
                  $('#' + categoria.nome + categoria.id).is(':checked') &&
                  $('#fPontos').is(':checked')
                ) {
                  return true;
                } else {
                  return false;
                }
              case 'Polygon':
                if (
                  $('#' + categoria.nome + categoria.id).is(':checked') &&
                  $('#fPoligonos').is(':checked')
                ) {
                  return true;
                } else {
                  return false;
                }
              case 'LineString':
                if (
                  $('#' + categoria.nome + categoria.id).is(':checked') &&
                  $('#fLinhas').is(':checked')
                ) {
                  return true;
                } else {
                  return false;
                }
            }
          },
        }).addTo(map);
      }
    });
}
