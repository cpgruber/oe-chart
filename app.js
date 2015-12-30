var svg = d3.select("body").append("svg").attr("height",800).attr("width",900);
d3.csv("OE.csv",function(data){
  makeChart(data);
  d3.select("select").on("change",function(d){
    var oeDomain = d3.extent(data, function(d){return +d["Avg. Oe"]})
    var oeScale = d3.scale.linear().domain(oeDomain).range([0,900]);
    transitionChart(getField(),makeYScale(data,getField()),oeScale);
  })
})

function getField(){
  return d3.select("select").node().value;
}

function makeYScale(data,field){
  var yDomain = d3.extent(data,function(d){return +d[field]});
  var yScale = d3.scale.linear().domain(yDomain).range([800,0]);
  return yScale;
}

function transitionChart(field,yScale,oeScale){
  svg.selectAll("circle").transition().duration(1000)
    .attr("transform",function(d){
      return "translate("+oeScale(d["Avg. Oe"])+","+yScale(d[field])+")";
    })
}

function makeChart(data){
  var field = getField();
  var oeDomain = d3.extent(data, function(d){return +d["Avg. Oe"]})
  var oeScale = d3.scale.linear().domain(oeDomain).range([0,900]);
  var yDomain = d3.extent(data,function(d){return +d[field]});
  var yScale = d3.scale.linear().domain(yDomain).range([800,0]);
  svg.selectAll(".player").data(data).enter().append("circle")
    .attr("transform",function(d){
      return "translate("+oeScale(d["Avg. Oe"])+","+yScale(d[field])+")"
    })
    .attr("r",6)
    .attr("fill","none")
    .attr("stroke",function(d){
      return (d["Pos. Type"]=="big")?"red":"blue";
    })
}
