const postgres = require('pg');

const connectionString = process.env.DATABASE;

const client = new postgres.Client(connectionString);

client
  .connect()
  .then(() => {
    console.log(
      `Connected to ${client.database} at ${client.host}:${client.port}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

module.exports.login = async (body) => {
  const query = `SELECT * FROM users WHERE username = '${body.username}' AND password = '${body.password}'`;

  const result = await client.query(query);
  return result.rows[0];
};

module.exports.register = async (body) => {
  const query = `INSERT INTO users(name, username, password) VALUES ('${body.name}', '${body.username}', '${body.password}')`;

  client.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports.addMarker = (marker) => {
  const query = `INSERT INTO areas(titulo, descricao, geom, tipo, imagem, tamanho_area) 
                    VALUES('${marker.nome}', '${marker.desc}', ST_GeomFromText('POINT(${marker.latlng.lng} ${marker.latlng.lat})', 4326), '${marker.tipo}', '${marker.imagem}', null)`;

  client.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports.addLine = (line) => {
  const query = `INSERT INTO areas(titulo, descricao, geom, tipo, imagem, tamanho_area)
                    VALUES('${line.nome}', 
                      '${line.desc}', 
                      ST_GeomFromText('LINESTRING(${line.latlngs[0].lng} ${line.latlngs[0].lat}, ${line.latlngs[1].lng} ${line.latlngs[1].lat})', 4326), 
                      '${line.tipo}', 
                      '${line.imagem}',
                      ST_LENGTH((ST_GeomFromText('LINESTRING(${line.latlngs[0].lng} ${line.latlngs[0].lat}, ${line.latlngs[1].lng} ${line.latlngs[1].lat})', 4326))::geography)
                      )`;

  client.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports.addPolygon = (polygon) => {
  var vertices = '';
  for (i = 0; i < polygon.latlngs.length; i++) {
    vertices += polygon.latlngs[i].lng + ' ';
    vertices += polygon.latlngs[i].lat + ', ';
    if (i === polygon.latlngs.length - 1) {
      vertices += polygon.latlngs[0].lng + ' ';
      vertices += polygon.latlngs[0].lat;
    }
  }
  const query = `INSERT INTO areas(titulo, descricao, geom, tipo, imagem, tamanho_area) 
                    VALUES('${polygon.nome}',
                     '${polygon.desc}', 
                     ST_GeometryFromText('POLYGON((${vertices}))', 4326), 
                     '${polygon.tipo}', 
                     '${polygon.imagem}',
                     ST_Area((ST_GeometryFromText('POLYGON((${vertices}))', 4326))::geography)
                     )`;
  client.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports.getData = async () => {
  const query =
    "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(areas.geom)::json As geometry, row_to_json((id, titulo, descricao, tipo, imagem, tamanho_area)) As properties FROM areas) As f) As fc";
  const result = await client.query(query);
  return result.rows[0].row_to_json;
};

module.exports.getMapa = async () => {
  const query =
    "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(caop.geom)::json As geometry, row_to_json((id, lug11desig)) As properties FROM caop) As f) As fc";
  const result = await client.query(query);
  return result.rows[0].row_to_json;
};

module.exports.getCaop = async (local) => {
  const query = `SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM(SELECT 'Feature' As type, ST_AsGeoJSON(areas.geom):: json As geometry,row_to_json((areas.id, titulo, descricao, tipo, imagem, tamanho_area)) As properties FROM caop, areas WHERE ST_Intersects(areas.geom, caop.geom) AND lower(caop.lug11desig) LIKE '%${local}%') As f) As fc`;
  const result = await client.query(query);
  return result.rows[0].row_to_json;
};

module.exports.getBuffer = async (raio) => {
  raio = raio * 0.00001;
  const query = `SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, ST_AsGeoJSON((select ST_BUFFER(geom, ${raio}) FROM areas where id = 94)):: json As buffer, array_to_json(array_agg(f)) As features FROM(SELECT 'Feature' As type, ST_AsGeoJSON(areas.geom):: json As geometry,row_to_json((id, titulo, descricao, tipo, imagem, tamanho_area)) As properties FROM areas WHERE ST_Intersects(geom, (select ST_BUFFER(geom, ${raio}) FROM areas where id = 94))) As f) As fc`;
  const result = await client.query(query);
  return result.rows[0].row_to_json;
};

module.exports.delete = (id) => {
  const query = `DELETE FROM areas WHERE id = ${id}`;
  client.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports.addCategoria = (categoria) => {
  const query = `INSERT INTO categorias(nome, cor, tipo)
    VALUES (
      '${categoria.nome}', 
      '${categoria.cor}', 
      '${categoria.tipo}'
      );`;
  client.query(query, function (err, result) {
    if (err) {
      throw err;
    } else {
      return 'success';
    }
  });
};

module.exports.getCategorias = async () => {
  const query = 'SELECT * FROM categorias';
  const result = await client.query(query);
  return result.rows;
};

module.exports.getCategoriaById = async (id) => {
  const query = 'SELECT * FROM categorias WHERE id=' + id;
  const result = await client.query(query);
  return result.rows;
};

module.exports.deleteCategoria = async (id) => {
  const query = 'DELETE FROM categorias WHERE id=' + id;
  await client.query(query, function (err, result) {
    if (err) {
      throw err;
    }
  });
};

module.exports.getAreasCategoria = async (id) => {
  const query = 'SELECT * FROM areas WHERE tipo=' + id;
  const result = await client.query(query);
  return result.rows;
};

module.exports.getAllPontos = async () => {
  const query =
    "SELECT * FROM areas WHERE tipo = (SELECT id FROM categorias WHERE tipo = 'Ponto')";
  const result = await client.query(query);
  return result.rows;
};

module.exports.getDistancia2Pontos = async (idPonto1, idPonto2) => {
  const query = `SELECT ST_Distance(
    (
      (SELECT geom FROM areas WHERE id = ${idPonto1})::geography
    ), 
    (
        (SELECT geom FROM areas WHERE id = ${idPonto2})::geography
    ));`;
  const result = await client.query(query);
  return result.rows;
};
