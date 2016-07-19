var lag= {};


$(function() {

  var corssupported= "withCredentials" in (new XMLHttpRequest());

  var parser = document.createElement('a');
  parser.href = window.location.href;
  parser.host= 'dawa.aws.dk:80'; 
  var dataurl= parser.href; 

  var visKort= function (ticket) {
    var crs = new L.Proj.CRS.TMS('EPSG:25832',
        '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', [120000, 5900000, 1000000, 6500000], {
            resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1]
        });
    map = new L.Map('map', {
        crs: crs
    });

    var matrikelkort = L.tileLayer.wms('http://{s}.services.kortforsyningen.dk/service', {
      service: 'WMS',
      transparent: true,
      servicename: 'mat',
      layers: 'Centroide,MatrikelSkel,OptagetVej',
      version: '1.1.0',
      ticket: ticket,
      styles: 'sorte_centroider,sorte_skel,default',
      format: 'image/png',
      attribution: 'Geodatastyrelsen',
      continuousWorld: true,
      minZoom: 9
    });

    // var adressekort = L.tileLayer.wms('http://kort.aws.dk/geoserver/aws4/wms', {
    //   service: 'WMS',
    //   transparent: true,
    //   servicename: 'mat',
    //   layers: 'aws4:adgangsadresser',
    //   version: '1.3.0',
    //   ticket: ticket,
    //   //styles: 'sorte_centroider,sorte_skel,default',
    //   format: 'image/png',
    //   //attribution: "Geodatastyrelsen",
    //   continuousWorld: true,
    //   minZoom: 9,
    //   SLD: 'http://www.jo-informatik.dk/sld/Standard_kk.xml'
    // });

    var ortofoto = L.tileLayer('http://{s}.services.kortforsyningen.dk/orto_foraar?ticket=' + ticket + '&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
      attribution: '<a href="' + dataurl + (dataurl.indexOf('?')===-1?'?':'&') + 'format=geojson">Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  Styrelsen for Dataforsyning og Effektivisering',
      continuousWorld: true,
      maxZoom: 13,
      zoom: function () {
          var zoom = map.getZoom();
          if (zoom < 10)
              return 'L0' + zoom;
          else
              return 'L' + zoom;
      }
    });

    var dhmTerræn = L.tileLayer.wms('http://kortforsyningen.kms.dk/dhm', {
      attribution: 'Geodatastyrelsen',
      layers: 'dhm_terraen_skyggekort',
      continuousWorld: true,
      maxZoom: 13,
      zoom: function () {
          var zoom = map.getZoom();
          if (zoom < 10)
              return 'L0' + zoom;
          else
              return 'L' + zoom;
      }
    });

    var dhmOverflade = L.tileLayer.wms('http://kortforsyningen.kms.dk/dhm', {
      attribution: 'Geodatastyrelsen',
      layers: 'dhm_overflade_skyggekort',
      continuousWorld: true,
      maxZoom: 13,
      zoom: function () {
          var zoom = map.getZoom();
          if (zoom < 10)
              return 'L0' + zoom;
          else
              return 'L' + zoom;
      }
    });

    var skaermkort = L.tileLayer('http://{s}.services.kortforsyningen.dk/topo_skaermkort?ticket=' + ticket + '&request=GetTile&version=1.0.0&service=WMTS&Layer=dtk_skaermkort&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
      attribution: '<a href="' + dataurl + (dataurl.indexOf('?')===-1?'?':'&') + 'format=geojson">Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  Styrelsen for Dataforsyning og Effektivisering',
      continuousWorld: true,
      maxZoom: 13,
      zoom: function () {
        var zoom = map.getZoom();
        if (zoom < 10)
          return 'L0' + zoom;
        else
          return 'L' + zoom;
      }
    }).addTo(map);

    var baselayers = {
      "Skærmkort": skaermkort,
      "Flyfoto": ortofoto,
      "Højdemodel - terræn": dhmTerræn,
      "Højdemodel - overflade": dhmOverflade
    };

    var overlays = {
      "Matrikelkort": matrikelkort,
  //    "Adressekort":adressekort
    };

    L.control.layers(baselayers, overlays).addTo(map);

    map.on('baselayerchange', function (e) {
      if (e.name === 'Skærmkort') {
          matrikelkort.setParams({
              styles: 'sorte_centroider,sorte_skel,default'
          });
      } else if (e.name === 'Flyfoto') {
          matrikelkort.setParams({
              styles: 'gule_centroider,gule_skel,Gul_OptagetVej,default'
          });
      }
    });
  }	

  var visOSMKort= function() {
    map = L.map('map',{zoom: 13});
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '<a href="' + dataurl + (dataurl.indexOf('?')===-1?'?':'&') + 'format=geojson">Data</a> fra <a href="http://dawa.aws.dk">DAWA</a> | Map data &copy;  Styrelsen for Dataforsyning og Effektivisering'});
    osm.addTo(map);
  }

  var visData= function() {
    var parametre= {format: 'geojson'};    
    //var parametre= {};    
    $.ajax({
        url: dataurl,
        dataType: corssupported?"json":"jsonp",
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
    visData();
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