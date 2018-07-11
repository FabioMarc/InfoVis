//=====================================================================+
// File name 	: function.js
// Begin	: 21/06/2018
// Last Update	: 08/07/2018
// Description  : InfoVis - Secondo Progetto, libreria delle funzioni.
// Author	: Fabio Marchionni & Giulio Dini
// Versione	: 1.6
//
//=====================================================================+

//Variabili globali
var globalFiltro;
var annoSerieStorica=2018;



function settaNomeFile() {
	annoSerieStorica = document.getElementById('anno').value;
	//Ridisegno il grafico a fronte del cambiamento sulla data.
	updateData(globalFiltro);
}


//****************************************************************************************
//Funzione utilizzata per l'ordidamento dell'array in modo crescente
//****************************************************************************************
function compare(a, b) {

  let comparison = 0;
  if (a.Valore > b.Valore) {
	comparison = 1;
  } else if (a.Valore < b.Valore) {
	comparison = -1;
  }
  return comparison;
}

//****************************************************************************************
//Funzione utilizzata per l'ordidamento dell'array in modo decrescente
//****************************************************************************************
function compareInverted(a, b) {

  let comparison = 0;
  if (a.Valore < b.Valore) {
	comparison = 1;
  } else if (a.Valore > b.Valore) {
	comparison = -1;
  }
  return comparison;
}

//****************************************************************************************
//Funzione che esegue il filtraggio dei dati sulla base della scelta utente.
//****************************************************************************************
function filter(data,filtro,DataCalendar,citta) {
	var filtered=[];
	if(citta=="") { 
		for (i=0; i<data.length; i++) {
			if(data[i].Grandezza==filtro && data[i].DataRilevazione == DataCalendar) {
				filtered.push(data[i]);
			}
		}
	}
	else {
		for (i=0; i<data.length; i++) {
			if(data[i].Grandezza==filtro && data[i].Stazione == citta) {
				filtered.push(data[i]);
			}
		}	
	}
	
	return filtered;
}

//****************************************************************************************
//Funzione che inserisce i titoli negli assi cartesiani.
//****************************************************************************************
function inseriscriTitoloAssi(g,citta,etichettaAsseY) {

			// label asse x
			if(citta!="") {
				g.append("text")
				        .attr("x", 600 )
				        .attr("y",  400 )
				        .style("text-anchor", "middle")
				        .text("Anno "+annoSerieStorica);
			}
			else {
				g.append("text")
				        .attr("x", 600 )
				        .attr("y",  460 )
				        .style("text-anchor", "middle")
				        .text("Citta'");			
			}

			// label asse y
			g.append("text")
			      .attr("transform", "rotate(-90)")
			      .attr("y", -55)
			      .attr("x",0 - (200))
			      .attr("dy", "1em")
			      .style("text-anchor", "middle")
			      .text(etichettaAsseY);  

}

//****************************************************************************************
//Funzione che inizializza il menu a tendina.
//****************************************************************************************
function init() {
	var nomeFile = "dati/arsial" + annoSerieStorica + ".csv";

	d3.dsv(";", nomeFile, function(d) {
		  return {
		    Stazione: d.Stazione,
		    Grandezza: d.Grandezza,
		    DataRilevazione: d.DataRilevazione.substring(0,10),
		    Valore: +d.Valore,
		    IndiceValidita: d.IndiceValidita
		  };
	}).then(function(data) {
			//Filtraggio dei dati sulla base della scelta utente
			var filtered = filter(data,"TEMPARIA2M_MAXG","08/01/2018","");

			//Con i dati filtrati costruisco il menu a tendina.
			var select = d3.select('#citta');

			//Valorizzo il campo select con i nomi delle città distinte.
			var options = select
				.selectAll('option')
				.data(filtered).enter()
				.append('option')
					.text(function (d) { return d.Stazione; })
					.attr("value",function(d){return d.Stazione;});	
	
	})
}


