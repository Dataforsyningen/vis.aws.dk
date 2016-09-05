function selected(event, data) {
  var parametre= {format: 'geojson'};    
  //var parametre= {};    
  $.ajax({
      url: data.data.href,
      dataType: corssupported()?"json":"jsonp",
      data: parametre
  })
  .then( function ( data ) {
    var style=  getDefaultStyle(data);
    var geojsonlayer= L.geoJson(data, {style: style, onEachFeature: eachFeature, pointToLayer: pointToLayer(style)});
    geojsonlayer.addTo(map);
    map.fitBounds(geojsonlayer.getBounds());
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert(jqXHR.responseText);
  });
}

L.Control.Search = L.Control.extend({
  options: {
    // topright, topleft, bottomleft, bottomright
    position: 'topright',
    placeholder: 'vejnavn husnr, postnr',
    selected: selected
  },
  initialize: function (options /*{ data: {...}  }*/) {
    // constructor
    L.Util.setOptions(this, options);
  },
  onAdd: function (map) {
    // happens after added to map
    var container = L.DomUtil.create('div', '');
    this.form = L.DomUtil.create('form', '', container);
    var group = L.DomUtil.create('div', '', this.form);
    this.input = L.DomUtil.create('input', 'searchbox', group);
    this.input.type = 'search';
    this.input.placeholder = this.options.placeholder;
    $(this.input).dawaautocomplete({
      select: this.options.selected,
      adgangsadresserOnly: true,
    });
    //this.results = L.DomUtil.create('div', 'list-group', group);
    //L.DomEvent.addListener(this.form, 'submit', this.submit, this);
    L.DomEvent.disableClickPropagation(container);
    return container;
  },
  onRemove: function (map) {
    // when removed
    L.DomEvent.removeListener(form, 'submit', this.submit, this);
  },
  submit: function(e) {
    L.DomEvent.preventDefault(e);
  }
});

L.control.search = function(id, options) {
  return new L.Control.Search(id, options);
}