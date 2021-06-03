var debug_mode = false;

// API KEYS
var GrapHopperAPI = "779fdf9a-1464-4b52-99d1-6c1b5b90f699";
var MapBoxAPI =
  "pk.eyJ1IjoibGFuZHJhZSIsImEiOiJja3AxbWY4MDUxNXltMnZueDNpY2VzZHNxIn0.lwiT27Cr4FeH8nqIYjnMVg";

// Inizializza la mappa Leaflet
var milan = L.latLng(45.464664, 9.18854);
var map = new L.map("map").setView(milan, 13);

// URL template = 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
// Usare e visualizzare la mappa di OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// if (true) fa partire la mappa con dei punti predefiniti
if (debug_mode) {
  var startWayPoint = L.latLng(45.4884801, 9.200618);
  var endWayPoint = L.latLng(45.498986, 9.1960764);
  var waypoints = [startWayPoint, endWayPoint];
} else {
  var waypoints = [];
}

// Layer dei file json
var intersect_layer = L.geoJson();
var punti_layer = L.geoJson();

// li uso solo per impostare zIndex
var pane1 = map.createPane("pane1");
pane1.style.zIndex = 200;

var pane2 = map.createPane("pane2");
pane2.style.zIndex = 201;

// Impostazioni Icone
var bikeIcon = L.icon({
  iconUrl: "static/assets/bike.png",
  iconSize: [28, 28],
});

var startIcon = L.icon({
  iconUrl: "static/assets/marker_green.png",
  iconSize: [24, 56],
  iconAnchor: [13, 27],
  shadowSize: [41, 41],
});

var endIcon = L.icon({
  iconUrl: "static/assets/marker_red.png",
  iconSize: [24, 56],
  iconAnchor: [13, 27],
  shadowSize: [41, 41],
});

var midIcon = L.icon({
  iconUrl: "static/assets/marker_grey.png",
  iconSize: [24, 56],
  iconAnchor: [13, 27],
  shadowSize: [41, 41],
});

// Aspetto del percorso
var lineOptions = {
  styles: [
    { pane: "pane1", color: "red", opacity: 0.8, weight: 8 },
    { pane: "pane1", color: "white", opacity: 0.3, weight: 6 },
  ],
};

// Aspetto del percorso alternativo
var altLineOptions = {
  styles: [
    { pane: "pane1", color: "#40007d", opacity: 0.4, weight: 8 },
    {
      pane: "pane1",
      color: "black",
      opacity: 0.5,
      weight: 2,
      dashArray: "2,4",
    },
    { pane: "pane1", color: "white", opacity: 0.3, weight: 6 },
  ],
};

// Aspetto delle piste ciclabili
var cycleLineOptions = {
  pane: "pane2",
  color: "#ffca14",
  opacity: 1,
  weight: 9,
};

// Aspetto dei punti delle piste cliclabili
var geojsonMarkerOptions = {
  icon: bikeIcon,
};

// Per modificare il programma del percorso
var myPlan = L.Routing.plan(waypoints, {
  createMarker: function (i, wp, n) {
    // i = index
    // wp = waypoint di i
    // n = numero totale dei waypoints
    var marker_icon = null;
    clearMap();
    if (i == 0) {
      // Questo è il primo marker, che indica il punto di partenza
      marker_icon = startIcon;
      map.flyTo(wp.latLng, 16);
    } else if (i == n - 1) {
      // Questo è l'ultimo indicatore che indica la destinazione
      marker_icon = endIcon;
      map.flyTo(wp.latLng, 16);
    } else {
      // Via points
      marker_icon = midIcon;
    }
    return L.marker(wp.latLng, { icon: marker_icon, draggable: true });
  },
  geocoder: L.Control.Geocoder.nominatim(),
  addWaypoints: true,
  routeWhileDragging: false,
  reverseWaypoints: true,
});

// Lingua di default
var selected_language = "en";

// Classe principale di Leaflet Routing Machine
var myRouting = L.Routing.control({
  plan: myPlan,
  waypointMode: "snap",
  showAlternatives: true,
  router: L.Routing.mapbox(MapBoxAPI, {
    profile: "mapbox/cycling",
    steps: true,
    language: selected_language,
  }),
  lineOptions: lineOptions,
  altLineOptions: altLineOptions,
}).addTo(map);

