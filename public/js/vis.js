var lag= {};


$(function() {

 var parser = document.createElement('a');
  parser.href = window.location.href;
  parser.host= 'dawa.aws.dk:80'; 
  var dataurl= parser.href; 

  var visData= function() {
    var parametre= {format: 'geojson'};    
    //var parametre= {};    
    $.ajax({
        url: dataurl,
        dataType: corssupported()?"json":"jsonp",
        data: parametre
    })
    .then( function ( data ) {
      var style=  getDefaultStyle(data);
      var geojsonlayer= L.geoJson(data, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
      lag[dataurl]= geojsonlayer;
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds());      
      L.control.search().addTo(map); 
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