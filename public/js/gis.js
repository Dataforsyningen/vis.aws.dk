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
    var options= {text: 'Zoom til data', callback: zoomtildata};
    map.contextmenu.addItem(options);
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  });

  function zoomtildata (e) {
    var ls= [];
    var keys= Object.keys(layers);
    for (var i= 0; i<keys.length; i++) {
      ls.push(layers[keys[i]].layer);
    }
    var layergroup= L.featureGroup(ls);     
    map.fitBounds(layergroup.getBounds());
  }

  $('#layers').dropdown();
  $("#urls").on("click", "li", function(event){
    var url= this.innerText.trim();
    $('#url').val(url);
    setStyle(layers[url].style);
  })

  $("#danwebside").on("click", function(event){
    var parser = document.createElement('a');
    parser.href = window.location.href;
    var url= "http://"+parser.host+"/advvis?lag=";
    var keys= Object.keys(layers);
    var value= "";
    for (var i= 0; i<keys.length; i++) {
      var element= absoluteURL(keys[i])+"$"+JSON.stringify(layers[keys[i]].style);
      if (i<keys.length-1) element= element+"@";
      value= value+element;
    }
    url= url+encodeURIComponent(value);
    window.open(url);
  })

  var style= defaultpointstyle;

  function setStyle(style) {
    $('#linjevises').prop('checked', style.stroke);
    $('#linjefarve').val(style.color);
    $('#linjetykkelse').val(style.weight);
    $('#linjeopacitet').val(style.opacity);
    $('#fyldvises').prop('checked', style.fill);
    $('#fyldfarve').val(style.fillColor);
    $('#fyldopacitet').val(style.fillOpacity);
    $('#husnr').prop('checked', style.husnr);
    $('#radius').val(style.radius);
  }

  function getStyle() { //skal den bruges?
    var style= {};
    style.stroke= $('#linjevises').is(':checked'); 
  }

  setStyle(style);

  $('#linjevises').on('change', function() {
    style.stroke= $('#linjevises').is(':checked');   
    var url= $('#url').val();
    layers[url].style.stroke= style.stroke;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#linjefarve').on('change', function() {
    style.color= this.value;   
    var url= $('#url').val();
    layers[url].style.color= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#linjetykkelse').on('change', function() {
    style.weight= this.value;   
    var url= $('#url').val();
    layers[url].style.weight= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#linjeopacitet').on('change', function() {
    style.opacity= this.value;   
    var url= $('#url').val();
    layers[url].style.opacity= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#fyldvises').on('change', function() {
    style.fill= $('#fyldvises').is(':checked');   
    var url= $('#url').val();
    layers[url].style.fill= style.fill;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#fyldfarve').on('change', function() {
    style.fillColor= this.value;   
    var url= $('#url').val();
    layers[url].style.fillColor= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#fyldopacitet').on('change', function() {
    style.fillOpacity= this.value;   
    var url= $('#url').val();
    layers[url].style.fillOpacity= this.value;
    layers[url].layer.setStyle(layers[url].style);
  });
  $('#husnr').on('change', function() {
    style.husnr= $('#husnr').is(':checked');   
    var url= $('#url').val();
    layers[url].style.husnr= style.husnr;
    gentegn(layers[url]);
  });
  $('#radius').on('change', function() {
    style.radius= this.value;   
    var url= $('#url').val();
    layers[url].style.radius= this.value;
    gentegn(layers[url]);
  });

  $('#tilføj').on("click", tilføj);
  $('#fjern').on("click", fjern);

  function absoluteURL(url) {
    return url.substr(0,7).toLowerCase().startsWith('http://')?url:"http://dawa.aws.dk/" + url;
  }

  function tilføj(event) {
    event.preventDefault();
    var url= $('#url').val().trim();
    if (layers[url]) return;
    var parametre= {format: 'geojson'};
    $.ajax({
        url: absoluteURL(url),
        dataType: "json",
        data: parametre
    })
    .then( function ( data ) {
      if (data.geometri || data.features && data.features.length === 0) {
        alert('Søgning gav intet resultat');
        return;
      }
      style=  getDefaultStyle(getFeature(data));
      var geojsonlayer= L.geoJson(data, {style: getDefaultStyle, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
      if (!layers[url]) {
        var info= $("#urls");
        info.append("<li><a href='#'>"+url+"</a></li>");
      };
      layers[url]= {layer: geojsonlayer, style: jQuery.extend({}, style), data: data};; 
      setStyle(style);  
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds())
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      alert(errorThrown)
    });
  };

  function getFeature(data) {
    if (data.type === 'Feature') {
      return data;
    }
    else if (data.type === 'FeatureCollection') {
      return data.features[0];
    }
    return data;
  }

  function fjern(event) {
    event.preventDefault(); 
    var url= $('#url').val();
    map.removeLayer(layers[url].layer);
    var urls= $('#urls li:contains("' + url + '")');
    urls.remove();
    delete layers[url];  
  };

  function gentegn(layer) {
    map.removeLayer(layer.layer); 
    var geojsonlayer= L.geoJson(layer.data, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
    layer.layer= geojsonlayer;
    geojsonlayer.addTo(map);
    map.fitBounds(geojsonlayer.getBounds()) 
  }
   
});