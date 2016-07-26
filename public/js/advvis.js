$(function() {

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

  var visData= function() {
    var værdi= getQueryVariable('lag');
    værdi= decodeURIComponent(værdi);
    console.log('værdi: %s', værdi); 

    var lag= værdi.split('@');

    var promises = []
      , urls= []
      , styles= [];
    for (let i = 0; i < lag.length; i++) {
      console.log(lag[i]);
      var laget= lag[i].split('$');
      urls[i]= laget[0];
      styles[i]= laget.length>1?laget[1]:"{}";
      var parametre= {format: 'geojson'};
      var datatype=  corssupported()?"json":"jsonp";
      promises.push($.ajax({url: urls[i], dataType: datatype, data: parametre}));
    };
    $.when.apply($, promises).then(function() {
      var layers = [];
      for (let i = 0; i < promises.length; i++) {
        console.log(styles[i]);
        var style= JSON.parse(styles[i]);
        var geojsonlayer= L.geoJson(arguments[i], {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
        layers.push(geojsonlayer);
        geojsonlayer.addTo(map);
      } 
      var layergroup= L.featureGroup(layers);     
      map.fitBounds(layergroup.getBounds());
    }, function() {
      for (var i = 0; i < arguments.length; i++) {
        alert(arguments[i]);
      }
    });
  }

});