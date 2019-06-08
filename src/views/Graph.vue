<template>
  <div class="graph">
    <input type="text" v-model="searchKey">
    <button @click="searchButton">搜索</button>
    <network
      v-if="canRender"
      :nodeList="nodes"
      :linkList="links"
      :nodeProps="nodeProps"
      :linkProps="linkProps"
      @clickNode="clickNode"
    ></network>
  </div>
</template>

<script>
// @ is an alias to /src
import Network from "@/components/Network";
import axios from "axios";

export default {
  name: "graph",
  components: {
    Network
  },
  data() {
    return {
      showLinkText: false,
      nodes: [],
      links: [],
      nodeProps: {
        nodeSize: 20,
        showNodeText: false,
        textKey: "name",
        textFrontSize: 20
      },
      linkProps: {
        linkWidth: 2,
        showLinkText: false,
        textKey: "value",
        textFrontSize: 10,
        linkDistance: 100
      },
      nodeIds: [], // 用于判断重复节点
      canRender: true,
      // mode: "light" // dark or light
      // queryWords: ""
      searchKey: ""
    };
  },
  created() {
    // this.searchKey =this.$route.params.keyWord)
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
    searchButton() {
      axios
        .get(`/api/${this.searchKey}`)
        .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = res.data.entity.nodes;
            this.links = res.data.entity.links;
          }
          else {
            console.log("找不到")
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    clickNode(e) {
      // console.log(e)
      if (e.detail === 2) {
        let name = e.target.__data__.name
        axios.get(`/api/${name}`)
          .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = this.nodes.concat(res.data.entity.nodes);
            this.links = this.links.concat(res.data.entity.links);
          }
          else {
            console.log("找不到")
          }
        })
        .catch(err => {
          console.error(err);
        });
      }
    }
  }
};
</script>

<style scoped>
</style>
