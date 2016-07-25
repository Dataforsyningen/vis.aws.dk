$(function() {

  var layers= {};

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

  $('#layers').dropdown();
  $("#urls").on("click", "li", function(event){
    var url= this.innerText.trim();
    $('#url').val(url);
    $('#linjefarve').val(layers[url].style.color);
  })

  var pointstyle = jQuery.extend({}, defaultpointstyle); 
  var linestyle = jQuery.extend({}, defaultlinestyle);
  var style= jQuery.extend(pointstyle, linestyle);

  $('#linjefarve').val(linestyle.color);
  $('#linjefarve').on('change', function() {
    linestyle.color= this.value;   
    var url= $('#url').val();
    layers[url].style.color= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });

  $('#vis').on("click", vis);
  $('#fjern').on("click", fjern);

  function vis(event) {
    event.preventDefault();
    var url= $('#url').val().trim();
    if (layers[url]) return;
    var parametre= {format: 'geojson'};
    //var parametre= {};    
    $.ajax({
        url: "http://dawa.aws.dk/" + url,
        dataType: "json",
        data: parametre
    })
    .then( function ( inddeling ) {
      if (inddeling.features.length === 0) {
        alert('Søgning gav intet resultat');
        return;
      }
      var geojsonlayer= L.geoJson(inddeling, {style: getStyle({}), onEachFeature: eachFeature, pointToLayer: pointToLayer(false)});
      if (!layers[url]) {
        var info= $("#urls");
        info.append("<li><a href='#'>"+url+"</a></li>");
      };
      layers[url]= {layer: geojsonlayer, style: style};;   
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds())
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      alert(errorThrown)
    });
  };

  function fjern(event) {
    event.preventDefault(); 
    var url= $('#url').val();
    map.removeLayer(layers[url].layer);
    var urls= $('#urls li:contains("' + url + '")');
    urls.remove();
    delete layers[url];  
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