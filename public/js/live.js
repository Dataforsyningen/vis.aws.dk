$(function() {

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); 
      this._div.innerHTML = '<h3>Adgangsadresser oprettet/nedlagt</h3>'+'<p>' + fra.format()  + ' - ' + til.format() + '</p>' +
        "<p>Et eksempel på brug af <a href='https://api.dataforsyningen.dk/replikeringdok'>DAWA's replikerings API</a></p>";
      //this.update();
      return this._div;
  };

  var fra= moment().startOf('day');
  var til= moment();
  var sekvensnummer= 0;

  proj4.defs([
    [
      'EPSG:4326',
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    [
        'EPSG:25832',
        '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs'
    ]
  ]);

  var hentData= function() {
    var options= {};
    options.data= {tidspunktfra: fra.utc().toISOString(), tidspunkttil: til.utc().toISOString()};
    options.url= encode('https://api.dataforsyningen.dk/replikering/adgangsadresser/haendelser');
    if (corssupported()) {
      options.dataType= "json";
      options.jsonp= false;
    }
    else {        
      options.dataType= "jsonp";
    }
    $.ajax(options)
    .then( function ( data ) {
      visData(data,false);
    })
  } 

  var hentHændelser= function(fra, til) {
    var options= {};
    options.data= {sekvensnummerfra: fra, sekvensnummertil: til};
    options.url= encode('https://api.dataforsyningen.dk/replikering/adgangsadresser/haendelser');
    if (corssupported()) {
      options.dataType= "json";
      options.jsonp= false;
    }
    else {        
      options.dataType= "jsonp";
    }
    $.ajax(options)
    .then( function ( data ) {
      visData(data,true);
    })
  } 

  var visData= function(data, dopopup) {
    var id= null;
    for (var i= 0; i<data.length; i++) {
      if (data[i].operation === 'update' && id === data[i].data.id) continue;
      id= data[i].data.id;
      var wgs84= proj4('EPSG:25832','EPSG:4326', {x:data[i].data.etrs89koordinat_øst, y:data[i].data.etrs89koordinat_nord});
      var color= 'blue'   
        , operation= 'ukendt';

      switch (data[i].operation) {
      case 'insert':
        color= 'red';
        operation= 'oprettet';
        break;
      case 'update':
        color= 'orange';
        operation= 'ændret';
        break;
      case 'delete':
        color= 'black';
        operation= 'nedlagt';
        break;
      }
      var marker= L.circleMarker(L.latLng(wgs84.y, wgs84.x), {color: color, fillColor: color, stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(map);//defaultpointstyle);
      var popup= marker.bindPopup(L.popup().setContent("<a target='_blank' href='https://api.dataforsyningen.dk/replikering/adgangsadresser/haendelser?id="+data[i].data.id+"'>" + data[i].data.husnr +  ' ' + operation + "</a>"),{autoPan: true});
      if (dopopup) popup.openPopup();
      sekvensnummer= data[i].sekvensnummer;
    } 
  } 


  var ticketurl= '/getticket';
  $.ajax({
      url: ticketurl
  })
  .then( function ( ticket ) {
    //visOSMKort(ticket);
    visKort(ticket);
    info.addTo(map);
    hentData();
    setInterval(function () {
      var options= {};
      options.url= encode('https://api.dataforsyningen.dk/replikering/senestesekvensnummer');
      if (corssupported()) {
        options.dataType= "json";
        options.jsonp= false;
      }
      else {        
        options.dataType= "jsonp";
      }
      $.ajax(options)
      .then( function ( seneste ) {
        hentHændelser(sekvensnummer+1,seneste.sekvensnummer);
        sekvensnummer= seneste.sekvensnummer;
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        alert(jqXHR.responseText);
      });
    }, 60000);
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 

  
});