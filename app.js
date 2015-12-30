var oeViz = {
  svgAtt:{
    width:parseFloat(d3.select('.svgContain').style('width')),
    height:parseFloat(d3.select('.svgContain').style('height')),
    margins:{
      left:60,
      right:50,
      top:20,
      bottom:50
    }
  },
  page:{
    scales:{}
  },
  getPageComponents:function(){
    this.page.svg = d3.select(".svgContain").append("svg")
      .attr("height",this.svgAtt.height).attr("width",this.svgAtt.width);
  },
  getField:function(){
    return d3.select("select").node().value;
  },
  makeScale:function(field, data, range){
    var domain = d3.extent(data,function(d){return +d[field]});
    return d3.scale.linear().domain(domain).range(range)
  },
  makeScales:function(data){
    var fields = ["Avg. Assists","Avg. Points","Avg. Field Goals Attempted","Avg. Field Goals Made","Avg. Rebounds Offensive","Avg. Rebounds Total","Avg. Turnovers"];
    for (var i=0;i<fields.length;i++){
      var field = fields[i];
      this.page.scales[field] = this.makeScale(field,data,[this.svgAtt.height,0])
    }
    this.page.scales["Avg. Oe"] = this.makeScale(field,data,[0,this.svgAtt.width])
  },
  makeChart:function(data){
    var self = this;
    var field = this.getField();
    this.page.svg.selectAll(".player").data(data).enter().append("circle")
      .attr("transform",function(d){
        return "translate("+self.page.scales["Avg. Oe"](d["Avg. Oe"])+","+self.page.scales[field](d[field])+")"
      })
      .attr("r",6)
      .attr("fill","none")
      .attr("stroke",function(d){
        return (d["Pos. Type"]=="big")?"red":"blue";
      })
  },
  transitionChart:function(field){
    var self = this;
    this.page.svg.selectAll("circle").transition().duration(1000)
      .attr("transform",function(d){
        return "translate("+self.page.scales["Avg. Oe"](d["Avg. Oe"])+","+self.page.scales[field](d[field])+")"
      })
  },
  bindInteraction:function(){
    var self = this;
    d3.select("select").on("change",function(){
      var field = self.getField();
      self.transitionChart(field);
    })
  },
  init:function(){
    this.getPageComponents();
    var self = this;
    d3.csv("OE.csv",function(data){
      self.page.data = data;
      self.makeScales(data);
      self.makeChart(data);
      self.bindInteraction();
    })
  }
}
oeViz.init();
