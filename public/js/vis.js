var lag= {};


$(function() {

 var parser = document.createElement('a');
  parser.href = window.location.href;
  if (parser.host.indexOf('localhost') === 0) {
    parser.host= 'vis.aws.dk:80'; 
  }
  let miljø= getQueryVariable('m');
  if (!miljø) miljø= 'dawa';
  parser.host= parser.host.replace('vis',miljø); 
  var dataurl= parser.href; 

  var visData= function() {
    var options= {};
    options.data= {format: 'geojson'};
    options.url= encode(dataurl);
    if (corssupported()) {
      options.dataType= "json";
      options.jsonp= false;
    }
    else {        
      options.dataType= "jsonp";
    }
    $.ajax(options)
    .then( function ( data ) {
      if (data.type === "FeatureCollection" && data.features.length === 0) return
      var style=  getDefaultStyle(data);
      var geojsonlayer= L.geoJson(data, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
      lag[dataurl]= geojsonlayer;
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds());

      if (data.type !== 'Feature') {
        data= data.features[0];
      }
      if (data.properties.visueltcenter_x && data.properties.visueltcenter_y) {      
        var marker= L.circleMarker(L.latLng(data.properties.visueltcenter_y, data.properties.visueltcenter_x), {color: style.color, fillColor: style.color, stroke: true, fillOpacity: 1.0, radius: 2, weight: 2, opacity: 1.0}).addTo(map);
      }
           
      // L.control.search().addTo(map); 
      var zoom= map.getZoom();
      if (zoom >= 13) {
        map.setZoom(11);
      }
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
    visData();
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 

  
});