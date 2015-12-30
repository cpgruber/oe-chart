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
    this.page.tooltip = d3.select(".tooltip");

    this.page.xAxisG = this.page.svg.append('svg:g').attr('class','xaxis')
      .attr('transform','translate(0,'+(this.svgAtt.height-this.svgAtt.margins.bottom)+')');
    this.page.yAxisG = this.page.svg.append('svg:g').attr('class','yaxis')
      .attr('transform','translate('+(this.svgAtt.margins.left)+',0)');

    this.page.xAxis = d3.svg.axis().orient('bottom');
    this.page.yAxis = d3.svg.axis().orient('left');

    this.page.xAxisLabel = this.page.svg.append('text').attr('class','axisTitle')
      .attr('transform','translate('+(this.svgAtt.width/2)+','+(this.svgAtt.height-10)+')');
    this.page.yAxisLabel = this.page.svg.append('text').attr('class','axisTitle')
      .attr('transform','translate('+(20)+','+(this.svgAtt.height/2)+')rotate(-90)')
      .attr('text-anchor','middle');
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
      this.page.scales[field] = this.makeScale(field,data,[this.svgAtt.height-this.svgAtt.margins.bottom,this.svgAtt.margins.top])
    }
    this.page.scales["Avg. Oe"] = this.makeScale("Avg. Oe",data,[this.svgAtt.margins.left,this.svgAtt.width-this.svgAtt.margins.right])
  },
  makeChart:function(data){
    var self = this;
    var field = this.getField();
    this.transitionScales(field);
    this.page.svg.selectAll(".player").data(data).enter().append("circle")
      .attr("transform",function(d){
        return "translate("+self.page.scales["Avg. Oe"](d["Avg. Oe"])+","+self.page.scales[field](d[field])+")";
      })
      .attr("r",6)
      .attr("fill-opacity",0)
      .attr("fill",function(d){
        return (d["Pos. Type"]=="big")?"red":"blue";
      })
      .attr("stroke",function(d){
        return (d["Pos. Type"]=="big")?"red":"blue";
      })
      .style("opacity",0.35)
      .attr("stroke-width",2)
      .on("mouseover",self.circleHover)
      .on("mousemove",self.circleHover)
      .on("mouseout",self.circleUnhover)
  },
  circleHover:function(d){
    var field = oeViz.getField();
    var tooltip = oeViz.page.tooltip
    tooltip.style("display","block")
      .style("top",(d3.event.pageY + 10)+"px")
      .style("left",(d3.event.pageX + 10)+"px");
    tooltip.select(".name").text(d["Player Name"]+" ("+d["Position"]+")");
    tooltip.select(".stat1").text("OE: "+d["Avg. Oe"]);
    tooltip.select(".stat2").text(field+": "+d[field]);
    d3.select(this).style("opacity",1).attr("fill-opacity",0.5);
  },
  circleUnhover:function(d){
    oeViz.page.tooltip.style("display","none")
    d3.select(this).style("opacity",0.35).attr("fill-opacity",0);
  },
  transitionScales:function(field){
    var x = this.page.scales["Avg. Oe"];
    var y = this.page.scales[field];
    var yAxis = this.page.yAxis.scale(y);
    var xAxis = this.page.xAxis.scale(x);
    this.page.yAxisG.transition().duration(500).call(yAxis);
    this.page.xAxisG.transition().duration(500).call(xAxis);
    this.page.xAxisLabel.text("Average OE");
    this.page.yAxisLabel.text(field);
  },
  transitionChart:function(field){
    var self = this;
    this.transitionScales(field)
    this.page.svg.selectAll("circle").transition().duration(1000)
      .attr("transform",function(d){
        return "translate("+self.page.scales["Avg. Oe"](d["Avg. Oe"])+","+self.page.scales[field](d[field])+")";
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
