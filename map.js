navigator.geolocation.getCurrentPosition(function (position) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibmFrYXphd2FrZW4xIiwiYSI6ImNrcDZubDlmODAxZzkydm1yZXhsN21pY3cifQ.TouoIsHyFN1XSxo2vtzuag";
  new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [position.coords.longitude, position.coords.latitude],
    zoom: 18,
  });
});
