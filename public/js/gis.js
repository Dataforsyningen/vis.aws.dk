$(function() {

  var layers= [];

  var ticketurl= '/getticket';
  $.ajax({
      url: ticketurl
  })
  .then( function ( ticket ) {
    //visOSMKort(ticket);
    visKort(ticket);
    map.fitBounds([
      [57.751949, 15.193240],
      [54.559132, 8.074720]
    ]);
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 


   $('#vis').on("click", vis);

  function vis(event) {
    event.preventDefault();
    var url= $('#url').val();
    var parametre= {format: 'geojson'};    
    //var parametre= {};    
    $.ajax({
        url: url,
        dataType: "json",
        data: parametre
    })
    .then( function ( inddeling ) {
      var geojsonlayer= L.geoJson(inddeling, {style: getStyle({}), onEachFeature: eachFeature, pointToLayer: pointToLayer(false)});
      layers[url]= geojsonlayer;
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds())
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      alert(errorThrown)
    });
  };

  var pointstyle = {
    "stroke": false, 
    "color": "red",
    "fillColor": 'red',
    "fillOpacity": 1.,
    "opacity": 1.0,
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
    else if ("type" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.navn + " (" + feature.properties.type + ")");
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

  function pointToLayer(husnr) {
    return function(feature, latlng) {
      if (husnr) {
        return L.marker(latlng, {icon: L.divIcon({className: "labelClass", html: feature.properties.husnr})});
      }
      else {
        return L.circleMarker(latlng, pointstyle);
      }
    }
  }

  function getStyle(style) {
    return function(featureData) {
      var defaultstyle;
      if (featureData.geometry.type==='Point') {
        defaultstyle= pointstyle;
      }
      else {
        defaultstyle= linestyle;
      }
      var keys= Object.keys(style);
      for (let i= 0; i<keys.length; i++) {
        defaultstyle[keys[i]]= style[keys[i]];
      }
      return defaultstyle;
    }
  } 
});