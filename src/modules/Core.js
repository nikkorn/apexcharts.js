import Bar from '../charts/Bar'
import BarStacked from '../charts/BarStacked'
import CandleStick from '../charts/CandleStick'
import Crosshairs from './Crosshairs'
import DateTime from './../utils/DateTime'
import HeatMap from '../charts/HeatMap'
import Pie from '../charts/Pie'
import Radar from '../charts/Radar'
import Radial from '../charts/Radial'
import RangeBar from '../charts/RangeBar'
import Legend from './Legend'
import Line from '../charts/Line'
import Graphics from './Graphics'
import XAxis from './axes/XAxis'
import YAxis from './axes/YAxis'
import Range from './Range'
import Utils from '../utils/Utils'
import Scales from './Scales'
import Series from './Series'
import TimeScale from './TimeScale'

/**
 * ApexCharts Core Class responsible for major calculations and creating elements.
 *
 * @module Core
 **/

export default class Core {
  constructor(el, ctx) {
    this.ctx = ctx
    this.w = ctx.w
    this.el = el
  }

  // get data and store into appropriate vars

  setupElements() {
    let gl = this.w.globals
    let cnf = this.w.config

    // const graphics = new Graphics(this.ctx)

    let ct = cnf.chart.type
    let axisChartsArrTypes = [
      'line',
      'area',
      'bar',
      'rangeBar',
      // 'rangeArea',
      'candlestick',
      'radar',
      'scatter',
      'bubble',
      'heatmap'
    ]

    let xyChartsArrTypes = [
      'line',
      'area',
      'bar',
      'rangeBar',
      // 'rangeArea',
      'candlestick',
      'scatter',
      'bubble'
    ]

    gl.axisCharts = axisChartsArrTypes.indexOf(ct) > -1

    gl.xyCharts = xyChartsArrTypes.indexOf(ct) > -1

    gl.isBarHorizontal =
      (cnf.chart.type === 'bar' || cnf.chart.type === 'rangeBar') &&
      cnf.plotOptions.bar.horizontal

    gl.chartClass = '.apexcharts' + gl.cuid

    gl.dom.baseEl = this.el

    gl.dom.elWrap = document.createElement('div')
    Graphics.setAttrs(gl.dom.elWrap, {
      id: gl.chartClass.substring(1),
      class: 'apexcharts-canvas ' + gl.chartClass.substring(1)
    })
    this.el.appendChild(gl.dom.elWrap)

    gl.dom.Paper = new window.SVG.Doc(gl.dom.elWrap)
    gl.dom.Paper.attr({
      class: 'apexcharts-svg',
      'xmlns:data': 'ApexChartsNS',
      transform: `translate(${cnf.chart.offsetX}, ${cnf.chart.offsetY})`
    })

    gl.dom.Paper.node.style.background = cnf.chart.background

    this.setSVGDimensions()

    gl.dom.elGraphical = gl.dom.Paper.group().attr({
      class: 'apexcharts-inner apexcharts-graphical'
    })

    gl.dom.elDefs = gl.dom.Paper.defs()

    gl.dom.elLegendWrap = document.createElement('div')
    gl.dom.elLegendWrap.classList.add('apexcharts-legend')
    gl.dom.elWrap.appendChild(gl.dom.elLegendWrap)

    // gl.dom.Paper.add(gl.dom.elLegendWrap)
    gl.dom.Paper.add(gl.dom.elGraphical)
    gl.dom.elGraphical.add(gl.dom.elDefs)
  }

