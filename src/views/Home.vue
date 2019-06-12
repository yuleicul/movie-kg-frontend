<template>
  <div class="home">
    <div class="filter"></div>
    <div class="head" :style="{top: this.headTop}">
      <div class="title">
        <h1>电影图谱</h1>
      </div>
      <div>
        <input type="text" v-model="searchKey" @keyup.enter="search">
        <button @click="search">搜索</button>
      </div>
    </div>
    <div v-if="showContent" class="content">
      <div class="card-container">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>搜索结果</span>
          </div>
          <!-- <el-tree :data="treeData" :props="treeProps" @node-click="handleNodeClick"></el-tree> -->

          <h3>电影</h3>
          <el-checkbox-group v-model="highlightNodes">
          <div v-for="item in movieData" :key="item.id" class="item">
            <el-checkbox :label="item[nodeProps.textKey]"></el-checkbox>
            <!-- <input type="checkbox"  :id="item.id" v-model="highlightNodes" :value="item.id" class="checkbox"> -->
            <!-- <label :for="item.id" :style="{color: 'blue'}">{{item[nodeProps.textKey]}}</label> -->
            <!-- <input type="checkbox" name="d" :id="item.id" v-model="highlightNodes" :value="item.id">{{item[nodeProps.textKey]}} -->
            <!-- <el-button type="text" @click="clickTreeNode(item.id)">{{item[nodeProps.textKey]}}</el-button> -->
            <span v-if="item.rate" class="rate-star">
              <i class="el-icon-star-on" v-if="item.rate >= 2"></i>
              <i class="el-icon-star-off" v-else></i>
              <i class="el-icon-star-on" v-if="item.rate >= 4"></i>
              <i class="el-icon-star-off" v-else></i>
              <i class="el-icon-star-on" v-if="item.rate >= 6"></i>
              <i class="el-icon-star-off" v-else></i>
              <i class="el-icon-star-on" v-if="item.rate >= 8"></i>
              <i class="el-icon-star-off" v-else></i>
              <i class="el-icon-star-on" v-if="item.rate >= 9.5"></i>
              <i class="el-icon-star-off" v-else></i>
              {{ item.rate.toFixed(1) }}
            </span>
          </div>
          </el-checkbox-group>
          <el-divider></el-divider>
          <h3>人物</h3>
          <div v-for="item in personData" :key="item.id" class="text item">
            <!-- <el-button type="text" @click="clickTreeNode(item.id)">{{item[nodeProps.textKey]}}</el-button> -->
          </div>
        </el-card>
      </div>
      <div class="network-container">
        <network
          :nodeList="nodes"
          :linkList="links"
          :nodeProps="nodeProps"
          :linkProps="linkProps"
          :highlightNodes="highlightNodes"
          @clickNode="clickNode"
        ></network>
      </div>
    </div>
  </div>
</template>

<script>
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
        nodeSize: 20,
        showNodeText: false,
        textKey: "id",
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
      // canRender: true,
      // mode: "light" // dark or light
      // queryWords: ""
      searchKey: "",
      headTop: "30%",
      showContent: false, 
      highlightNodes: []
    };
  },
  computed: {
    // treeProps() {
    //   return { children: "children", label: this.nodeProps.textKey };
    // },
    // treeData() {
    //   let movieItem = {};
    //   movieItem[this.treeProps.children] = this.treeMovieData;
    //   movieItem[this.treeProps.label] = "电影";
    //   let personItem = {};
    //   personItem[this.treeProps.children] = this.treePersonData;
    //   personItem[this.treeProps.label] = "人物";

    //   return [movieItem, personItem];
    // },
    personData() {
      return this.nodes.filter(node => {
        return node.type === "Person";
      });
    },
    movieData() {
      return this.nodes.filter(node => {
        return node.type === "Movie";
      });
    }
  },
  watch: {
    highlightNodes(newValue) {
      console.log(newValue)
    }
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
    // this.searchKey = this.$route.params.keyWord
    // this.search()
  },
  methods: {
    // clickTreeNode(id) {
    //   this.highlightNodeId = id
    // },
    search() {
      this.headTop = "10%";
      this.showContent = true;
      // axios
      //   .get(`/api/${this.searchKey}`)
      //   .then(res => {
      //     console.log(res.data);
      //     if (res.data.status === true) {
      //       this.nodes = res.data.entity.nodes;
      //       this.links = res.data.entity.links;
      //     } else {
      //       console.log("找不到");
      //     }
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });
    },
    clickNode(e) {
      // console.log(e)
      if (e.detail === 2) {
        let name = e.target.__data__.name;
        axios
          .get(`/api/${name}`)
          .then(res => {
            console.log(res.data);
            if (res.data.status === true) {
              this.nodes = this.nodes.concat(res.data.entity.nodes);
              this.links = this.links.concat(res.data.entity.links);
            } else {
              console.log("找不到");
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
ul {
  list-style-type: none;
}
.home {
  background-image: url(/bg.jpg);
}

.filter {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(80, 72, 0, 0.178);
}

.head {
  width: 400px;
  position: absolute;
  /* top: 30%; */
  left: 50%;
  color: rgb(255, 255, 255);
  /* margin: 0 auto; */
}
.content {
  position: absolute;
  /* left: 50%; */
  width: 100%;
  height: 100%;
  top: 30%;
  display: flex;
}
.card-container {
  
  /* box-sizing: border-box; */
  flex: 1;

  /* padding-left: 20px; */
  /* background-color: blue; */
}

.box-card {
  position: relative;
  width: 380px;
}

.rate-star {
  /* padding: 12px; */
  color: orange;
  position: absolute;
  right: 30px;
}

.network-container {
  flex: 2;
}

.item {
  font-size: 14px;
  margin-bottom: 12px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}


.checkbox {
  width: 60%;
  position: absolute;
  cursor: pointer;
  background-color: blue;
  /* -webkit-appearance:listbox */
  /* opacity: 0; */
}
.checkbox:checked {
  background: blue;
}
</style>
