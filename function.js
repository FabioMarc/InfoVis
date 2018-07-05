//=====================================================================+
// File name 	: function.js
// Begin		: 21/06/2018
// Last Update	:
// Description  : InfoVis - Secondo Progetto, libreria delle funzioni.
// Author		: Fabio Marchionni & Giulio Dini
// Versione		: 1.3
//
//=====================================================================+
//******************************************************************
//Funzione utilizzata per l'ordidamento dell'array in modo crescente
//******************************************************************
function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  //const genreA = a.genre.toUpperCase();
  //const genreB = b.genre.toUpperCase();

  let comparison = 0;
  if (a.Valore > b.Valore) {
	comparison = 1;
  } else if (a.Valore < b.Valore) {
	comparison = -1;
  }
  return comparison;
}

//******************************************************************
//Funzione utilizzata per l'ordidamento dell'array in modo decrescente
//******************************************************************
function compareInverted(a, b) {
  // Use toUpperCase() to ignore character casing
  // Use toUpperCase() to ignore character casing
  //const genreA = a.genre.toUpperCase();
  //const genreB = b.genre.toUpperCase();

  let comparison = 0;
  if (a.Valore < b.Valore) {
	comparison = 1;
  } else if (a.Valore > b.Valore) {
	comparison = -1;
  }
  return comparison;
}

//******************************************************************
//Funzione che esegue il filtraggio dei dati sulla base della scelta utente.
//******************************************************************
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

//******************************************************************
//Funzione che disegna il grafico.
//******************************************************************
function updateData(filtro) {
	//var nomeFile = "dati/prova.csv";
	var nomeFile = "dati/arsial2018.csv";
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
				
				//Valore di default per caricare i dati alla prima apertura della pagina web.
				if( citta=="" && DataCalendar=="" ) {
					DataCalendar="08/01/2018";
					filtro="TEMPARIA2M_MAXG";
				}
				if(citta!="") {
					document.getElementById("calendar").value = "";
				}				
				//Filtraggio dei dati sulla base della scelta utente
				var filtered = filter(data,filtro,DataCalendar,citta);
				
				//Con i dati filtrati costruisco il menu a tendina.
				var select = d3.select('select');

				//Valorizzo il campo select con i nomi delle città distinte.
				var options = select
				  .selectAll('option')
					.data(filtered).enter()
					.append('option')
						.text(function (d) { return d.Stazione; });			
				
				var t = d3.transition()
				   .duration(500);
				   
				var svg = d3.select("svg"),
				    margin = {top: 30, right: 20, bottom: 170, left: 50},
				    width = +svg.attr("width") - margin.left - margin.right,
				    height = +svg.attr("height") - margin.top - margin.bottom;
	
				var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
			    	    y = d3.scaleLinear().rangeRound([height, 0]);
	
				// Rimuovo l'eventuale tag "g" inserito in precedenza
				d3.select("g").remove();
	
				// Inserisco il nuovo tag "g" che conterrà il grafico selezioanto.
				var g = svg.append("g")
			    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				//Gestione dell'ordinamento crescente o decrescente dei dati.
				if(citta=="") {
				if(d3.select("#myCheckbox").property("checked")) { 
						filtered.sort(compare);
					}
					else { 
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
						break;
					case "TEMPARIA2M_MING": 
						testoTitolo="Temperatura Minima";
						break;
					case "TEMPARIA2M_MEDG": 
						testoTitolo="Temperatura Media";
						break;
					case "UMARIA2M_MEDG": 
						testoTitolo="Umidita\' Media";
						break;
					case "PREC_TOTG": 
						testoTitolo="Precipitazioni";
						break;						
				}
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
				
				x.domain(filtered.map(function(filtered) {  if(citta=="") {return filtered.Stazione;} else { return filtered.DataRilevazione; }; }));
				y.domain([0, d3.max(filtered, function(filtered) { return filtered.Valore; })]);

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
				
				g.append("g")
				    .attr("class", "axis axis--y")
				    .call(d3.axisLeft(y).ticks(10, ""))
				    .append("text")
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", "0.71em")
				      .attr("text-anchor", "end")
				      .text("Titolo");
  
				//Inserisco i valori nel grafico filtrando quelli richiesti dall'utente.
				g.selectAll(".bar")
				    .data(filtered)
				    .enter().append("rect")

				  .on("mouseover", function() { tooltip.style("display", null); 
								d3.select(this).style("fill","yellow");
							      })
				  .on("mouseout", function(filtered) { 
									tooltip.style("display", "none"); 
							       		d3.select(this).style("fill",function(SerieFiltrata){ if(filtro=="TEMPARIA2M_MAXG") { 
																return "rgb(" + Math.pow(SerieFiltrata.Valore,2) +  ",0, 0)"; 
														              } 
														              else { 
																return "rgb(0, 0, " + Math.pow(SerieFiltrata.Valore,2) + ")"; 
														              }
															})
				  })
				  .on("mousemove", function(filtered) {
				    var xPosition = d3.mouse(this)[0] - 15;
				    var yPosition = d3.mouse(this)[1] - 25;
				    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				    tooltip.select("text").text(filtro + ":" + filtered.Valore);
				  })

				.transition(t)
				    .attr("class", "bar")		
				    .attr("x", function(filtered) { if(citta=="") {return x(filtered.Stazione);} else { return x(filtered.DataRilevazione); }; })						
				    .attr("y", function(filtered) { return y(filtered.Valore); })					
				    .attr("width", x.bandwidth())					
				    .attr("height", function(filtered) { return height - y(filtered.Valore); })
					.attr("fill", function(filtered) { if(filtro=="TEMPARIA2M_MAXG") { return "rgb(" + Math.pow(filtered.Valore,2) +  ",0, 0)"; } 
									   else { return "rgb(0, 0, " + Math.pow(filtered.Valore,2) + ")"; } });
				//Inserisco le etichette 
				//g.selectAll(".text")
				//	.data(filtered)
				//	.enter()
				//	.append("text")
				//	.text( function(d) { return d.Valore; })
				//	.attr("text-anchor", "middle")
				//	.attr("x", function(filtered) { return x(filtered.Stazione)+5; })
				//	.attr("y", function(filtered) { return y(filtered.Valore)+10; })								
				//	.attr("font-family", "sans-serif")
				//	.attr("font-size", "10px")
				//	.on('mouseover', function() {
				//		d3.select(this).style('fill', 'black')						
				//		d3.select(this).style("display", true) 
				//	 })
				//	.on('mouseout', function() {
				//		d3.select(this).style('fill', 'white')
				//		d3.select(this).style("display", "none") 						
				//	})	

				// Prep the tooltip bits, initial display is hidden
				var tooltip = svg.append("g")
				  .attr("class", "tooltip")
				  .style("display", "none");
				    
				tooltip.append("rect")
				  .attr("width", 30)
				  .attr("height", 20)
				  .attr("fill", "white")
				  .style("opacity", 0.5);
				
				tooltip.append("text")
				  .attr("x", 15)
				  .attr("dy", "1.2em")
				  .style("text-anchor", "middle")
				  .attr("font-size", "12px")
				  .attr("font-weight", "bold");	
								
	});

}