//****************************************************************************************
// Funzione utilizzata per spostare in avandi o indietro la data.
//****************************************************************************************
function changeDate(change) {
	//Recupero la data inserita dall'utente.
	var DataCalendar = document.getElementById("calendar").value;

	if(DataCalendar=="") { 
		alert("Valorizzare il campo data.");
		return; //arresto l'esecuzione della funzione.
	}
	//Recupero la data inserita dall'utente.
	var DataImpostata = document.getElementById("calendar").value;
	var datasplit = DataImpostata.split("/");
	var nextDay = new Date(datasplit[2],(datasplit[1]-1),datasplit[0]);
	
	if(change=="next") {
		nextDay.setDate(nextDay.getDate()+1);
	}
	else if(change=="prev") {
		nextDay.setDate(nextDay.getDate()-1);
	}
	var gg, mm, aaaa;
	gg = nextDay.getDate() + "/";
	mm = nextDay.getMonth() + 1 + "/";
	aaaa = nextDay.getFullYear();

	if(parseInt(gg) <= 9) { gg = "0"+gg;}
	if(parseInt(mm) <= 9) { mm = "0"+mm;}

	//Aggiorno il campo data nella form.
	document.getElementById("calendar").value=gg + mm + aaaa;

	//Ridisegno il grafico a fronte del cambiamento sulla data.
	updateData(globalFiltro);
}


