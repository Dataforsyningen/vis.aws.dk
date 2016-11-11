$(function() {

  var fra= moment(getQueryVariable('fra'),'YYYYMMDD');
  if (!fra.isValid()) {
    alert('fra=' + getQueryVariable('fra') + ' er ikke en gyldig dato');
    return;
  }

  var til= moment(getQueryVariable('til'),'YYYYMMDD');
  if (!til.isValid()) {
    alert('til=' + getQueryVariable('til') + ' er ikke en gyldig dato');
    return;
  }
  til= til.add({days: 1});

  if (!fra.isBefore(til)) {
    alert('fra dato er senere end til dato');
    return;
  }

  proj4.defs([
    [
      'EPSG:4326',
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    [
        'EPSG:25832',
        '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs'
    ]
  ]);

  var visData= function() {
    var options= {};
    options.data= {tidspunktfra: fra.utc().toISOString(), tidspunkttil: til.utc().toISOString()};
    options.url= encode('https://dawa.aws.dk/replikering/adgangsadresser/haendelser');
    if (corssupported()) {
      options.dataType= "json";
      options.jsonp= false;
    }
    else {        
      options.dataType= "jsonp";
    }
    $.ajax(options)
    .then( function ( data ) {
      for (var i= 0; i<data.length; i++) {
        if (data[i].operation === 'update') continue;
        var wgs84= proj4('EPSG:25832','EPSG:4326', {x:data[i].data.etrs89koordinat_øst, y:data[i].data.etrs89koordinat_nord});
        //var marker= L.marker(L.latLng(wgs84.x, wgs84.y)).addTo(map); // {color: 'red', fillColor: 'red', stroke: false, fillOpacity: 1.0, radius: 5});//defaultpointstyle);
        //var marker= L.marker(L.latLng(wgs84.y, wgs84.x)).addTo(map); // {color: 'red', fillColor: 'red', stroke: false, fillOpacity: 1.0, radius: 5});//defaultpointstyle);
        var color= 'blue';
        switch (data[i].operation) {
        case 'insert':
          color= 'red';
          break;
        case 'update':
          color= 'yellow';
          break;
        case 'delete':
          color= 'black';
          break;
        }
        var marker= L.circleMarker(L.latLng(wgs84.y, wgs84.x), {color: color, fillColor: color, stroke: false, fillOpacity: 1.0, radius: 5}).addTo(map);//defaultpointstyle);
        //map.addLayer(marker);
        //map._onResize();   
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