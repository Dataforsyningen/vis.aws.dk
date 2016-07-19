var lag= {};


$(function() {

  var parser = document.createElement('a');
  parser.href = window.location.href;
  parser.host= 'dawa.aws.dk:80'; 
  var dataurl= parser.href;

  var værdi= getQueryVariable('lag');
  console.log('lag: %s', værdi); 

  var visData= function(dataurl) {
    var parametre= {format: 'geojson'};    
    //var parametre= {};    
    $.ajax({
        url: dataurl,
        dataType: corssupported()?"json":"jsonp",
        data: parametre
    })
    .then( function ( inddeling ) {
      var geojsonlayer= L.geoJson(inddeling, {style: getStyle, onEachFeature: eachFeature, pointToLayer: pointToLayer});
      lag[dataurl]= geojsonlayer;
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds());
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      alert(jqXHR.responseText);
    });
  }  

  var ticketurl= '/getticket';
  $.ajax({
      url: ticketurl
  })
  .then( function ( ticket ) {
    //visOSMKort(ticket);
    visKort(ticket);
    visData(værdi);
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 

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

});