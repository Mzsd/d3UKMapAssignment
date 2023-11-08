var width = 850,
    height = 1000;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo .albers()
                        .center([0, 55.4])
                        .rotate([4.4, 0])
                        .scale(5500)
                        .translate([width / 2, height / 2]);

var jsonFeedURI = "http://34.38.72.236/Circles/Towns/100"

var slider = document.getElementById('fader');

var btn = document.getElementById("btn");

btn.onclick = function () {reload()};

slider.oninput = function () {reload()};

// Drawing the map
d3.json("json_data/ne_10m_admin_0_map_subunits.json", function(error, uk) {
    if (error) return console.error(error);

    var subunits = uk.objects.ne_10m_admin_0_map_subunits;
    
    var path = d3.geo   .path()
                        .projection(projection);

    svg .selectAll(".subunit")
        .data(topojson.feature(uk, subunits).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", function(d) { 
            return "subunit " + d.properties.ADM0_TLC;
        })
        .attr("d", path);
        
    setTimeout(100);
});

loadTowns(jsonFeedURI);

function loadTowns(url)    {
    d3.json(url, function(e, data) {

        // Placing the cities
        svg.selectAll('.cityname')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'cityname')
        .attr("x", function(d)  {
            return projection([d.lng, d.lat])[0]
        })
        .attr("y", function(d)  {
            return projection([d.lng, d.lat])[1]
        })
        .style('font-size', '12px')
        .style('font-family', '"Roboto", Bold')
        .style('font-weight', '700')
        .style('color', 'blue')
        .text(function(d)  {
            return d.Town
        })
        .attr('dx','6')
        .attr('dy','6')

        // Setting the circles
        svg.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class', 'circle')
        .style("fill", "rgba(50, 50, 50, 0.7)" )
        .attr("cx", function(d)  {
            var coords = projection([d.lng, d.lat])
            return coords[0];
        })
        .attr("cy", function(d)  {
            var coords = projection([d.lng, d.lat])
            return coords[1]
        })
        .attr("r", 4)
        
        toolTip()
    });
}

function toolTip()  {
    // Adding the tooltip
    var tooltip = d3.select("#tooltip_div")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "10px")
        .style("padding", "5px")
        .style("box-sizing", "border-box")

    svg.selectAll("circle")
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .ease('elastic')
                .duration(350)
                .attr("r", 7);
            console.log(d)
            return tooltip
            .style(
                "visibility", 
                "visible"
            )
            .text("Population: " + d.Population + "\nCounty: " + d.County)
            .html("<p><span style='font-size: 13px;'><strong>Town: " + d.Town + "</strong><br>Population: " + d.Population + "<br>County: " + d.County + "<br>Latitude: " + d.lat + "<br>Longitude: " + d.lng + "</span>");
        })
        .on("mousemove", function(d, i, e) {
            console.log(i)
            return tooltip.style(
                "top", 
                (event.pageY-142) + "px"
            ).style(
                "left",
                (event.pageX-50) + "px"
            );
        })
        .on("mouseout", function()  {

            d3.select(this)
                .transition()
                .duration(250)
                .attr("r", 4);

            return tooltip.style(
                "visibility", 
                "hidden"
            );
        });

}

function reload() {
	jsonFeedURI = jsonFeedURI.split("/").slice(0, -1).join("/") + "/" + document.getElementById("fader").value
    svg.selectAll('text').remove()
    svg.selectAll('circle').remove()
    loadTowns(jsonFeedURI)
}