  plotChartType(ser, xyRatios) {
    const w = this.w
    const cnf = w.config
    const gl = w.globals

    let lineSeries = {
      series: [],
      i: []
    }
    let areaSeries = {
      series: [],
      i: []
    }
    let scatterSeries = {
      series: [],
      i: []
    }

    let bubbleSeries = {
      series: [],
      i: []
    }

    let columnSeries = {
      series: [],
      i: []
    }

    let candlestickSeries = {
      series: [],
      i: []
    }

    gl.series.map((series, st) => {
      // if user has specified a particular type for particular series
      if (typeof ser[st].type !== 'undefined') {
        if (ser[st].type === 'column' || ser[st].type === 'bar') {
          w.config.plotOptions.bar.horizontal = false // horizontal bars not supported in mixed charts, hence forcefully set to false
          columnSeries.series.push(series)
          columnSeries.i.push(st)
          w.globals.columnSeries = columnSeries.series
        } else if (ser[st].type === 'area') {
          areaSeries.series.push(series)
          areaSeries.i.push(st)
        } else if (ser[st].type === 'line') {
          lineSeries.series.push(series)
          lineSeries.i.push(st)
        } else if (ser[st].type === 'scatter') {
          scatterSeries.series.push(series)
          scatterSeries.i.push(st)
        } else if (ser[st].type === 'bubble') {
          bubbleSeries.series.push(series)
          bubbleSeries.i.push(st)
        } else if (ser[st].type === 'candlestick') {
          candlestickSeries.series.push(series)
          candlestickSeries.i.push(st)
        } else {
          // user has specified type, but it is not valid (other than line/area/column)
          console.warn(
            'You have specified an unrecognized chart type. Available types for this propery are line/area/column/bar/scatter/bubble'
          )
        }
        gl.comboCharts = true
      } else {
        lineSeries.series.push(series)
        lineSeries.i.push(st)
      }
    })

    let line = new Line(this.ctx, xyRatios)
    let candlestick = new CandleStick(this.ctx, xyRatios)
    let pie = new Pie(this.ctx)
    let radialBar = new Radial(this.ctx)
    let rangeBar = new RangeBar(this.ctx, xyRatios)
    let radar = new Radar(this.ctx)
    let elGraph = []

    if (gl.comboCharts) {
      if (areaSeries.series.length > 0) {
        elGraph.push(line.draw(areaSeries.series, 'area', areaSeries.i))
      }
      if (columnSeries.series.length > 0) {
        if (w.config.chart.stacked) {
          let barStacked = new BarStacked(this.ctx, xyRatios)
          elGraph.push(barStacked.draw(columnSeries.series, columnSeries.i))
        } else {
          let bar = new Bar(this.ctx, xyRatios)
          elGraph.push(bar.draw(columnSeries.series, columnSeries.i))
        }
      }
      if (lineSeries.series.length > 0) {
        elGraph.push(line.draw(lineSeries.series, 'line', lineSeries.i))
      }
      if (candlestickSeries.series.length > 0) {
        elGraph.push(
          candlestick.draw(candlestickSeries.series, candlestickSeries.i)
        )
      }
      if (scatterSeries.series.length > 0) {
        const scatterLine = new Line(this.ctx, xyRatios, true)
        elGraph.push(
          scatterLine.draw(scatterSeries.series, 'scatter', scatterSeries.i)
        )
      }
      if (bubbleSeries.series.length > 0) {
        const bubbleLine = new Line(this.ctx, xyRatios, true)
        elGraph.push(
          bubbleLine.draw(bubbleSeries.series, 'bubble', bubbleSeries.i)
        )
      }
    } else {
      switch (cnf.chart.type) {
        case 'line':
          elGraph = line.draw(gl.series, 'line')
          break
        case 'area':
          elGraph = line.draw(gl.series, 'area')
          break
        case 'bar':
          if (cnf.chart.stacked) {
            let barStacked = new BarStacked(this.ctx, xyRatios)
            elGraph = barStacked.draw(gl.series)
          } else {
            let bar = new Bar(this.ctx, xyRatios)
            elGraph = bar.draw(gl.series)
          }
          break
        case 'candlestick':
          let candleStick = new CandleStick(this.ctx, xyRatios)
          elGraph = candleStick.draw(gl.series)
          break
        case 'rangeBar':
          elGraph = rangeBar.draw(gl.series)
          break
        case 'heatmap':
          let heatmap = new HeatMap(this.ctx, xyRatios)
          elGraph = heatmap.draw(gl.series)
          break
        case 'pie':
        case 'donut':
          elGraph = pie.draw(gl.series)
          break
        case 'radialBar':
          elGraph = radialBar.draw(gl.series)
          break
        case 'radar':
          elGraph = radar.draw(gl.series)
          break
        default:
          elGraph = line.draw(gl.series)
      }
    }

    return elGraph
  }