// Scatena questo codice dopo aver trovato un percorso
myRouting.on("routeselected", function (e) {
  // loading screen e no cycle path screen
  var loading = document.getElementById("loading");
  var no_bike = document.getElementById("no_bike");
  loading.style.display = "block";
  no_bike.style.display = "none";

  clearMap();

  // if (true) faccio vedere gli Istruzioni
  if (collapsed) {
    collapse();
  }

  // Imposta i confini della mappa (zoom out o in per fare vedere tutti i marker)
  var latLngs = [];
  for (i = 0; i < e.route.waypoints.length; i++) {
    latLngs.push(e.route.waypoints[i].latLng);
  }
  map.flyToBounds(L.latLngBounds(latLngs), { maxZoom: 16 });

  // coordinate del percorso (restituisce un array di Point(latlong))
  var coord = e.route.coordinates;

  var json_url = get_url(getCoordGeoJson(coord), "text.json", "text/plain");

  // Eseguire una richiesta HTTP asincrona di tipo POST.
  // Manda il file json a main.py per poterlo manipulare con gpd.py (geopandas)
  $.ajax({
    type: "POST",
    url: "/_get_post_json/",
    contentType: "application/json",
    data: get_json(json_url),
    dataType: "json",
    success: function (response) {
      // se la richiesta POST e la risposta di main.py sono andati a buon fine
      // caricamento dei file GeoJSON
      $.getJSON("static/intersect.json", function (data) {
        intersect_layer = L.geoJson(data, cycleLineOptions).addTo(map);
        loading.style.display = "none";
      });
      $.getJSON("static/punti_intersect.json", function (data) {
        punti_layer = L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
            return L.marker(latlng, geojsonMarkerOptions).bindPopup(
              feature.properties.anagrafica
            );
          },
        }).addTo(map);
      });
      console.log(response);
    },
    error: function (err) {
      // Nessuna pista ciclabile trovata
      loading.style.display = "none";
      no_bike.style.display = "block";
      console.log(err);
    },
  });
});

// codice per nascondere e far vedere gli istruzioni
var collapsed = false;
var styleElem = document.head.appendChild(document.createElement("style"));
collapse();

function collapse() {
  var elements = document.getElementsByClassName(
    "leaflet-routing-alternatives-container"
  );
  if (!collapsed) {
    Array.from(elements).forEach(function (element) {
      element.style.marginRight = "-400px";
      element.style.transition = "0.5s";
    });

    styleElem.innerHTML =
      ".leaflet-routing-collapse-btn:after {content: '\\2039';}";

    collapsed = true;
  } else {
    Array.from(elements).forEach(function (element) {
      element.style.marginRight = "0px";
      element.style.transition = "0.5s";
    });

    styleElem.innerHTML =
      ".leaflet-routing-collapse-btn:after {content: '\\203a';}";

    collapsed = false;
  }
}

// Prendere il contenitore da leaflet per poterlo manipulare
var myRoutingContainer = myRouting.getContainer();
var zoombar = map.zoomControl.getContainer();

// Prendere il parent node desiderato
var a = document.getElementById("controlContainer");
var b = document.getElementById("zoombar");

setParent(myRoutingContainer, a);
setParent(zoombar, b);

// Infine aggiungi il contenitore al nuovo parent node.
function setParent(el, newParent) {
  newParent.appendChild(el);
}

// Creare il bottone per cambiare lingua
var languageSel = L.DomUtil.create(
  "select",
  "leaflet-routing-select-language",
  myRoutingContainer
);
languageSel.id = "language-selector";
languageSel.setAttribute("onchange", "changeLanguage()");
languages = [
  { label: "Deutsch", value: "de" },
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
  { label: "Pусский", value: "ru" },
  { label: "한국어", value: "ko" },
  { label: "中文", value: "zh-Hans" },
];
for (var profile = 0, len = languages.length; profile < len; profile++) {
  var languageOption;
  languageOption = L.DomUtil.create(
    "option",
    "leaflet-routing-select-language-option",
    languageSel
  );
  languageOption.setAttribute("value", "" + languages[profile].value);
  if (languages[profile].value == "en") {
    languageOption.setAttribute("selected", "");
  }
  languageOption.innerHTML = languages[profile].label;
}

// Aggiungi un waypoint quando clicchi sulla mappa
map.on("click", function (e) {
  addWaypoint(e.latlng);
});

function addWaypoint(waypoint) {
  var length = myRouting.getWaypoints().filter(function (pnt) {
    return pnt.latLng;
  });
  length = length.length;
  if (!length) {
    myRouting.spliceWaypoints(0, 1, waypoint);
  } else {
    if (length === 1) length = length + 1;
    myRouting.spliceWaypoints(length - 1, 1, waypoint);
  }
}

function changeLanguage() {
  selected_language = document.getElementById("language-selector").value;
  myRouting.getRouter().options.language = selected_language;
  myRouting.route();
}

function clearMap() {
  map.removeLayer(intersect_layer);
  map.removeLayer(punti_layer);
}

// Creazioen di un url per il file json (simple server)
function get_url(content, fileName, contentType) {
  var jsonData = JSON.stringify(content);
  var a = document.createElement("a");
  var file = new Blob([jsonData], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  return a.href;
}

// get contenuti di quel URL usando XMLHttpRequest()
function get_json(yourUrl) {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", yourUrl, false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

// Creazione di un file GeoJson da un array di punti
function getCoordGeoJson(coord) {
  var CoordPts = {
    type: "FeatureCollection",
    features: [],
  };
  for (var i = 0; i < coord.length; ++i) {
    var g = {
      type: "Point",
      coordinates: [coord[i].lng, coord[i].lat],
    };
    CoordPts.features.push({
      type: "Feature",
      geometry: g,
    });
  }
  return CoordPts;
}
