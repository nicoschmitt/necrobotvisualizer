
var Map = function(parentDiv) {

    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { });

    this.layerPokestops = new L.LayerGroup();
    this.layerCatches = new L.LayerGroup();
    this.layerPath = new L.LayerGroup();

    this.map = L.map(parentDiv, {
        layers: [osm, this.layerPath, this.layerCatches, this.layerPokestops]
    });
    
    var baseLayers = {
        "OpenStreetMap": osm
    };
    var overlays = {
            "Path": this.layerPath,
			"Pokestops": this.layerPokestops,
			"Catches": this.layerCatches
			
		};

    L.control.layers(baseLayers, overlays).addTo(this.map);

    this.path = null;

    this.steps = [];
    this.catches = [];
    this.pokestops = [];
    this.availablePokestops = [];
};

Map.prototype.saveContext = function() {
    sessionStorage.setItem("available", true);
    sessionStorage.setItem("steps", JSON.stringify(this.steps));
    sessionStorage.setItem("catches", JSON.stringify(this.catches));
    sessionStorage.setItem("pokestops", JSON.stringify(this.pokestops));
}

Map.prototype.loadContext = function() {
    if (sessionStorage.getItem("available")) {
        try {
            console.log("Load data from storage to restore session");

            this.steps = JSON.parse(sessionStorage.getItem("steps")) || [];
            this.catches = JSON.parse(sessionStorage.getItem("catches")) || [];
            this.pokestops = JSON.parse(sessionStorage.getItem("pokestops")) || [];

            this.initPath();

            for (var i = 0; i < this.catches.length; i++) {
                var pt = this.catches[i];
                var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [45, 45]});
                L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map).bindPopup(`${pt.name} (lvl ${pt.lvl})`);
            }
            for (var i = 0; i < this.pokestop.length; i++) {
                var pt = this.pokestop[i];
                var icon = L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]});
                L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map).bindPopup(pt.name);
            }
        } catch(err) {}
    }
}

Map.prototype.initPath = function() {
    if (this.path != null) return true;
    if (this.steps.length < 2) return false;

    console.log("Init path and markers.");
    $(".loading").hide();

    this.map.setView([this.steps[0].lat, this.steps[0].lng], 16);

    var pts = Array.from(this.steps, pt => L.latLng(pt.lat, pt.lng));
    this.path = L.polyline(pts, { color: 'red' }).addTo(this.layerPath);

    var last = this.steps.pop();
    this.me = L.marker([last.lat, last.lng]).addTo(this.map).bindPopup(`${last.lat},${last.lng}`);

    return true;
}

Map.prototype.addToPath = function(pt) {
    if (this.initPath()) {
        var latLng = L.latLng(pt.lat, pt.lng);
        this.path.addLatLng(latLng);
        this.me.setLatLng(latLng).getPopup().setContent(`${pt.lat},${pt.lng}`)
        this.map.panTo(latLng);
    }
    this.steps.push(pt);
}

Map.prototype.addCatch = function(pt) {
    if (!pt.lat) {
        if (this.steps.length > 0) {
            var pos = this.steps.pop();
            pt.lat = pos.lat;
            pt.lng = pos.lng;
        } else {
            // no position to pin to, abord
            return;
        }
    }

    var pkm = `${pt.name} (lvl ${pt.lvl})`;
    console.log("Catch " + pkm);

    this.catches.push(pt);

    var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [40, 40]});
    L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.layerCatches).bindPopup(pkm);

}

Map.prototype.addVisitedPokestop = function(pt) {
    if (!pt.lat) return;

    console.log("Pokestop.");

    this.pokestops.push(pt);

    var ps = this.availablePokestops.find(ps => ps.id == pt.id);
    if (ps) {
        ps.marker.setIcon(L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]}));
        ps.marker.bindPopup(pt.name);
    } else {
        var icon = L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]});
        L.marker([pt.lat, pt.lng], {icon: icon}).bindPopup(pt.name).addTo(this.layerPokestops);
    }
}

Map.prototype.addPokestops = function(forts) {
    for(var i = 0; i < forts.length; i++) {
        var pt = forts[i];
        var ps = this.availablePokestops.find(ps => ps.id == pt.id);
        if (!ps) {
            var icon = L.icon({ iconUrl: `./assets/img/pokestop_available.png`, iconSize: [30, 50]});
            pt.marker = L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.layerPokestops);        
            this.availablePokestops.push(pt);
        }
    }
}

Map.prototype.displayPokemonList = function(all) {
    console.log("Pokemon list");
    var div = $(".inventory .data")
    div.html("");
    all.forEach(function(element) {
        var name = element.realname.toLowerCase();
        name = name.replace("♀", "-f");
        name = name.replace("♂", "-m");
        div.append(`
            <div class="pokemon">
                <span>CP: ${element.cp}</span>
                <span class="imgspan"><img src="./assets/icons/${element.id}.png" /></span>
                <span>${element.name}</span>
            </div>
        `);
    });
    $(".inventory").show();
}