var map;

function corssupported() {
  return "withCredentials" in (new XMLHttpRequest());
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0; i<vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
}

function encode(url) {
  return (url.indexOf('%') === -1)?encodeURI(url):url;
}

var defaultpointstyle = {
  "stroke": false,
  "husnr": false,
  "color": "red",
  "opacity": 1.0,
  "weight": 1, 
  "fill": true,
  "fillColor": 'red',
  "fillOpacity": 1.0,
  "husnr": false,
  "radius": 5
};

var defaultpolygonstyle = {
  "stroke": true,
  "color": "blue",
  "opacity": 1.0,
  "weight": 2, 
  "fill": true,
  "fillColor": 'blue',
  "fillOpacity": 0.2,
  "husnr": false, 
  "radius": 5
};

var defaultlinestyle = {
  "stroke": true,
  "color": "blue",
  "opacity": 1.0,
  "weight": 2, 
  "fill": false,
  "fillColor": 'blue',
  "fillOpacity": 0.2,
  "husnr": false, 
  "radius": 5
};

var eachFeature= function (feature, layer) {
    if ("ejerlavkode" in feature.properties && "matrikelnr" in feature.properties && !("vejnavn" in feature.properties)) {      
      layer.bindPopup("Jordstykke: " + feature.properties.ejerlavkode + " " + feature.properties.matrikelnr);
    }
    else if ("type" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.navn + " (" + feature.properties.type + ")");
    }
    else if ("kode" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.kode + " " + feature.properties.navn);
    }
     else if ("nr" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.nr + " " + feature.properties.navn);
    }
    else if ("vejnavn" in feature.properties && "husnr" in feature.properties && "etage" in feature.properties) {  
      layer.bindPopup("<a target='_blank' href='https://dawa.aws.dk/adresser/"+feature.properties.id+"'>"+feature.properties.vejnavn + " " + feature.properties.husnr + ", " + (feature.properties.supplerendebynavn?feature.properties.supplerendebynavn+", ":"") + feature.properties.postnr + " " + feature.properties.postnrnavn + "</a>");
    }
    else if ("vejnavn" in feature.properties && "husnr" in feature.properties) {  
      layer.bindPopup("<a target='_blank' href='https://dawa.aws.dk/adgangsadresser/"+feature.properties.id+"'>"+feature.properties.vejnavn + " " + feature.properties.husnr + ", " + (feature.properties.supplerendebynavn?feature.properties.supplerendebynavn+", ":"") + feature.properties.postnr + " " + feature.properties.postnrnavn + "</a>");
    }
    layer.on('contextmenu', function(e) {map.contextmenu.showAt(e.latlng)});
  }

  function pointToLayer(style) {
    return function(feature, latlng) {
      if (style.husnr) {
        return L.marker(latlng, {icon: L.divIcon({className: "labelClass", html: feature.properties.husnr})});
      }
      else {
        return L.circleMarker(latlng, style);
      }
    }
  }

  function getDefaultStyle(data) {
    var featureData= data;
    if (data.type !== 'Feature') {
      featureData= data.features[0];
    }
    var defaultstyle;
    if (featureData.geometry && featureData.geometry.type==='Point') {
      defaultstyle= defaultpointstyle;
    }
    else if (featureData.geometry && featureData.geometry.type==='MultiPolygon') {

      defaultstyle= defaultpolygonstyle; 
    }
    else {
      defaultstyle= defaultlinestyle;
    }
    return defaultstyle;
  }


function visKoordinater (e) {
  var parametre= {};
  parametre.x= e.latlng.lng; 
  parametre.y= e.latlng.lat; 
  var popup = L.popup()
    .setLatLng(e.latlng)
    .setContent('<p>Koordinater<br/>(' + parametre.x + ', ' + parametre.y + ')</p>')
    .openOn(map);
}

