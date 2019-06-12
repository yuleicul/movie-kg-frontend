<template>
  <div id="network" :style="{width: svgSize.width +'px', height: svgSize.height+'px'}">
    <!-- <button id="reset-button" @click="reset">reset</button> -->
    <div
      class="linkText"
      :style="linkTextPosition"
      v-show="linkTextVisible"
      v-text="linkTextContent"
    ></div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      :width="svgSize.width"
      :height="svgSize.height"
      :style="{'background-color': theme.bgcolor}"
      @click="clickEle"
      @mousedown="svgMousedown"
      @mouseup="svgMouseup"
      @mouseover.prevent="svgMouseover"
      @mouseout="svgMouseout"
    >
      <g id="container">
        <!-- links and link-text 注：先绘制边 -->
        <g>
          <g v-for="link in links" :key="link.index">
            <line
              :class="`${link.type} ${link.selected} link element`"
              :stroke="theme.linkStroke"
              :stroke-width="linkWidth"
            ></line>
            <!-- dx dy 文字左下角坐标 -->
            <text
              v-if="showLinkText"
              dx="0"
              dy="0"
              class="link-text"
              :fill="theme.textFill"
              :font-size="linkTextFrontSize"
            >{{link[linkTextKey]}}</text>
          </g>
        </g>

        <!-- node and node-text -->
        <g id="node-group">
          <g v-for="node in nodes" :key="node.index">
            <circle
              :fill="nodeColor(node.type)"
              :stroke-width="highlightNodes.indexOf(node.id) == -1? 3:10"
              :stroke="highlightNodes.indexOf(node.id) == -1? theme.nodeStroke: 'gold' "
              :class="`${node.type} ${node.showText?'selected' : ''} node element`"
              :r="nodeSize"
            ></circle>
            <text
              v-show="node.showText"
              :dx="nodeSize"
              dy="0"
              class="node-text"
              :fill="theme.textFill"
              :font-size="nodeTextFrontSize"
            >{{node[nodeTextKey]}}</text>
          </g>
          <g></g>
        </g>
      </g>
    </svg>
  </div>
  <!-- </div> -->
</template>

<script>
import * as d3 from "d3"; // 先这样导入 最后优化的时候要按需导入
import d3SelectionMulti from "d3-selection-multi";
import { setTimeout } from "timers";

// const d3 = Object.assign({}, d3Origin, d3SelectionMulti)

// let x = 0,
//   y = 0,
//   s = 1; // 记录缩放导致的位置偏移

// 元素的 classList 是 DOMTokenList
DOMTokenList.prototype.indexOf = Array.prototype.indexOf;

