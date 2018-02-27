"use strict";

$(document).ready(function() {
	var div = $("#map");
	div.css("height", Math.round(window.innerHeight) + "px");
	// luodaan kartta keskitettynä halutulle alueelle.
	let mymap = new L.map('map', {
		crs: L.TileLayer . MML .get3067Proj()
		}).setView([62.11938, 25.58246], 8);
	L.tileLayer.mml_wmts({ layer: "maastokartta"}).addTo(mymap);
	
	// luodaan jokaiselle rastille ympyrä osoittamaan rastin sijainnin.
	let rastit = data.rastit;
	for (let i in rastit) {
		let circle = L.circle (
			[rastit[i].lat, rastit[i].lon], {
				color: 'red',
				fillOpacity: 0,
				radius: 150
			}
		).addTo(mymap);
	}
	
	// luodaan joukkuelistaus oikeaan reunaan.
	luo_joukkueet();
	
	let ulJ = document.getElementById("joukkuelista");
	let ulK = document.getElementById("kartallalista");
	
	// asetetaan erilaisia eventlistenereitä sekä joukkuelistalle että karttalistalle.
	ulJ.addEventListener("dragstart", function(e){
		e.dataTransfer.setData("text/plain", e.target.id);
	});
	
	// drop-toiminnolle eventlistener, jossa suoritetaan aluksi tarkastuksia, jotta elementti
	// asettuu oikeaan kohtaan, eikä sivun rakenne mene sekaisin. Siirrettäessä joukkueen
	// kartalta oikean reunan joukkue-listaan, kartan grafiikka aloitetaan alusta ja luodaan kartta-listan
	// mukaisesti uusi grafiikka eli joukkueiden kulkemat rasti-reitit.
	ulJ.addEventListener("drop", function(e) {
		e.preventDefault();
		var data = e.dataTransfer.getData("text");
		if (e.target.localName === 'li') {
			e.target.parentNode.appendChild(document.getElementById(data)); 
		}
		else {
			e.target.appendChild(document.getElementById(data));
		}
		clearMap(mymap);
		let c = ulK.getElementsByTagName('li');
		console.log(c);
		for (let i = c.length-1; i>-1; i--) {
			piirra_rastit(c[i].id, mymap);
		}
	});
	
	ulJ.addEventListener("dragover", function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move"
	});
	
	ulK.addEventListener("dragstart", function(e){
		e.dataTransfer.setData("text/plain", e.target.id);
	});
	
	// Kartta-listalle drop-toiminnon eventlistener, jossa suoritetaan myös tarkastuksia
	// ja lisätään siirretty elementti listaan. Tässä piirretään myös joukkueiden rasti-reitit.
	ulK.addEventListener("drop", function(e) {
		e.preventDefault();
		var data = e.dataTransfer.getData("text");
		if ('li' === e.target.localName) {
			e.target.parentNode.insertBefore(document.getElementById(data), e.target.parentNode.firstChild);
		}
		else if (null === e.target.firstChild) {
			e.target.appendChild(document.getElementById(data));
		}
		else e.target.insertBefore(document.getElementById(data), e.target.firstChild);
		let c = ulK.getElementsByTagName('li');
		for (let i = c.length-1; i>-1; i--) {
			piirra_rastit(c[i].id, mymap);
		}
	});
	
	ulK.addEventListener("dragover", function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move"
	});
	
	
});

// Yksinkertainen funktio, jolla saadaan nollattua kartan grafiikka.
function clearMap(mymap) {
    for(let i in mymap._layers) {
        if(mymap._layers[i]._path != undefined) {
            try {
                mymap.removeLayer(mymap._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + mymap._layers[i]);
            }
        }
    }
}

// Funktio piirtää annetun joukkue-id:n mukaan kyseisen joukkueen rasti-reitit.
function piirra_rastit(id, mymap) {
	if (undefined === id) return;
	let joukkueet = data.joukkueet;
	let rastit = data.rastit;
	let lista_joukkue = document.getElementById(id);
	let joukkueen_nimi = lista_joukkue.textContent;
	let joukkue;
	let rastikoordinaatit = [];
	for (let i in joukkueet) {
		if (joukkueet[i].nimi.localeCompare(joukkueen_nimi) === 0) joukkue = joukkueet[i];
	}
	for (let i in joukkue.rastit) {
		for (let j in rastit) {
			if (joukkue.rastit[i].id.toString().localeCompare(rastit[j].id) === 0) {
				rastikoordinaatit.push([rastit[j].lat, rastit[j].lon]);
			}
		}
	}
	let polyline = L.polyline(rastikoordinaatit, {color: lista_joukkue.style.backgroundColor}).addTo(mymap);
	//return polyline;
}

// Funktio luo sivun oikeaan reunaan joukkue-listauksen.
function luo_joukkueet(){
	let joukkueet = data.joukkueet;
	let ulJ = document.getElementById("joukkuelista");

	for (let i in joukkueet) {
		let li = document.createElement("li");
		li.setAttribute("id", "joukkue" + i);
		let txt = document.createTextNode(joukkueet[i].nimi);
		li.appendChild(txt);
		ulJ.appendChild(li);
		li.setAttribute("style", "background-color: " + rainbow(joukkueet.length,i) + ";");
		li.setAttribute("draggable", "true");
	}
}

// Väri-funktio, jolla saadaan jokaiselle joukkueelle uniikki väri.
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}