  setSVGDimensions() {
    let gl = this.w.globals
    let cnf = this.w.config

    gl.svgWidth = cnf.chart.width
    gl.svgHeight = cnf.chart.height

    let elDim = Utils.getDimensions(this.el)

    let widthUnit = cnf.chart.width
      .toString()
      .split(/[0-9]+/g)
      .pop()

    if (widthUnit === '%') {
      if (Utils.isNumber(elDim[0])) {
        if (elDim[0].width === 0) {
          elDim = Utils.getDimensions(this.el.parentNode)
        }

        gl.svgWidth = (elDim[0] * parseInt(cnf.chart.width)) / 100
      }
    } else if (widthUnit === 'px' || widthUnit === '') {
      gl.svgWidth = parseInt(cnf.chart.width)
    }

    if (gl.svgHeight !== 'auto' && gl.svgHeight !== '') {
      let heightUnit = cnf.chart.height
        .toString()
        .split(/[0-9]+/g)
        .pop()
      if (heightUnit === '%') {
        let elParentDim = Utils.getDimensions(this.el.parentNode)
        gl.svgHeight = (elParentDim[1] * parseInt(cnf.chart.height)) / 100
      } else {
        gl.svgHeight = parseInt(cnf.chart.height)
      }
    } else {
      if (gl.axisCharts) {
        gl.svgHeight = gl.svgWidth / 1.61
      } else {
        gl.svgHeight = gl.svgWidth
      }
    }

    if (gl.svgWidth < 0) gl.svgWidth = 0
    if (gl.svgHeight < 0) gl.svgHeight = 0

    Graphics.setAttrs(gl.dom.Paper.node, {
      width: gl.svgWidth,
      height: gl.svgHeight
    })

    // gl.dom.Paper.node.parentNode.parentNode.style.minWidth = gl.svgWidth + "px";
    let offsetY = cnf.chart.sparkline.enabled
      ? 0
      : gl.axisCharts
      ? cnf.chart.parentHeightOffset
      : 0

    gl.dom.Paper.node.parentNode.parentNode.style.minHeight =
      gl.svgHeight + offsetY + 'px'

    gl.dom.elWrap.style.width = gl.svgWidth + 'px'
    gl.dom.elWrap.style.height = gl.svgHeight + 'px'
  }

  shiftGraphPosition() {
    let gl = this.w.globals

    let tY = gl.translateY
    let tX = gl.translateX

    let scalingAttrs = {
      transform: 'translate(' + tX + ', ' + tY + ')'
    }
    Graphics.setAttrs(gl.dom.elGraphical.node, scalingAttrs)
  }

  // To prevent extra spacings in the bottom of the chart, we need to recalculate the height for pie/donut/radialbar charts
  resizeNonAxisCharts() {
    const w = this.w

    const gl = w.globals

    let legendHeight = 0
    let offY = 20

    if (
      w.config.legend.position === 'top' ||
      w.config.legend.position === 'bottom'
    ) {
      legendHeight = new Legend(this.ctx).getLegendBBox().clwh + 10
    }

    let radialEl = w.globals.dom.baseEl.querySelector(
      '.apexcharts-radialbar .apexcharts-tracks'
    )

    let radialElDataLabels = w.globals.dom.baseEl.querySelector(
      '.apexcharts-radialbar .apexcharts-datalabels-group'
    )

    let chartInnerDimensions = w.globals.radialSize * 2

    if (radialEl) {
      let elRadialRect = Utils.getBoundingClientRect(radialEl)
      chartInnerDimensions = elRadialRect.bottom

      if (radialElDataLabels) {
        let elRadialDataLalelsRect = Utils.getBoundingClientRect(
          radialElDataLabels
        )

        let maxHeight =
          Math.max(elRadialRect.bottom, elRadialDataLalelsRect.bottom) -
          elRadialRect.top +
          elRadialDataLalelsRect.height

        chartInnerDimensions = Math.max(w.globals.radialSize * 2, maxHeight)
      }
    }

    const newHeight = chartInnerDimensions + gl.translateY + legendHeight + offY

    if (gl.dom.elLegendForeign) {
      gl.dom.elLegendForeign.setAttribute('height', newHeight)
    }

    gl.dom.elWrap.style.height = newHeight + 'px'

    Graphics.setAttrs(gl.dom.Paper.node, {
      height: newHeight
    })

    gl.dom.Paper.node.parentNode.parentNode.style.minHeight = newHeight + 'px'
  }

