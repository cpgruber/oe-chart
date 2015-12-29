var svg = d3.select("body").append("svg").attr("height",800).attr("width",900);
d3.csv("OE.csv",function(data){
  makeChart(data);
  d3.select("select").on("change",function(d){
    console.log(d3.select(this).node().value)
  })
})

function makeChart(data){
  var oeDomain = d3.extent(data, function(d){return +d["Avg. Oe"]})
  var oeScale = d3.scale.linear().domain(oeDomain).range([0,900]);
}
