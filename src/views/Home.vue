<template>
  <div class="home">
    <button @click="addOneNode">加一个结点</button>
    <network
      v-if="canRender"
      :nodes="nodes"
      :links="links"
      :nodeProps="nodeProps"
      :linkProps="linkProps"
      @hoverLink="hoverLink"
    ></network>
  </div>
</template>

<script>
// @ is an alias to /src
import Network from "@/components/Network";
import axios from "axios";

export default {
  name: "home",
  components: {
    Network
  },
  data() {
    return {
      showLinkText: false,
      nodes: [],
      links: [],
      nodeProps: {
        nodeSize: 10,
        showNodeText: false,
        textKey: "id",
        textFrontSize: 10
      },
      linkProps: {
        linkWidth: 3,
        showLinkText: false,
        textKey: "value",
        textFrontSize: 10,
        linkDistance: 40
      },
      // nodeIds: [], // 用于判断重复节点
      canRender: true,
      // mode: "light" // dark or light
      // queryWords: ""
      id: 0
    };
  },
  created() {
    axios
      .get("/example.json")
      .then(response => {
        this.nodes = response.data.nodes;
        this.links = response.data.links;
        // this.canRender = true;
      })
      .catch(err => console.log(err));
  },
  methods: {
    hoverLink(e) {
      console.log(e)
    },
    addOneNode() {
      this.nodes.push({
        id: this.id++,
        group: '1'
      })
    }
  },
};
</script>

<style scoped>
</style>
