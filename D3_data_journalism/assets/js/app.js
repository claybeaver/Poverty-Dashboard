const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// SVG Wrapper
const svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params (poverty vs smokes)
let chosenXAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales for different options
  if (chosenXAxis === "healthcare") {
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.2,
      d3.max(data, d => d[chosenXAxis]) * 2.6
    ])
    .range([0, width]);
  return xLinearScale;
}
  else {
    const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);
  return xLinearScale;
  }
}


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function to create State abbreviations for the circles
function renderAbbr (textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
    .duration(1000)
    .attr('x', d => newXScale(d[chosenXAxis]));

  return textGroup
}

// function used for updating circles group with tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  let label;

  if (chosenXAxis === "smokes") {
    label = "Smokes: ";
  } else if (chosenXAxis === "obesity") {
    label = "Obese: ";
  } else {
    label = "Lack Healthcare: "
  }

  const toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>${label} ${d[chosenXAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// function for updating tooltip when hovering over text
function updateToolTip2(chosenXAxis, textGroup) {

  let label;

  if (chosenXAxis === "smokes") {
    label = "Smokes: ";
  } else if (chosenXAxis === "obesity") {
    label = "Obese: ";
  } else {
    label = "Lack Healthcare: "
  }

  const toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>${label} ${d[chosenXAxis]}%`);
    });

  textGroup.call(toolTip);

  textGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return textGroup;
}



// Read CSV
// console.log("Test Before Data Load CSV");

d3.csv("assets/data/data.csv").then(function (AcsData, err) {
  if (err) throw err;
let count = 0
  // parse data
  AcsData.forEach(function (data) {
    data.poverty = +data.poverty;
    count += 1
    // console.log(`Poverty Data Loaded: Record # ${count}`);
    data.smokes = +data.smokes;
    // console.log(`Smokes Data Loaded: Record # ${count}`);
    data.obesity = +data.obesity;
    // console.log(`Obesity Data Loaded: Record # ${count}`);
    data.heathcare = +data.heathcare;
    // console.log(`Healthcare Data Loaded: Record # ${count}`);
    data.age = +data.age;
    // console.log(`Age Data Loaded: Record # ${count}`);
    data.income = +data.income;
    // console.log(`Income Data Loaded: Record # ${count}`);
  });
  

  // Run xLinearScale function
  let xLinearScale = xScale(AcsData, chosenXAxis);

  // Create y scale function
  let yLinearScale = d3.scaleLinear()
    .domain([8, d3.max(AcsData, d => d.poverty)])
    .range([height, 4]);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  let circlesGroup = chartGroup.selectAll("circle")
    .data(AcsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", 10)
    .attr("fill", "teal")
    .attr("opacity", ".6");


  // append abbreviation text
  let textGroup = chartGroup.selectAll('.abbrText')
    .data(AcsData)
    .enter()
    .append('text')
    .classed('abbrText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d.poverty))
    .attr('dy', 3)
    .attr('dx', -7)
    .attr('fill', 'white')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .text(function(d){return d.abbr});


  // Create group for two x-axis labels
  const labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const smokeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

  const obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  const healthCareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .attr("font-weight", 900)
    .text("In Poverty (%)");

  // updateToolTip function above csv import
  textGroup = updateToolTip2(chosenXAxis, textGroup);
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(AcsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // update text abbreviations
        textGroup = renderAbbr(textGroup, xLinearScale, chosenXAxis);

        // update text tooltips with new info
        textGroup = updateToolTip(chosenXAxis, textGroup);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        

        // changes classes to change bold text
        if (chosenXAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
          healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
        } else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
})
.catch(function (error) {
  console.log(error);
});