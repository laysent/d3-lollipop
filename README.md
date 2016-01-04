Lollipop Chart
==============

[Demo](http://bl.ocks.org/laysent/5739f087ec78e4386a6a)

Designed for scenarios where three or more parameters need to be displayed in
one chart, where one of the parameter is significantly larger than other values,
and will not be used as portion of all other parameters in the chart.
Having them all together in one kind of chart makes other parameters unrecognizable.

Using the chart here, the parameter will be displayed as the height of pie chart,
where all other parameters will be displayed as the portion in pie chart.

Function Overview
-----------------

\# d3.**lollipop**()

construct lollipop chart object. This object can then have parameters set before the
chart was drawn.

```javascript
var lollipop = d3.lollipop();
```

lollipop.**bound**(top, left, bottom, right)

set up bound area size for top, left, bottom, right area. If certain parameter 
is not passed in, default value will be used.

+ top: top area is for legend, default size is 30 px;
+ right: right area is by default not in use, default size is 0px. 
It will only be used when `width` is fixed in chart (see below);
+ bottom: bottom area is for x-axis, default size is 20px;
+ left: left area is for y-axis, default size is 50px;  

```javascript
lollipop.bound(30, , 20, 50); // `left` value will be default one, which is 0px.
```

lollipop.**bound**(config)

set up bound area size, where `config` is an object with `top`, `left`,
`bottom` and `right` attributes. If certain attribute is not passed in, 
default value will be used.

```javascript
lollipop.bound({top:30, bottom: 20}); // `left` and `right` values will be default one.
```

lollipop.**height**(num)

The height() function takes a number as parameter to determine the height of
chart, including the area defined by bound() function.

lollipop.**width**(num)

The width() function is by default not in use. It takes one number as parameter
to determine the width of chart, including the area defined by bound() function.
If width() is not in use, width of chart will be flexible and depend on number of
lollipops; while if width() is used, width will be fixed and size of lollipop will
be adjusted accordingly.

lollipop.**barWidth**(num)

The barWidth() function takes a number as parameter to determine the width of each
lollipop container, including the possible padding at left and right hand size of 
lollipops.

lollipop.**radius**(num)

The radius() function takes a number as parameter to determine the radius of each
lollipop. That means, lollipop.radius() * 2 will be the actual width of each lollipop,
and the difference between this value and lollipop.barWidth will be the padding evenly
and separately used on two side of lollipop.

lollipop.**lollipopRatio**(float)

The lollipopRatio() function takes a float number as parameter, which should be in range (0, 1].
The ratio determines width of donut size. If number 1 is passed in, it will be shown
as a pie chart; if less then 1 is passed in, it will be shown as a donut.

lollipop.**duration**(num)

The duration() function takes a number as parameter to determine the total time span (in milliseconds)
for animation. Number passed in should be non-negative.

lollipop.**legendText**(arr)

The legendText() function takes an array as parameter to determine the text for each legend,
the element in array should all be string. By default, legendText is an empty array,
with no element inside. If no element is found in array, legend will not be shown.

lollipop.**legendLeftPadding**(num)

The legendLeftPadding() function takes a number as parameter to determine the left padding size
of first legend from y-axis area. Default value is 10px.

lollipop.**legendBoxSize**(num)

The legendBoxSize() function takes a number as parameter to determine the box size of legend.
Default value is 5px, indicating the box size of legend will be 5px * 5px.

lollipop.**color**(arr)

The color() function takes an array as parameter to determine the color for each element in portion.
Color should be determined by string. Either use the hex value such as '#fff' or color keyword such
as 'white'.

```javascript
lollipop.color(['#fff', 'black']);
```

lollipop.**yLabelText**(string)

The yLabelText() function takes a string as parameter to determine the text value for y axis.

lollipop.**tooltipText**(func)

The tooltipText() function takes a function as parameter to determine the tooltip content for each
lollipop. The function in parameter should take 2 values as parameter, one is the value `d` and
the other one is the index `i`. Default tooltipText returns an empty string no matter what parameters
passed in.

```javascript
lollipop.tooltipText( (d, i) => '#' + i ' element' ); // content will be #1 element, #2 element, etc.
```

lollipop.**tooltipDuration**(num)

The tooltipDuration() function takes a number as parameter to determine the time span (in milliseconds)
to show and hide tooltips.

lollipop.**parse**(func)

The parse() function takes a function as parameter to determine how to parse the passed-in data into
pre-defined structure. The function should take one value as parameter, and return an array as parsed
result. The returned array should have two parameters, first one is one variable, the second one is an
array of the rest variables. Each variable should be an array with eleemnts inside.

```javascript
lollipop.parse( data => [data[0], [data[1], data[2]]] ); // default parse value
```