export default {
  name: "network",
  props: {
    nodeList: Array,
    linkList: Array,
    // node
    nodeSize: {
      type: Number,
      default: 20
    },
    nodeTextKey: {
      type: String,
      default: "name"
    },
    nodeTextFrontSize: {
      type: Number,
      default: 20
    },
    // link
    linkWidth: {
      type: Number,
      default: 2
    },
    showLinkText: {
      type: Boolean,
      default: false
    },
    textKey: {
      type: String,
      default: "type"
    },
    linkTextFrontSize: {
      type: Number,
      default: 10
    },
    linkDistance: {
      type: Number,
      default: 100
    },
    // svg
    svgSize: {
      type: Object,
      default: () => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    },
    svgTheme: {
      type: String,
      default: "dark"
    }, // dark or light
    //
    highlightNodes: Array
  },
  data() {
    return {
      // svgSize: {
      //   width: "100%",
      //   height: "100%"
      // },
      // svgClass: {
      //   mouseup: true,
      //   mousedown: false
      // },
      selection: {
        links: [],
        nodes: []
      },
      pinned: [], // 被订住的中心节点的下标
      force: null,
      zoom: d3.zoom(),
      nodeColor: d3.scaleOrdinal(d3.schemeCategory10), // d3.scale.category20()
      linkTextVisible: false,
      linkTextPosition: {
        top: 0,
        left: 0
      },
      linkTextContent: ""
    };
  },
  computed: {
    //  // 是否渲染节点 - 懒加载
    // display(x, y) {
    //   // if (x > 0 && y > 0) {
    //   //   return true
    //   // }
    //   // else {
    //     console.log(x + ' ' + y)
    //   //   return false
    //   // }
    // },
    nodes() {
      // 去重
      let nodes = this.nodeList.slice();
      let nodeIds = [];

      nodes = nodes.filter(node => {
        if (nodeIds.indexOf(node.id) === -1) {
          // console.log(node.id);
          nodeIds.push(node.id);
          return true;
        } else {
          return false;
        }
      });

      // console.log(nodes);
      return nodes;
    },
    links() {
      return this.linkList;
    },
    theme() {
      if (this.svgTheme === "light") {
        return {
          bgcolor: "rgba(255, 255, 255, 0.8)",
          nodeStroke: "white",
          linkStroke: "gray",
          textFill: "black"
        };
      } else {
        return {
          bgcolor: "rgba(0, 0, 0, 0.5)",
          nodeStroke: "white",
          linkStroke: "rgba(255, 255, 255, 0.5)",
          textFill: "white"
        };
      }
    }
  },
  watch: {
    linkDistance: function() {
      this.$nextTick(function() {
      this.initData()
      })
    },
    nodes: function() {
      // this.rerender = false
      // this.rerender = true
      // this.force.stop()
      this.initData();
      // setTimeout( this.initDragTickZoom(), 1000)
      // d3.selectAll(".node").call();
      // d3.selectAll(".node").call(this.drag(this.force));
      // d3.selectAll(".node").call(this.drag(this.force));

      // this.$forceUpdate();

      // this.$forceUpdate();
      this.$nextTick(function() {
        // console.log("神奇");
        // 以下这个函数重新在 node 上调用了拖拽
        // 只有在 mounted 后才有用
        // 所以要使用 $nextTick
        this.initDragTickZoom();
      });
    }
  },
  // updated() {
  //   console.log("update")
  //     // d3.selectAll(".node").call(this.drag(this.force));

  // },
  created() {
    this.initData();
    // 初始化 zoom
    // this.zoom
    //   // .translate([0, 0]) // 初始位置
    //   // .scale(1) // 初始比例
    //   .scaleExtent([0.5, 4])
    //   .on("zoom", this.zoomed); //??? 直接写在<svg>上了不知是否ok
    // console.log("开始创建");
    // console.log(this.nodes);

    // let i = 0;
    // this.links.forEach(link => {
    //   link.id = i++;
    // });

    // 初始化 force 布局

    // .nodes(this.nodes)
    // .links(this.links)
    // .size([this.forceSize.width, this.forceSize.height]) //指定作用域范围
    // .linkDistance(50) //指定连线长度
    // .friction(0.9)
    // .charge([-200]) //相互之间的作用力
    // .gravity(0.2);
  },
  mounted() {
    // console.log("mounted");
    this.initDragTickZoom();
  },
  // updated() {
  // console.log("有数据更新")
  // console.log("节点更新了")
  // if (this.nodes)
  // this.initData()
  // this.initDragTickZoom()
  // },
  methods: {
    initData() {
      this.force = d3
        .forceSimulation(this.nodes)
        .force(
          "link",
          d3
            .forceLink(this.links)
            .id(d => d.id)
            .distance(this.linkDistance)
          // .strength(100)
        )
        //.force("charge", d3.forceManyBody())
        // .linkDistance(50) //指定连线长度

        .force("charge", d3.forceManyBody().strength(-this.nodeSize * 15)) //The strength of the attraction or repulsion
        // .forceCollide(2)
        .force(
          "center",
          d3.forceCenter(this.svgSize.width / 2, this.svgSize.height / 2)
        );
      // .alphaDecay(0.5) //设置 alpha 衰减率.迭代150，默认0.0228

      // this.force.start(); //开始作用

      console.log(this.nodes);
      console.log(this.links);
    },
    initDragTickZoom() {
      // 给节点添加拖拽
      d3.selectAll(".node").call(this.drag(this.force));
      // 更新坐标 - 更新坐标 - 每一个 tick

      this.force
        //  .nodes(this.nodes)

        //  .force("link")
        // .links(this.links)
        .on("tick", () => {
          //更新连线坐标
          d3.selectAll(".link")
            .data(this.links)
            .attrs({
              x1: d => d.source.x,
              y1: d => d.source.y,
              x2: d => d.target.x,
              y2: d => d.target.y
            });

          //       //  link
          //     .attr("x1", d => d.source.x)
          //     .attr("y1", d => d.source.y)
          //     .attr("x2", d => d.target.x)
          //     .attr("y2", d => d.target.y);

          // // node

          //更新节点坐标
          d3.selectAll(".node")
            .data(this.nodes)
            .attrs({
              cx: d => d.x,
              cy: d => d.y
            });
          // 更新文字坐标
          d3.selectAll(".node-text")
            .data(this.nodes)
            .attrs({
              x: d => d.x,
              y: d => d.y
            });
          d3.selectAll(".link-text")
            .data(this.links)
            .attrs({
              x: d => (d.source.x + d.target.x) / 2,
              y: d => (d.source.y + d.target.y) / 2
            });
        });

      // // 初始化 zoom
      this.zoom
        // .translate([0, 0]) // 初始位置
        // .scale(1) // 初始比例
        .scaleExtent([0.5, 4])
        .on("zoom", this.zoomed); //??? 直接写在<svg>上了不知是否ok

      d3.select("svg")
        .call(this.zoom)
        .on("dblclick.zoom", null);
      // .call(this.zoom.event);
    },
    clickLink(e) {
      this.$emit("clickLink", e);
      // console.log("嘿，点击边了");
      // let link = e.target.__data__;
      // console.log(link.source.name + " vs " + link.target.name);
      // this.showDetails(link.source.name + " vs " + link.target.name);
    },
    clickNode(e) {
      // if (e.target.tagName === "circle") {
      // 阻止鼠标按下事件向下传播 -> 防止触发 zoom 的拖拽
      // e.stopImmediatePropagation();
      if (this.pinned.length === 0) {
        this.pinnedState(e);
      } else {
        d3.selectAll(".element").styles({
          opacity: 0.2
        });
        this.pinned = [];
      }
      this.$emit("clickNode", e);
      // }
    },
    clickEle(e) {
      if (e.target.tagName === "circle") {
        this.clickNode(e);
      } else if (e.target.tagName === "line") {
        this.clickLink(e);
      }
    },
    svgMousedown(e) {
      // 这个监听器只能监听到非节点的内容
      // 改变鼠标样式
      // console.log("鼠标按下");
      // e.stopImmediatePropagation();
      // this.svgClass.mouseup = false;
      // this.svgClass.mousedown = true;
    },
    svgMouseup() {
      // 改变鼠标样式
      // console.log("鼠标放");
      // this.svgClass.mouseup = true;
      // this.svgClass.mousedown = false;
    },
    svgMouseover(e) {
      if (e.target.nodeName === "circle") {
        if (this.pinned.length === 0) {
          this.selectedState(e);
        }
        // 强制刷新
        this.$forceUpdate();
        this.$emit("hoverNode", e.target);
      } else if (e.target.nodeName === "line") {
        // console.log("嘿 hover 边");
        // console.log("坐标：");
        // console.log(e.clientX + ", " + e.clientY);
        // let link = e.target.__data__;
        // console.log(link[this.textKey])
        this.linkTextPosition = {
          left: e.clientX + "px",
          top: e.clientY - 50 + "px"
        };
        this.linkTextContent = e.target.__data__.value;
        this.linkTextVisible = true;
        // setTimeout(() => {
        //   this.linkTextVisible = false;
        // }, 3000);
        this.$emit("hoverLink", e); // e / e.target.__data__
      }
    },
    svgMouseout(e) {
      this.linkTextVisible = false;
      if (e.target.nodeName === "circle") {
        if (this.pinned.length === 0) {
          this.noSelectedState(e);
        }
        // 强制刷新
        this.$forceUpdate();
      }
    },
    selectedState(e) {
      // 节点自身显示文字、增加 selected class、添加进 selection
      e.target.__data__.showText = true;
      e.target.classList.add("selected");
      this.selection.nodes.push(e.target.__data__);
      // 周围节点显示文字、边和结点增加 selected class、添加进 selection
      this.lightNeibor(e.target.__data__);
      // 除了 selected 的其余节点透明度减小
      d3.selectAll(".element").styles({
        opacity: 0.2
      });
    },
    noSelectedState(e) {
      // 节点自身不显示文字、移除 selected class
      e.target.__data__.showText = false;
      // e.target.classList.remove("selected");
      // 周围节点不显示文字、边和结点移除 selected class
      this.darkenNerbor();
      // 所有节点透明度恢复
      d3.selectAll(".element").styles({
        opacity: 1
      });
    },
    pinnedState(e) {
      this.pinned.push(e.target.__data__.index);
      d3.selectAll(".element").styles({
        opacity: 0.05
      });
    },
    lightNeibor(node) {
      this.links.forEach(link => {
        if (link.source.index === node.index) {
          link.selected = "selected";
          this.selection.links.push(link);
          this.selection.nodes.push(link.target);
          this.lightNode(link.target);
        }
        if (link.target.index === node.index) {
          link.selected = "selected";
          this.selection.links.push(link);
          this.selection.nodes.push(link.source);
          this.lightNode(link.source);
        }
      });
    },
    lightNode(selectedNode) {
      this.nodes.forEach(node => {
        if (node.index === selectedNode.index) {
          node.showText = true;
        }
      });
    },
    darkenNerbor() {
      this.links.forEach(link => {
        this.selection.links.forEach(selectedLink => {
          if (selectedLink.id === link.id) {
            link.selected = "";
          }
        });
      });
      this.nodes.forEach(node => {
        this.selection.nodes.forEach(selectednode => {
          if (selectednode.id === node.id) {
            node.showText = false;
          }
        });
      });
      // 清空 selection
      this.selection.nodes = [];
      this.selection.links = [];
    },
    showDetails(query) {
      // const query = resolveQueryFromLink(link.fromId, link.toId);
      window.open(
        "https://google.com/search?q=" + encodeURIComponent(query),
        "_blank"
      );
    },
    zoomed() {
      // 缩放中：以鼠标所在的位置为中心
      // console.log(d3.event);
      // x = d3.event.transform.x;
      // y = d3.event.transform.y;
      // s = d3.event.transform.k;
      d3.select("#container").attr(
        "transform",
        "translate(" +
          d3.event.transform.x +
          "," +
          d3.event.transform.y +
          ") scale(" +
          d3.event.transform.k +
          ")"
      );
    },
    drag(simulation) {
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    // reset() {
    //   let zoom = this.zoom;
    //   d3.transition()
    //     .duration(250)
    //     .tween("zoom", function() {
    //       let si = d3.interpolate(s, 1);
    //       let xi = d3.interpolate(x, 0);
    //       let yi = d3.interpolate(y, 0);
    //       return function(t) {
    //         console.log(zoom);
    //         d3.select("svg").call(
    //           // zoom.transform([si(t),xi(t),yi(t)])
    //           zoom.translate([xi(t), yi(t)]).scale(si(t)).event
    //         );
    //       };
    //     });
    // }
  }
};
</script>

<style scoped>
#network {
  /* width: 100%;
  height: 100%; */
}
svg {
  /* border: 1px solid #000; */
  border-radius: 5px;
  /* background-color:aliceblue */
}
/* svg.mouseup {
  cursor: -webkit-grab;
} */
/* svg.mousedown {
  cursor: -webkit-grabbing;
} */
.element {
  transition: opacity 0.5s ease;
}
.selected {
  opacity: 1 !important;
}
/* .pinned {
  opacity: 1 !important;
} */
.link {
  /* stroke: 'gray';
  stroke-width: 1; */
}
.link-text {
  /* fill: "gray";
  font-size: 10; */
}
.node,
.link {
  /* fill: "darkcyan"; 在 css 里使用不如在代码中使用权重高 */
  cursor: pointer;
}
.node-text {
  /* fill: "gray";
  font-size: 10; */
}
/* #reset-button {
  position: absolute;
} */

.linkText {
  position: absolute;
  z-index: 10;
  /* width: 5px; */
  /* height: 40px; */
  background-color: rgba(75, 75, 75, 0.596);
  border-radius: 10px;
  color: white;
  padding: 10px;
}
</style>