//****************************************************************************************
//Funzione che aggiorna i dati e disegna il grafico.
//****************************************************************************************
function updateData(filtro) {

	globalFiltro=filtro;

	var nomeFile = "dati/arsial" + annoSerieStorica + ".csv";
	d3.dsv(";", nomeFile, function(d) {
		  return {
		    Stazione: d.Stazione,
		    Grandezza: d.Grandezza,
		    DataRilevazione: d.DataRilevazione.substring(0,10),
		    Valore: +d.Valore,
		    IndiceValidita: d.IndiceValidita
		  };
	}).then(function(data) {

			//Recupero la data inserita dall'utente.
			var DataCalendar = document.getElementById("calendar").value;
			
			//Recupero l'eventuale filtro richiesto dall'utente sul nome città.
			var citta =  document.getElementById("citta").value;
			
			if(citta=="" && DataCalendar=="") { 
	    		alert("Valorizzare il campo data o il campo citta'.");
				return; //arresto l'esecuzione della funzione.
			}
			//Filtraggio dei dati sulla base della scelta utente
			var filtered = filter(data,filtro,DataCalendar,citta);

			var t = d3.transition()
			   .duration(200);
			   
			var svg = d3.select("svg"),
			    margin = {top: 30, right: 20, bottom: 170, left: 100},
			    width = +svg.attr("width") - margin.left - margin.right,
			    height = +svg.attr("height") - margin.top - margin.bottom;
	

			// Rimuovo l'eventuale tag "g" inserito in precedenza
			d3.select("g").remove();
			d3.select("g").remove();
			
			// Inserisco il nuovo tag "g" che conterrà il grafico selezioanto.
			var g = svg.append("g")
		    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				//Gestione dell'ordinamento crescente o decrescente dei dati.
			if(citta=="") {
				if(d3.select("#myCheckbox").property("checked")) { 
						filtered.sort(compare);
				}else { 
					filtered.sort(compareInverted); 
				}
			}
			
			var body = d3.select("body");
				
			//Array di appoggio conenente soltanto il campo Valore del file.
			var serieTMax = new Array();
			
			for (var i=0; i<filtered.length; i++) {  
				if(filtered[i].Grandezza == filtro && filtered[i].DataRilevazione == DataCalendar) {
					serieTMax.push(filtered[i].Valore);
				}
			} 


			//Titolo del grafico funzione del filtro impostato dall'utente
			var testoTitolo="";
			switch(filtro) {
				case "TEMPARIA2M_MAXG": 
					testoTitolo="Temperatura Massima";
					etichettaAsseY ="Temperatura (C)";
					break;
				case "TEMPARIA2M_MING": 
					testoTitolo="Temperatura Minima";
					etichettaAsseY ="Temperatura (C)";
					break;
				case "TEMPARIA2M_MEDG": 
					testoTitolo="Temperatura Media";
					etichettaAsseY ="Temperatura (C)";
					break;
				case "UMARIA2M_MEDG": 
					testoTitolo="Umidita\' media";
					etichettaAsseY ="Umidita' relativa";
					break;
				case "PREC_TOTG": 
					testoTitolo="Precipitazioni";
					etichettaAsseY ="mm";
					break;						
			}
			
			//Inserimento del Titolo nel grafico.
			if(DataCalendar!="") {			
				g.append("text")
				.attr("x", (width / 2))             
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")  
					.style("font-size", "20px") 
					.text(DataCalendar + " - " + testoTitolo);
				}
			else {
				g.append("text")
					.attr("x", (width / 2))             
					.attr("y", 0 - (margin.top / 2))
					.attr("text-anchor", "middle")  
					.style("font-size", "20px") 
					.text(citta + " - " + testoTitolo);					
			}

			var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
		    
			var y = d3.scaleLinear().rangeRound([height, 0]);
			
			x.domain(filtered.map(function(filtered) {  if(citta=="") {return filtered.Stazione;} else { return filtered.DataRilevazione; }; }));
			
			if(citta=="" || filtro=="UMARIA2M_MEDG" || filtro=="TEMPARIA2M_MAXG") { 
				y.domain([0, d3.max(filtered, function(filtered) { return filtered.Valore; }) ]);
			}
			else {
				y.domain(d3.extent(filtered, function(data) {
					return data.Valore;
				})).nice();			
			}
			if(citta=="") {
				g.append("g")
			        .attr("class", "axis axis--x")
			        .attr("transform", "translate(0," + height + ")")
			        .call(d3.axisBottom(x))
			        .selectAll("text")	
			      	.style("text-anchor", "end")
			        .attr("dx", "-.8em")
			        .attr("dy", ".15em")
			        .attr("transform", function(d) {
				        	return "rotate(-65)" 
				        });
			}

			g.append("g")
			    .attr("class", "axis axis--y")
			    .call(d3.axisLeft(y).ticks(10, ""))
			    .append("text")
			      .attr("transform", "rotate(-90)")
			      .attr("y", 6)
			      .attr("dy", "0.71em")
			      .attr("text-anchor", "end")
			      .text("Titolo");

			//Inserisco il Titolo all'asse X in funzione della ricerca richiesta dall'utente.
			inseriscriTitoloAssi(g,citta,etichettaAsseY);
 
			//Inserisco i valori nel grafico filtrando quelli richiesti dall'utente.
			g.selectAll(".bar")
			    .data(filtered)
			    .enter().append("rect")
				.on("mouseover", function() {tooltip.style("display", null); 
						d3.select(this).style("fill","yellow");})
				.on("mouseout", function(filtered) {tooltip.style("display", "none"); 
						d3.select(this).style("fill",function(SerieFiltrata){
									if(filtro=="TEMPARIA2M_MAXG") {return "rgb(" + Math.pow(SerieFiltrata.Valore,2) +  ",0, 0)"; 
									}else{return "rgb(0, 0, " + Math.pow(SerieFiltrata.Valore,2) + ")";}
						})
				})
			  .on("mousemove", function(filtered) {
				var xPosition = d3.mouse(this)[0] - 15;
				var yPosition = d3.mouse(this)[1] - 25;
				tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				var txt="";
				if(citta==""){
					txt=filtered.Stazione+": "+filtered.Valore;
				}else{
					txt=filtered.DataRilevazione+": "+filtered.Valore;
				}
				
				if(filtro=="UMARIA2M_MEDG"||filtro=="PREC_TOTG"){
					txt=txt+"%";
				}else{
					txt=txt+"°C";
				}
			    	tooltip.select("text").text(txt);

			  })
			  

			.transition(t)
			    .attr("class", "bar")		
			    .attr("x", function(filtered) { if(citta=="") {return x(filtered.Stazione);} else { return x(filtered.DataRilevazione); }; })						
				.attr("y", function(filtered) {
					if(citta!="" && filtro!="UMARIA2M_MEDG") {
						if (filtered.Valore > 0){
							return y(filtered.Valore);
						} else {
							return y(0);
						}
					}
					else return y(filtered.Valore);
						
				})				
				.attr("width", x.bandwidth())					
				.attr("height", function(filtered) { 
					if(citta!="" && filtro!="UMARIA2M_MEDG") {	
						return Math.abs(y(filtered.Valore) - y(0)); 
					}
					else {
						return height - y(filtered.Valore);
					}
				})
				.attr("fill", function(filtered) { if(filtro=="TEMPARIA2M_MAXG") { return "rgb(" + Math.pow(filtered.Valore,2) +  ",0, 0)"; } 
								   else { return "rgb(0, 0, " + Math.pow(filtered.Valore,2) + ")"; } });
				
				
			//Dichiarazione del tooltip per la rappresentazione dei valori in mouseover
			var tooltip = svg.append("g")
				.attr("class", "tooltip")
				.style("display", "none");
				    
			tooltip.append("rect")
				.attr("x", -90)
				.attr("width",280)
				.attr("height", 20)
				.attr("fill", "white")
				.style("opacity", 0.5);
				
			tooltip.append("text")
				.attr("x", 50)
				.attr("dy", "1.0em")
				.style("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");	
	});
}
