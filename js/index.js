(function (d3, topojson) {

  'use strict'

  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
  const w = 1000
  const h = 600

  const projection = d3.geoMercator()
  .scale(100)
  .translate([w/2,h/2])

  const svg = d3.select('#app')
  .append('svg')
  .attr('width',w)
  .attr('height', h)

  const path = d3.geoPath()
  .projection(projection)

  const div = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

 const renderWorldMap = function () {
   return new Promise(function (resolve,reject) {
     d3.json('https://d3js.org/world-50m.v1.json', function(json) {
       svg.append('g')
        .selectAll('path')
        .data(topojson.feature(json, json.objects.countries).features)
        .enter()
        .append('path')
        .attr('fill', 'black')
        .attr('stroke', 'white')
        .attr('d', path)
        .style('opacity',0.5)
        resolve(svg)
      })
    })
  }
  const renderMeteorites = function () {
    return new Promise( function (resolve,reject) {
       d3.json(url, function(json) {
         json = json.features
         svg.append('g')
         .selectAll('path')
         .data(json)
         .enter()
         .append('path')
         .attr('d', path.pointRadius(d => Math.sqrt(d.properties.mass/10000)))
         .attr('fill', 'green')
         .style('cursor','pointer')
         .on('mouseover', function (d) {
           div.transition()
           .duration(100)
           .style('opacity', 0.9)
           div.html('<h1>' + d.properties.name + '</h1><h3>' + new Date(d.properties.year) + '</h3>')
           .style('left', d3.event.pageX + 'px')
           .style('top',  d3.event.pageY + 'px')
           .on('mouseout', function(d) {
             div.transition()
             .duration(400)
             .style('opacity', 0)
           })
         })
         resolve(svg)
       })
     })
   }
   renderWorldMap().then(renderMeteorites)
   const zoom = d3.zoom()
   .scaleExtent([1, 5])
   .on('zoom', () => d3.selectAll('g').attr('transform', d3.event.transform));

   svg.call(zoom);

}(d3, topojson))