function visKommune (e) {
  var options= {};
  options.data= {x: e.latlng.lng, y: e.latlng.lat};
  options.url= "https://dawa.aws.dk/kommuner/reverse";
  if (corssupported()) {
    options.dataType= "json";
    options.jsonp= false;
  }
  else {        
    options.dataType= "jsonp";
  }
  $.ajax(options)
  .then( function ( kommune ) {
    var popup = L.popup()
    .setLatLng(e.latlng)
    .setContent('<p>Kommune<br/>' + kommune.kode + ' ' + kommune.navn + '</p>')
    .openOn(map);
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen kommune: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 
}

function nærmesteAdgangsadresse(e) {
  var options= {};
  options.data= {format: 'geojson', x: e.latlng.lng, y: e.latlng.lat, medtagugyldige: true};
  options.url= "https://dawa.aws.dk/adgangsadresser/reverse";
  if (corssupported()) {
    options.dataType= "json";
    options.jsonp= false;
  }
  else {        
    options.dataType= "jsonp";
  }  
  $.ajax(options)
  .then( function ( adgangsadresse ) { 
    var style=  getDefaultStyle(adgangsadresse);
    var geojsonlayer= L.geoJson(adgangsadresse, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
    geojsonlayer.addTo(map);
  //  map.fitBounds(geojsonlayer.getBounds());
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen kommune: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 
};

function hvor(e) {
  var options= {};
  options.data= {format: 'geojson', x: e.latlng.lng, y: e.latlng.lat, medtagugyldige: true};
  options.url= "https://dawa.aws.dk/adgangsadresser/reverse";
  if (corssupported()) {
    options.dataType= "json";
    options.jsonp= false;
  }
  else {        
    options.dataType= "jsonp";
  }  
  $.ajax(options)
  .then( function ( adgangsadresse ) { 
    var style=  getDefaultStyle(adgangsadresse);
    var geojsonlayer= L.geoJson(adgangsadresse, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
    geojsonlayer.addTo(map);
  //  map.fitBounds(geojsonlayer.getBounds());
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen kommune: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 
};

function centerMap (e) {
  map.panTo(e.latlng);
}
  
var visKort= function (ticket) {
  var crs = new L.Proj.CRS.TMS('EPSG:25832',
      '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', [120000, 5900000, 1000000, 6500000], {
          resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1]
      });
  map = new L.Map('map', {
      crs: crs,
      contextmenu: true,
      contextmenuWidth: 140,
      contextmenuItems: [{
        text: 'Koordinater?',
        callback: visKoordinater
      },
      {
        text: 'Nærmeste adgangsadrese?',
        callback: nærmesteAdgangsadresse
      },
      {
        text: 'Hvor?',
        callback: hvor
      },
      {
        text: 'Kommune?',
        callback: visKommune
      }, '-',{
        text: 'Centrer kort her',
        callback: centerMap
      }]     
  });

  map.options.minZoom = 2;
  map.options.maxZoom = 13;

  map.fitBounds([
    [57.751949, 15.193240],
    [54.559132, 8.074720]
  ]);

  var matrikelkort = L.tileLayer.wms('https://{s}.services.kortforsyningen.dk/service', {
    service: 'WMS',
    transparent: true,
    servicename: 'mat',
    layers: 'Centroide,MatrikelSkel,OptagetVej',
    version: '1.1.0',
    ticket: ticket,
    styles: 'sorte_centroider,sorte_skel,default',
    format: 'image/png',
    attribution: 'Geodatastyrelsen',
    continuousWorld: true,
    minZoom: 9
  });

  var postnrkort = L.tileLayer.wms('https://{s}.services.kortforsyningen.dk/service', {
    service: 'WMS',
    transparent: true,
    servicename: 'dagi',
    layers: 'postdistrikt',
    version: '1.1.0',
    ticket: ticket,
    styles: 'default',
    format: 'image/png',
    attribution: 'SDFE',
    continuousWorld: true,
    minZoom: map.options.minZoo
  });

  var kommunekort = L.tileLayer.wms('https://{s}.services.kortforsyningen.dk/service', {
    service: 'WMS',
    transparent: true,
    servicename: 'dagi',
    layers: 'kommune',
    version: '1.1.0',
    ticket: ticket,
    styles: 'default',
    format: 'image/png',
    attribution: 'SDFE',
    continuousWorld: true,
    minZoom: map.options.minZoom
  });

  var adressekort = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4/wms', {
    transparent: true,
    layers: 'adgangsadresser',
    //ticket: ticket,
    //styles: '',
    format: 'image/png',
    //attribution: "Geodatastyrelsen",
    continuousWorld: true
    //minZoom: 9
    // SLD: 'http://www.jo-informatik.dk/sld/Standard_kk.xml'
  });

  // var historisk1928 = L.tileLayer('http://kortforsyningen.kms.dk/topo20_hoeje_maalebordsblade?ignoreillegallayers=TRUE&Layer=dtk_hoeje_maalebordsblad&transparent=FALSE&REQUEST=GetTile&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}&SERVICE=WMS&VERSION=1.1.1&LAYERS=dtk_hoeje_maalebordsblade&STYLES=&FORMAT=image/png&BGCOLOR=0xFFFFFF&SRS=EPSG:25832&ticket=' + ticket, {
  //   attribution: 'Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  Styrelsen for Dataforsyning og Effektivisering',
  //   continuousWorld: true,
  //   maxZoom: map.options.maxZoom,
  //   zoom: function () {
  //       var zoom = map.getZoom();
  //       if (zoom < 10)
  //           return 'L0' + zoom;
  //       else
  //           return 'L' + zoom;
  //   }
  // });

  var ortofoto = L.tileLayer('https://{s}.services.kortforsyningen.dk/orto_foraar?ticket=' + ticket + '&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
    attribution: 'Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  <a href="http://sdfe.dk">SDFE</a>',
    continuousWorld: true,
    maxZoom: map.options.maxZoom,
    zoom: function () {
        var zoom = map.getZoom();
        if (zoom < 10)
            return 'L0' + zoom;
        else
            return 'L' + zoom;
    }
  });

  var dhmTerræn = L.tileLayer.wms('https://kortforsyningen.kms.dk/dhm?ticket='+ticket, {
    attribution: 'Geodatastyrelsen',
    layers: 'dhm_terraen_skyggekort',
    continuousWorld: true,
    maxZoom: map.options.maxZoom,
    zoom: function () {
        var zoom = map.getZoom();
        if (zoom < 10)
            return 'L0' + zoom;
        else
            return 'L' + zoom;
    }
  });

  var dhmOverflade = L.tileLayer.wms('https://kortforsyningen.kms.dk/dhm?ticket='+ticket, {
    attribution: 'Geodatastyrelsen',
    layers: 'dhm_overflade_skyggekort',
    continuousWorld: true,
    maxZoom: map.options.maxZoom,
    zoom: function () {
        var zoom = map.getZoom();
        if (zoom < 10)
            return 'L0' + zoom;
        else
            return 'L' + zoom;
    }
  });

  var skaermkort = L.tileLayer('https://{s}.services.kortforsyningen.dk/topo_skaermkort?ticket=' + ticket + '&request=GetTile&version=1.0.0&service=WMTS&Layer=dtk_skaermkort&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
    attribution: 'Data</a> fra <a href="https://dawa.aws.dk">DAWA</a> | Map data &copy;  <a href="http://sdfe.dk">SDFE</a>',
    continuousWorld: true,
    maxZoom: map.options.maxZoom,
    zoom: function () {
      var zoom = map.getZoom();
      if (zoom < 10)
        return 'L0' + zoom;
      else
        return 'L' + zoom;
    }
  }).addTo(map);

  var baselayers = {
    "Skærmkort": skaermkort,
    "Flyfoto": ortofoto,
    "Højdemodel - terræn": dhmTerræn,
    "Højdemodel - overflade": dhmOverflade
   // "Historisk 1928-1940": historisk1928
  };

  var overlays = {
    "Matrikelkort": matrikelkort,
    "Kommunekort": kommunekort,
    "Postnummerkort": postnrkort,
    "Adressekort": adressekort
  };

  L.control.layers(baselayers, overlays, {position: 'bottomleft'}).addTo(map);
  //L.control.search().addTo(map);

  map.on('baselayerchange', function (e) {
    if (e.name === 'Skærmkort') {
        matrikelkort.setParams({
            styles: 'sorte_centroider,sorte_skel,default'
        });
        postnrkort.setParams({
            styles: 'default'
        });
        kommunekort.setParams({
            styles: 'default'
        });
    } else if (e.name === 'Flyfoto') {
        matrikelkort.setParams({
            styles: 'gule_centroider,gule_skel,Gul_OptagetVej,default'
        });
        postnrkort.setParams({
            styles: 'yellow'
        });
        kommunekort.setParams({
            styles: 'yellow'
        });
    }
  });
}	

// var visOSMKort= function() {
//   map = L.map('map',{zoom: 13});
//   var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: 'Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  Styrelsen for Dataforsyning og Effektivisering'});
//   osm.addTo(map);
// }