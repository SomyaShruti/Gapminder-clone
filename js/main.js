/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = { LEFT: 80, RIGHT: 20, TOP: 50, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT},${MARGIN.TOP})`);

let time = 0;
let interval;
let clean_data = [];

// Tooltip
const tip = d3.select("#chart-area")
  .append("div")
  .style("opacity", 0)
  .attr('class', 'd3-tip')
  .style("background-color", "pink")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// Functions to handle the tooltip events
const mouseover = function (event, d) {
  tip.style("opacity", 1);
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1);
};

const mousemove = function (event, d) {
  const text = `<strong>Country:</strong> <span style='color:red'>${d.country}</span><br>
                <strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>
                <strong>Life Expectancy:</strong> <span style='color:red'>${d.life_exp}</span><br>
                <strong>Income:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>
                <strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`;
  tip.html(text)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
};

const mouseleave = function (event, d) {
  tip.style("opacity", 0);
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8);
};

const x = d3.scaleLog()
  .domain([142, 150000])
  .range([0, WIDTH])
  .base(10);

const y = d3.scaleLinear()
  .domain([0, 90])
  .range([HEIGHT, 0]);

const area = d3.scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

const color = d3.scaleOrdinal(d3.schemePastel1);

const xLabel = g.append("text")
  .attr("y", HEIGHT + 50)
  .attr("x", WIDTH / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP Per Capita ($)");

const yLabel = g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Life Expectancy (Years)");

const timeLabel = g.append("text")
  .attr("y", HEIGHT - 10)
  .attr("x", WIDTH - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800");

const xAxisGroup = g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${HEIGHT})`);

const yAxisGroup = g.append("g")
  .attr("class", "y axis");

const xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));

const yAxisCall = d3.axisLeft(y);

xAxisGroup.call(xAxisCall);
yAxisGroup.call(yAxisCall);

const continents = ["europe", "asia", "america", "africa"];

const legend = g.append("g")
  .attr("transform", `translate(${WIDTH - 10},${HEIGHT - 125})`);

continents.forEach((continent, i) => {
  const legendRow = legend.append("g")
    .attr("transform", `translate(0,${i * 20})`);

  legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", color(continent));

  legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(continent);
});

d3.json("data/data.json").then(function (data) {
  clean_data = data.map(year => {
    return year["countries"].filter(country => {
      const dataExists = (country.income && country.life_exp);
      return dataExists;
    }).map(country => {
      country.income = +country.income;
      country.life_exp = +country.life_exp;
      country.population = +country.population; // Ensure population is converted to number
      return country;
    });
  });

  console.log(clean_data);

  update(clean_data[0]);

  $("#play-button").on("click", function() {
    if (interval) {
      clearInterval(interval);
      interval = null;
      $(this).text("Play");
    } else {
      interval = setInterval(step, 100);
      $(this).text("Pause");
    }
  });
  $("#reset-button")
      .on("click",()=>{
        time=0
        update(clean_data[0])
      })
});

function step() {
  // at the end of our data, loop back
  time = (time < 214) ? time + 1 : 0;
  update(clean_data[time]);
}

function update(data) {
  const t = d3.transition()
    .duration(100);

  // JOIN new data with old elements
  const circles = g.selectAll("circle")
    .data(data, d => d.country);

  // EXIT old elements not present in new data.
  circles.exit().remove();

  // ENTER new elements
  circles.enter().append("circle")
    .attr("fill", d => color(d.continent))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .merge(circles)
    .transition(t)
    .attr("cx", d => x(d.income))
    .attr("cy", d => y(d.life_exp))
    .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

  timeLabel.text(String(time + 1800));
}
