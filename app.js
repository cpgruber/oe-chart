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
    this.page.gridlines = this.page.svg.append("g").attr("class","grid");
    this.page.tooltip = d3.select(".tooltip");

    this.page.xAxisG = this.page.svg.append('svg:g').attr('class','xaxis')
      .attr('transform','translate(0,'+(this.svgAtt.height-this.svgAtt.margins.bottom)+')');
    this.page.yAxisG = this.page.svg.append('svg:g').attr('class','yaxis')
      .attr('transform','translate('+(this.svgAtt.margins.left)+',0)');

    this.page.xAxis = d3.svg.axis().orient('bottom');
    this.page.yAxis = d3.svg.axis().orient('left');

    this.page.xAxisLabel = this.page.svg.append('text').attr('class','axisTitle')
      .attr('transform','translate('+(this.svgAtt.width/2)+','+(this.svgAtt.height-10)+')')
      .attr('text-anchor','middle');
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
  makeGrid:function(){
    var self = this;
    var field = this.getField();
    var yGrid = this.page.gridlines.append("g").attr("class","y-grid");
    var xGrid = this.page.gridlines.append("g").attr("class","x-grid");
    var yTicks = this.page.scales[field].ticks();
    var xTicks = this.page.scales["Avg. Oe"].ticks();
    xGrid.selectAll("line").data(xTicks).enter().append("line")
      .attr("stroke","black")
      .attr("stroke-width",0.2)
      .attr("x1", function(d){return self.page.scales["Avg. Oe"](d)})
      .attr("x2", function(d){return self.page.scales["Avg. Oe"](d)})
      .attr("y1", self.svgAtt.margins.top)
      .attr("y2", self.svgAtt.height-self.svgAtt.margins.bottom);

    yGrid.selectAll("line").data(yTicks).enter().append("line")
      .attr("stroke","black")
      .attr("stroke-width",0.2)
      .attr("y1", function(d){return self.page.scales[field](d)})
      .attr("y2", function(d){return self.page.scales[field](d)})
      .attr("x1", self.svgAtt.margins.left)
      .attr("x2", self.svgAtt.width-self.svgAtt.margins.right)
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
    var tooltip = oeViz.page.tooltip;

    if (d3.event.offsetX > oeViz.svgAtt.width/2){
      var tL = "auto";
      var tR = (oeViz.svgAtt.width - d3.event.offsetX + 10)+"px";
    }else{
      var tL = (d3.event.offsetX + 10)+"px";
      var tR = "auto";
    }
    if (d3.event.offsetY > oeViz.svgAtt.height/2){
      var tT = "auto";
      var tB = (oeViz.svgAtt.height - d3.event.offsetY - 10)+"px";
    }else{
      var tT = (d3.event.offsetY + 10)+"px";
      var tB = "auto";
    }
    tooltip.style("display","block")
      .style("top",tT).style("bottom",tB)
      .style("left",tL).style("right",tR)

    tooltip.select(".name").text(d["Player Name"]+" ("+d["Position"]+")");
    tooltip.select(".stat1").text("Avg. OE: "+d["Avg. Oe"]);
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
  transitionGridlines(field){
    var self = this;
    var yGrid = this.page.gridlines.select(".y-grid");
    var yTicks = this.page.scales[field].ticks();
    var selection = yGrid.selectAll("line").data(yTicks)
    selection.transition().duration(500)
      .attr("y1", function(d){return self.page.scales[field](d)})
      .attr("y2", function(d){return self.page.scales[field](d)})
      .attr("x1", self.svgAtt.margins.left)
      .attr("x2", self.svgAtt.width-self.svgAtt.margins.right);
    selection.enter().append("line").transition().duration(500)
      .attr("y1", function(d){return self.page.scales[field](d)})
      .attr("y2", function(d){return self.page.scales[field](d)})
      .attr("x1", self.svgAtt.margins.left)
      .attr("x2", self.svgAtt.width-self.svgAtt.margins.right)
      .attr("stroke","black")
      .attr("stroke-width",0.2);
    selection.exit().remove();
  },
  transitionChart:function(field){
    var self = this;
    this.transitionScales(field);
    this.transitionGridlines(field);
    this.transitionAnnotations(field);
    this.page.svg.selectAll("circle").transition().duration(500)
      .attr("transform",function(d){
        return "translate("+self.page.scales["Avg. Oe"](d["Avg. Oe"])+","+self.page.scales[field](d[field])+")";
      })
  },
  transitionAnnotations:function(field){
    var self = this;
    var annos = this.page.svg.selectAll(".annotate")
    annos.selectAll("line").transition().duration(500)
      .attr("y1",function(d){
        return self.page.scales[field](d[field])
      })
      .attr("y2",function(d){
        return self.page.scales[field](d[field])
      })
    annos.selectAll("text").transition().duration(500)
      .attr("transform", function(d){
        var offset = (d["Player Name"]=="Stephen Curry")?100:(-50);
        return "translate("+(self.page.scales["Avg. Oe"](d["Avg. Oe"])+offset)+","+self.page.scales[field](d[field])+")"
      })
  },
  annotate:function(data){
    var self = this;
    var field = this.getField();
    var names = ["DeAndre Jordan", "Andre Drummond", "Stephen Curry"];
    var players = data.filter(function(a){return names.indexOf(a["Player Name"])>-1})
    var annotations = this.page.svg.selectAll(".annotate").data(players).enter().append("g")
      .attr("class","annotate");
    annotations.append("line")
      .attr("stroke","black")
      .attr("x1",function(d){
        return self.page.scales["Avg. Oe"](d["Avg. Oe"])
      })
      .attr("x2",function(d){
        var offset = (d["Player Name"]=="Stephen Curry")?100:(-50);
        return (self.page.scales["Avg. Oe"](d["Avg. Oe"]))+offset;
      })
      .attr("y1",function(d){
        return self.page.scales[field](d[field])
      })
      .attr("y2",function(d){
        return self.page.scales[field](d[field])
      })
    annotations.append("text")
      .attr("alignment-baseline","middle")
      .text(function(d){
        return d["Player Name"]
      })
      .attr("transform", function(d){
        var offset = (d["Player Name"]=="Stephen Curry")?100:(-50);
        return "translate("+(self.page.scales["Avg. Oe"](d["Avg. Oe"])+offset)+","+self.page.scales[field](d[field])+")"
      })
      .attr("text-anchor",function(d){
        return (d["Player Name"]=="Stephen Curry")?"start":"end";
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
      self.makeGrid();
      self.makeChart(data);
      self.annotate(data);
      self.bindInteraction();
    })
  }
}

$(document).ready(function(){
  oeViz.init();
  $(window).on("resize",function(){
    $("svg").remove();
    oeViz.svgAtt.width = parseFloat(d3.select('.svgContain').style('width'));
    oeViz.svgAtt.height = parseFloat(d3.select('.svgContain').style('height'));
    oeViz.init();
  })
})
