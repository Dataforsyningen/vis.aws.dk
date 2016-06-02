var map= null;
var lag= {};

$(function() {	
  
  /* map.fitBounds([
    [57.751949, 15.193240],
    [54.559132, 8.074720]
  ]);
  map._onResize(); */

  var corssupported= "withCredentials" in (new XMLHttpRequest()); 

  var pointstyle = {
      "color": "red",
      "fillColor": 'red',
      "fillOpacity": 1.,
      "opacity": 1.0,
      "stroke": false, 
      "radius": 5
  };

  var linestyle = {
      "color": "blue",
      "weight": 2,
      "fillOpacity": 0.2
  };

  var eachFeature= function (feature, layer) {
    if ("ejerlavkode" in feature.properties && "matrikelnr" in feature.properties && !("vejnavn" in feature.properties)) {      
      layer.bindPopup("Jordstykke: " + feature.properties.ejerlavkode + " " + feature.properties.matrikelnr);
    }
    else if ("kode" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.kode + " " + feature.properties.navn);
    }
     else if ("nr" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.nr + " " + feature.properties.navn);
    }
    else if ("vejnavn" in feature.properties && "husnr" in feature.properties) {  
      layer.bindPopup(feature.properties.vejnavn + " " + feature.properties.husnr + ", " + (feature.properties.supplerendebynavn?feature.properties.supplerendebynavn+", ":"") + feature.properties.postnr + " " + feature.properties.postnrnavn);
    }
  }

  var pointToLayer= function(featureData, latlng) {
    return L.circleMarker(latlng, pointstyle);
  }

  var getStyle= function(featureData) {
    var style;
    if (featureData.geometry.type==='Point') {
      style= pointstyle;
    }
    else {
      style= linestyle;
    }
    return style;
  }
  var parser = document.createElement('a');
  parser.href = window.location.href;
  if (parser.pathname !== '/') {
    parser.host= 'dawa.aws.dk:80'; 

    var url= parser.href;
    //var url= "http://dawa.aws.dk/postnumre/1117";
    //var url= "http://dawa.aws.dk/adresser?q=rødkildevej 46, 2400";
    var parametre= {format: 'geojson'};    
    //var parametre= {};    
    $.ajax({
        url: url,
        dataType: corssupported?"json":"jsonp",
        data: parametre
    })
    .then( function ( inddeling ) {
      map = L.map('map',{zoom: 13});
      var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '<a href="' + url + (url.indexOf('?')===-1?'?':'&') + 'format=geojson">Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> &copy; Styrelsen for Dataforsyning og Effektivisering | Map data &copy; OpenStreetMap contributors'});
      osm.addTo(map);
      var geojsonlayer= L.geoJson(inddeling, {style: getStyle, onEachFeature: eachFeature, pointToLayer: pointToLayer});
      lag[url]= geojsonlayer;
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds())
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      alert(jqXHR.responseText);
    });
  }

});