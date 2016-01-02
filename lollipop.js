(function () {
  // self: plugin
  // variable: object where configuration stored
  var configHelper = function (self, variable) {
    return function (keyword) {
      return function (x) {
        if (!arguments.length) return variable[keyword];
        variable[keyword] = x;
        return self;
      };
    };
  };

  d3.lollipop = function () {
    
    var variable = {
      bound: {         // bound of chart
        top: 10,       // top area for legend
        bottom: 20,    // bottom area for x axis
        left: 50,      // left area for y axis
        rigth: 10      // right area for nothing
        },
      duration: 1000,   // duration for general transition
      radius: 40,       // radius length of lollipop
      lollipopRatio: .4,// ratio of lollipop
      barWidth: 100,    // width of lollipop, including left and right paddings
      height: 500,      // height of chart
      width: undefined, // width of chart, if is defined, the size is fixed
      parse: data => [data[0], [data[1], data[2]]],
      domain: data => [0, d3.max(data, d => d[0]) * 1.1],
      color: ['#1f77b4', '#2ca02c'],
      yLabelText: '',   // text for y axis
      tipText: (d,i) => ''
    }

    const invisible = 1e-6, // JavaScript uses exponential expression for number smaller than 1e-6
                            // which cannot be recognized by CSS,
                            // to make transition work, invisible should be 1e-6, not 0
      visible = 1;

    // Draw One Lollipop
    var drawSingleLollipop = function (selections) {
      // there is only one selection in each `selections`
      selections.each(function (lollipopData, idx) {
        // var [value, portion] = variable.parse(lollipopData),
        var value = variable.parse(lollipopData)[0],
            portion = variable.parse(lollipopData)[1],
          selection = d3.select(this);

        var yScale = variable.__yScale__;
        // `previousYScale` is only for animation:
        // make sure every new element is coming from ground
        var previousYScale = d3.scale.linear()
          .domain([0, Infinity])
          .range(yScale.range());

        // ========== Drawing Part ==========
        //
        // ===== Center Point in Lollipop =====
        var centerPoint = selection.selectAll('circle.center').data([value]);

        centerPoint.
          enter().
          append('circle').
          attr({
            'class': 'center',
            'r': 2,
            'cx': variable.barWidth / 2,
            'cy': d => previousYScale(d)
          }).
          style('opacity', invisible);

        centerPoint.
          transition().
          duration(variable.duration).
          style('opacity', visible).
          attr('cy', d => yScale(d));

        // ===== Lollipop Container =====
        // Lollipop will be drew inside the container
        
        // `lollipopTransformHelper` takes scale function as parameter
        // returns the function that can be used to `transform` attribute
        // it will put element to the center of each bar
        var lollipopTransformHelper = function (yScaleFunc) {
          return (d, i) => {
            return 'translate(' + 
              (variable.barWidth / 2) + ',' +
              yScaleFunc(d) + ')';
          }
        }
        var lollipopContainer = selection
            .selectAll('g.lollipopContainer')
            .data([value]);
        lollipopContainer
          .enter()
          .append('g')
          .attr({
            'class': 'lollipopContainer',
            'transform': lollipopTransformHelper(previousYScale)
          });

        lollipopContainer.transition()
          .duration(variable.duration)
          .attr('transform', lollipopTransformHelper(yScale));

        // ===== Lollipop =====

        // `arc` defines the inner and outer radius of lollipops
        var arc = d3.svg.arc()
          .innerRadius(variable.radius * (1 - variable.lollipopRatio))
          .outerRadius(variable.radius);
        // `arcTween` defines how the lollipops will transite
        // interpolate from current angle to new angle
        var arcTween = function (d) {
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return t => arc(interpolate(t));
        };
        // `sumPortion` is the sum of all values in portion 
        var sumPortion = portion.reduce((previous, current) => previous + current, 0);
        // `pie` convert data to pie
        // depends on the size of `sumPortion`, the lollipop might not be
        // a complete circle
        var pie = d3.layout.pie().endAngle(variable.__arcScale__(sumPortion));

        var lollipop = selection.selectAll('g.lollipopContainer')
            .data([portion])
            .selectAll('path.lollipop')
            .data(pie);

        lollipop
          .enter()
          .append('path')
          .attr({
            'class': 'lollipop',
            'fill': (d, i) => variable.color[i],
            'd': arc
          })
          .style('opacity', invisible)
          .each(function (d) {
            this._current = d
          }); // store the initial angles

        lollipop.transition()
          .duration(variable.duration)
          .style('opacity', visible)
          .attrTween('d', arcTween);

        // ===== Indicator Line =====

        var indicator = selection.selectAll('line.indicator')
          .data([lollipopData]);
        indicator.
          enter().
          append('line').
          attr({
            'class': 'indicator',
            'x1': variable.barWidth / 2,
            'x2': variable.barWidth / 2,
            'y1': d => previousYScale(value),
            'y2': previousYScale(0)
          }).
          style('visible', invisible);

        indicator.
          transition().
          duration(variable.duration).
          attr({
            'y1': d => yScale(value) + variable.radius * 1.2,
            'y2': yScale(0)
          }).
          style('visible', visible);

      }); // end of `selections.each()`
    }; // end of `drawSinglelollipopBar()`

    var lollipops = function (container) {

      // chartData structure: [{}, {}, ...];
      var chartData = container.datum();

    // y scale (stored in variable for further usage)
     variable.__yScale__ = d3.scale.linear().
          domain(variable.domain(chartData)).
          range([ 
            variable.height - variable.radius - variable.bound.bottom,
            variable.radius + variable.bound.top
            ]);

     // only the lollipop with biggest sum can have complete circle,
     // other conuts will only have partial circle, to reflect the sum
     // `__arcScale__` will calculate the end angle of each circle
     variable.__arcScale__ = d3.scale.linear()
          .domain([0, d3.max(chartData, d => 
            variable.parse(d)[1].reduce(
              (previous, current) => previous + current, 
              0)
            )])
          .range([0, 2 * Math.PI]);

     // create one DOM for tip
     variable.__tip__ = variable.__tip__ || (function() {
     var dom = document.getElementById('tooltip');
        if (!dom) {
          dom = document.createElement('div');
          dom.id = 'tooltip';
          document.body.appendChild(dom);
        }
        return d3.select('#tooltip');
      })();

      // ===== lollipop Bar =====
      // add container for each lollipopBar
      var lollipops = container
        .selectAll('g.bar')
        .data(chartData);
      lollipops.enter()
        .append('g')
        .attr({
          'height': variable.height - 
                    variable.bound.top - 
                    variable.bound.bottom,
          'width': variable.barWidth,
          'transform': (d, i) => 'translate(' + 
                    (i * variable.barWidth + 
                      variable.bound.left) + ', 0)',
          'class': 'bar'
        });
      // draw
      lollipops.call(drawSingleLollipop);

      // add events for show/hide tooltip
      lollipops.on('mouseover', (d, i) => {
        variable.__tip__.style({
          'font-size': '10px',
          'height': variable.tipHeight + 'px',
          'width': variable.tipWidth + 'px',
          'margin-left': (i * variable.barWidth + 
                          variable.yAxisWidth +
                          (variable.barWidth - variable.tipWidth) / 2) + 'px',
          'margin-top': (variable.__yScale__(d.visits) - variable.radius - variable.tipHeight - variable.tipPadding) + 'px'
        }).html(variable.tipText(d, i));
        
        variable.__tip__
        .transition()
          .duration(variable.tipDuration)
          .style({
          'opacity': visible
          });
      });
      lollipops.on('mouseout', (d, i) => {
        variable.__tip__
        .transition()
          .duration(variable.tipDuration)
          .style('opacity', invisible);
      })
      
      lollipops.exit().remove();

      // ===== Axis & Title =====
      var ordinal = d3.scale.ordinal()
        .domain(d3.range(chartData.length))
        .rangePoints([
          variable.barWidth / 2, 
          (chartData.length - 0.5) * variable.barWidth
          ]);
      var xAxis = d3.svg.axis()
        .scale(ordinal)
        .orient('bottom')
        .tickFormat(i => chartData[i]['name']);
      var yAxis = d3.svg.axis()
        .scale(variable.__yScale__)
        .orient('left');

      variable.__accessories__ = variable.__accessories__ || (function () {
        var xAxis = container.append('g').
          attr({
            'transform': 'translate(' + 
              (variable.bound.left) + ', ' + 
              (variable.height - variable.bound.bottom) + ')',
            'class': 'x axis'
          });
        var yAxis = container.append('g').
          attr({
            'transform': 'translate(' + (variable.bound.left) + ', 0)',
            'class': 'y axis'
            });
        var yLabel = container.append('text').
          attr({
            'transform': 'translate(' + 
              (variable.bound.left / 2) + ', ' + 
              (variable.height - variable.bound.bottom) + ')',
            'class': 'y label',
            'text-anchor': 'middle'
          });
        return {
          'xAxis': xAxis,
          'yAxis': yAxis,
          'yLabel': yLabel
        }
      })();

      variable.__accessories__.xAxis.
        call(xAxis);

      variable.__accessories__.yAxis.
        transition().duration(variable.duration).
        call(yAxis);

      variable.__accessories__.yLabel.
        text(variable.yLabelText);
        
    }

    // add configuration functions inside
    var customization = configHelper(lollipops, variable);
    Object.keys(variable).forEach(keyword => {
      lollipops[keyword] = customization(keyword);
    });
    
    return lollipops;
  }

})()