function drawTable(){
    // for(let x of data){
    //     console.log(x.day, x.pluvio, x.value)
    // }

  var rows  = ["day", "hour", "temp", "pluvio"],
      table = d3.select('#lineChart').append('table')
                .style("border-collapse", "collapse")
                .style("border", "2px black solid");

   
    let dataArray = [];
    for(let x of data){
        delete x.date;
        dataArray.push(Object.values(x))
    }
    
  table.append("thead").append("tr")
    .selectAll("th")
    .data(rows)
    .enter().append("th")
    .text(function(d) { return d })
    .style("border", "1px black solid")
    .style("padding", "5px")
    .style("background-color", "lightgray")
    .style("font-weight", "bold")
    .style("text-transform", "uppercase");

  table.append("tbody")
    .selectAll("tr").data(dataArray)
    .enter().append("tr")
    .selectAll("td")
    .data(function(d){return d;})
    .enter().append("td")
    .style("border", "1px black solid")
    .style("padding", "5px")
    .on("mouseover", function(){
    d3.select(this).style("background-color", "powderblue");
  })
    .on("mouseout", function(){
    d3.select(this).style("background-color", "white");
  })
    .text(function(d){return d;})
    .style("font-size", "12px");
    
}