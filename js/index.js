(function (d3, topojson) {

  'use strict'

  const getWorldMapData = function () {
    return new Promise (function (resolve, reject) {
      d3.json('https://d3js.org/world-50m.v1.json', function(error, mapData) {
        if (error) reject(error)
        resolve(mapData)
      })
    })
  }

  const getMeteoriteData = function (mapData) {
    return new Promise (function (resolve, reject) {
       d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(error, meteoriteData) {
         if (error) reject(error)
         resolve({mapData: mapData, meteoriteData: meteoriteData})
       })
    })
  }

  const drawSVG = function (mapData, meteoriteData, dimensions) {
    meteoriteData = meteoriteData.features
    const w = dimensions.width
    const h = dimensions.height

    const projection = d3.geoMercator()
    .scale(100)
    .translate([w/2,h/2])

    d3.select('#app').selectAll("*").remove();
    const svg = d3.select('#app')
    .append('svg')
    .attr('width',w)
    .attr('height', h)

    const path = d3.geoPath()
    .projection(projection)

    const div = d3.select('#app')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

    svg.append('g')
    .selectAll('path')
    .data(topojson.feature(mapData, mapData.objects.countries).features)
    .enter()
    .append('path')
    .attr('fill', 'black')
    .attr('stroke', 'white')
    .attr('d', path)
    .style('opacity',0.5)

    svg.append('g')
    .selectAll('path')
    .data(meteoriteData)
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

    const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on('zoom', () => d3.selectAll('g').attr('transform', d3.event.transform));
    svg.call(zoom);

  }

  getWorldMapData().then(function (mapData) {
    getMeteoriteData(mapData).then(function (data) {
      const mapData = data.mapData
      const meteoriteData = data.meteoriteData

      if (window.innerWidth < 1000 && window.innerWidth >= 600) {
        drawSVG(mapData, meteoriteData,{width: 600, height: 400})
      } else if (window.innerWidth < 600) {
        drawSVG(mapData, meteoriteData,{width: 350, height: 350})
      } else {
        drawSVG(mapData, meteoriteData,{width: 800, height: 500})
      }
      window.addEventListener('orientationchange', function () {
        if (screen.orientation.angle === 90) {
          drawSVG(mapData, meteoriteData,{width: 600, height: 400})
        } else {
          drawSVG(mapData, meteoriteData,{width: 350, height: 350})
        }
      })
      window.addEventListener('resize', function () {
        if (this.innerWidth < 1000 && this.innerWidth >= 600) {
          drawSVG(mapData, meteoriteData,{width: 600, height: 400})
        } else if (this.innerWidth < 600) {
          drawSVG(mapData, meteoriteData,{width: 350, height: 350})
        } else {
          drawSVG(mapData, meteoriteData,{width: 800, height: 500})
        }
      })
    })
  })

}(d3, topojson))
