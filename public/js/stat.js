$(function() {

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); 
      this._div.innerHTML = '<h3>Adgangsadresser oprettet/nedlagt</h3>'+'<p>' + fra.format('DD.MM.YYYY')  + ' - ' + til.format('DD.MM.YYYY') + '</p>' +
        "<p>Et eksempel på brug af <a href='http://dawa.aws.dk/replikeringdok'>DAWA's replikerings API</a></p>";
      //this.update();
      return this._div;
  };

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
  var tilplus= til.clone()
  tilplus.add({days: 1});

  if (!fra.isBefore(tilplus)) {
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
    options.data= {tidspunktfra: fra.utc().toISOString(), tidspunkttil: tilplus.utc().toISOString()};
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
        var marker= L.circleMarker(L.latLng(wgs84.y, wgs84.x), {color: color, fillColor: color, stroke: false, fillOpacity: 1.0, radius: 3}).addTo(map);//defaultpointstyle);
        marker.bindPopup("<a target='_blank' href='https://dawa.aws.dk/replikering/adgangsadresser/haendelser?id="+data[i].data.id+"'>" + data[i].data.id + "'s hændelser </a>");
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
    info.addTo(map);
    visData();
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 

  
});