  /*
   ** All the calculations for setting range in charts will be done here
   */
  coreCalculations() {
    const range = new Range(this.ctx)
    range.init()
  }

  resetGlobals() {
    const resetxyValues = () => {
      return this.w.config.series.map((s) => {
        return []
      })
    }

    let gl = this.w.globals
    gl.series = []
    gl.seriesCandleO = []
    gl.seriesCandleH = []
    gl.seriesCandleL = []
    gl.seriesCandleC = []
    gl.seriesRangeStart = []
    gl.seriesRangeEnd = []
    gl.seriesRangeBarTimeline = []
    gl.seriesPercent = []
    gl.seriesX = []
    gl.seriesZ = []
    gl.seriesNames = []
    gl.seriesTotals = []
    gl.stackedSeriesTotals = []
    gl.labels = []
    gl.timelineLabels = []
    gl.noLabelsProvided = false
    gl.timescaleTicks = []
    gl.resizeTimer = null
    gl.selectionResizeTimer = null
    gl.seriesXvalues = resetxyValues()
    gl.seriesYvalues = resetxyValues()
    gl.delayedElements = []
    gl.pointsArray = []
    gl.dataLabelsRects = []
    gl.isXNumeric = false
    gl.isDataXYZ = false
    gl.maxY = -Number.MAX_VALUE
    gl.minY = Number.MIN_VALUE
    gl.minYArr = []
    gl.maxYArr = []
    gl.maxX = -Number.MAX_VALUE
    gl.minX = Number.MAX_VALUE
    gl.initialmaxX = -Number.MAX_VALUE
    gl.initialminX = Number.MAX_VALUE
    gl.maxDate = 0
    gl.minDate = Number.MAX_VALUE
    gl.minZ = Number.MAX_VALUE
    gl.maxZ = -Number.MAX_VALUE
    gl.minXDiff = Number.MAX_VALUE
    gl.yAxisScale = []
    gl.xAxisScale = null
    gl.xAxisTicksPositions = []
    gl.yLabelsCoords = []
    gl.yTitleCoords = []
    gl.xRange = 0
    gl.yRange = []
    gl.zRange = 0
    gl.dataPoints = 0
  }

  setupBrushHandler() {
    const w = this.w

    // only for brush charts
    if (!w.config.chart.brush.enabled) {
      return
    }

    // if user has not defined a custom function for selection - we handle the brush chart
    // otherwise we leave it to the user to define the functionality for selection
    if (typeof w.config.chart.events.selection !== 'function') {
      let targets = w.config.chart.brush.targets || [
        w.config.chart.brush.target
      ]
      // retro compatibility with single target option
      targets.forEach((target) => {
        let targetChart = ApexCharts.getChartByID(target)
        targetChart.w.globals.brushSource = this.ctx

        let updateSourceChart = () => {
          this.ctx._updateOptions(
            {
              chart: {
                selection: {
                  xaxis: {
                    min: targetChart.w.globals.minX,
                    max: targetChart.w.globals.maxX
                  }
                }
              }
            },
            false,
            false
          )
        }
        if (typeof targetChart.w.config.chart.events.zoomed !== 'function') {
          targetChart.w.config.chart.events.zoomed = () => {
            updateSourceChart()
          }
        }
        if (typeof targetChart.w.config.chart.events.scrolled !== 'function') {
          targetChart.w.config.chart.events.scrolled = () => {
            updateSourceChart()
          }
        }
      })

      w.config.chart.events.selection = (chart, e) => {
        targets.forEach((target) => {
          let targetChart = ApexCharts.getChartByID(target)
          let yaxis = Utils.clone(w.config.yaxis)
          if (w.config.chart.brush.autoScaleYaxis) {
            const scale = new Scales(targetChart)
            yaxis = scale.autoScaleY(targetChart, yaxis, e)
          }
          targetChart._updateOptions(
            {
              xaxis: {
                min: e.xaxis.min,
                max: e.xaxis.max
              },
              yaxis
            },
            false,
            false,
            false,
            false
          )
        })
      }
    }
  }
}
