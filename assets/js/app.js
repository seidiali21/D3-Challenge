// @TODO: YOUR CODE HERE!
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

runApp();

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  // .style('background','lightgray')
  .attr("width", svgWidth)
  .attr("height", svgHeight + 40); // extra padding for third label

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

var data;

async function runApp(){
  // Import Data
  const stateData = await d3.csv("assets/data/data.csv");
  data = stateData;
  // Parse Data/Cast as numbers

  stateData.forEach(function(data) {
    data.poverty    = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age        = +data.age;
    data.smokes     = +data.smokes;
    data.obesity    = +data.obesity;
    data.income     = +data.income;
  });

 // function xScale(data, chosenXAxis) {
 //     let chosenValue = data.map(obj => obj[chosenXAxis]);
 //     let xMin = d3.min(chosenValue)*0.90;
 //     let xMax = d3.max(chosenValue)*1.10;
 //     let xLine = d3.scaleLinear().domain([xMin, xMax]).range([0,960]);
 //     let xAxis = d3.axisBottom(xLine);
 //     svg.append('g').call(xAxis);
 //     console.log(xMin,xMax);
 // }

 // function yScale(data, chosenYAxis) {
 //     let chosenValue = data.map(obj => obj[chosenYAxis]);
 //    let yMin = d3.min(chosenValue)*0.90;
 //     let yMax = d3.max(chosenValue)*1.10;
 //     let yLine = d3.scaleLinear().domain([yMin, yMax]).range([0,500]);
 //     let yAxis = d3.axisBottom(yLine);
  //    svg.append('g').call(yAxis);
  //    console.log(yMin,yMax);
 // } 

function xScale(csvData, chosenXAxis) {
  // create scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.9,
      d3.max(csvData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}


function yScale(csvData, chosenYAxis) {
  // create scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) - 1,
      d3.max(csvData, d => d[chosenYAxis]) + 1
    ])
    .range([height, 0]);

  return yLinearScale;
}


function renderXAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


function renderYAxes(newYScale, yAxis) {
  let leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
 

function renderXCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


function renderXText(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis])+5);

  return circlesGroup;
}

// format number to USD currency
let formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});



function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

  let xpercentsign = "";
  let xlabel = "";
  if (chosenXAxis === "poverty") {
    xlabel = "Poverty";
    xpercentsign = "%";
  } else if (chosenXAxis === "age"){
    xlabel = "Age";
  } else {
    xlabel = "Income";
  }

  let ypercentsign = "";
  let ylabel = "";
  if (chosenYAxis === "healthcare") {
    ylabel = "Healthcare";
    ypercentsign = "%";
  } else if (chosenYAxis === "smokes"){
    ylabel = "Smokes";
    ypercentsign = "%";
  } else {
    ylabel = "Obesity";
    ypercentsign = "%";
  }

  const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([50, -75])
    .html(function(d) {
      if (chosenXAxis === "income"){
        let incomelevel = formatter.format(d[chosenXAxis]);

        return (`${d.state}<br>${xlabel}: ${incomelevel.substring(0, incomelevel.length-3)}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
      } else {
        return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
      };
    });

  circlesGroup.call(toolTip);

  // mouseover event
  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
      // trying to highlight chosen circle
      // circlesGroup.append("circle")
      //   .attr("cx", d3.event.pageX)
      //   .attr("cy", d3.event.pageY)
      //   .attr("r", 15)
      //   .attr("stroke", "black")
      //   .attr("fill", "none");
  })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

return circlesGroup;
}


  // Initialize scale functions
  let xLinearScale = xScale(stateData, chosenXAxis);
  let yLinearScale = yScale(stateData, chosenYAxis);

  // Initialize axis functions
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // Append x and y axes to the chart
  let xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  let yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Create scatterplot and append initial circles
  let circlesGroup = chartGroup.selectAll("g circle")
    .data(stateData)
    .enter()
    .append("g");
  
  let circlesXY = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true);
  
  let circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
    .classed("stateText", true);

  // Create group for 3 x-axis labels
  const xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  const povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .text("In Poverty (%)")
    .classed("active", true);

  const ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .text("Age (Median)")
    .classed("inactive", true);

  const incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 80)
    .attr("value", "income") // value to grab for event listener
    .text("Household Income (Median)")
    .classed("inactive", true);

  // Create group for 3 y-axis labels
  const ylabelsGroup = chartGroup.append("g");

  const healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -40)
    .attr("value", "healthcare") // value to grab for event listener
    .text("Lacks Healthcare (%)")
    .classed("active", true);

  const smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("value", "smokes") // value to grab for event listener
    .text("Smokes (%)")
    .classed("inactive", true);

  const obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -80)
    .attr("value", "obesity") // value to grab for event listener
    .text("Obese (%)")
    .classed("inactive", true);

  // initial tooltips
  circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

      // updates circles text with new x values
      circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true)
          
        ageLabel
          .classed("active", true)
          .classed("inactive", false)
          
        incomeLabel
          .classed("active", false)
          .classed("inactive", true)
          
      }
      else if (chosenXAxis === "income") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true)
          
        ageLabel
          .classed("active", false)
          .classed("inactive", true)
          
        incomeLabel
          .classed("active", true)
          .classed("inactive", false)
          
      }
      else {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false)
          
        ageLabel
          .classed("active", false)
          .classed("inactive", true)
          
        incomeLabel
          .classed("active", false)
          .classed("inactive", true)
          
      }
    }
  });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);

      // updates circles text with new y values
      circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          
        smokesLabel
          .classed("active", true)
          
        obeseLabel
          .classed("active", false)
          
      }
      else if (chosenYAxis === "obesity"){
        healthcareLabel
          .classed("active", false)
          
        smokesLabel
          .classed("active", false)
          
        obeseLabel
          .classed("active", true)
          
      }
      else {
        healthcareLabel
          .classed("active", true)
          
        smokesLabel
          .classed("active", false)
          
        obeseLabel
          .classed("active", false)
          
      }
    }
  });

}