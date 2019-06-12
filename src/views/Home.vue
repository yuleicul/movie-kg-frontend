<template>
  <div class="home">
    <div class="filter"></div>

    <div class="head" :style="{top: this.headTop}">
      <div>
        <h1 class="title" v-if="showTitle">电影图谱</h1>
        <p class="summary" v-if="showTitle">
          找寻电影
          <i class="el-icon-film"/> 与人物
          <i class="el-icon-user"/> 的关系
        </p>
      </div>
      <div class="search-container">
        <el-input
          placeholder="请输入关键词，例如周润发"
          prefix-icon="el-icon-search"
          v-model="searchKey"
          @keyup.enter.native="search"
          :style="{width: '500px'}"
        ></el-input>
      </div>
      <!-- <button @click="search">搜索</button> -->
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
              <el-checkbox :label="item[nodeTextKey]"></el-checkbox>
              <!-- <input type="checkbox"  :id="item.id" v-model="highlightNodes" :value="item.id" class="checkbox"> -->
              <!-- <label :for="item.id" :style="{color: 'blue'}">{{item[nodeTextKey]}}</label> -->
              <!-- <input type="checkbox" name="d" :id="item.id" v-model="highlightNodes" :value="item.id">{{item[nodeTextKey]}} -->
              <!-- <el-button type="text" @click="clickTreeNode(item.id)">{{item[nodeTextKey]}}</el-button> -->
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
          <el-checkbox-group v-model="highlightNodes">
            <template v-if="personData">
              <div v-for="item in personData" :key="item.id" class="text item">
                <el-checkbox :label="item[nodeTextKey]"></el-checkbox>
              </div>
            </template>
            <p v-else :style="{color: 'gray', 'font-size':'14px'}">无数据</p>
          </el-checkbox-group>
        </el-card>
      </div>
      <div class="network-container">
        <network
          :nodeList="nodes"
          :linkList="links"
          :nodeSize="nodeSize"
          :nodeTextKey="nodeTextKey"
          :nodeTextFrontSize="nodeTextFrontSize"
          :linkWidth="linkWidth"
          :showLinkText="showLinkText"
          :linkTextKey="linkTextKey"
          :linkTextFrontSize="linkTextFrontSize"
          :linkDistance="linkDistance"
          :svgSize="svgSize"
          :svgTheme="svgTheme"
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
      //
      nodeSize: 20,
      nodeTextKey: "id",
      nodeTextFrontSize: 20,
      //
      linkWidth: 2,
      showLinkText: false,
      linkTextKey: "value",
      linkTextFrontSize: 10,
      linkDistance: 100,
      //
      svgSize: {
        width: 900,
        height: 700
      },
      svgTheme: "dark",
      nodeIds: [], // 用于判断重复节点
      // canRender: true,
      // mode: "light" // dark or light
      // queryWords: ""
      searchKey: "",
      headTop: "30%",
      showContent: false,
      showTitle: true,
      highlightNodes: []
    };
  },
  computed: {
    // treeProps() {
    //   return { children: "children", label: this.nodeTextKey };
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
      console.log(newValue);
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
      this.headTop = "10px";
      this.showContent = true;
      this.showTitle = false;
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
  background-repeat: repeat;
  overflow: hidden;
}

.filter {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.37);
}

.head {
  width: 400px;
  position: absolute;
  /* top: 30%; */
  left: 32%;
  color: rgb(255, 255, 255);
  /* margin: 0 auto; */
}
.content {
  position: absolute;
  /* left: 50%; */
  /* width: 100%; */
  /* height: 100%; */
  top: 80px;
  display: flex;
}
.card-container {
  /* box-sizing: border-box; */
  flex: 1;

  margin-left: 60px;
  /* background-color: blue; */
}

.box-card {
  /* color: white; */
  /* border: 10px solid rgb(160, 160, 160); */

  overflow: auto;
  position: relative;
  width: 380px;
  max-height: 700px;
  background-color: rgb(255, 255, 255);
  box-shadow: 20px 20px 20px rgb(218, 56, 56);
}

.rate-star {
  /* padding: 12px; */
  color: orange;
  position: absolute;
  right: 30px;
}

.network-container {
  flex: 2;
  margin: 0 30px;
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

.title {
  font-size: 50px;
  letter-spacing: 3px;
  text-shadow: 0 0 5px black;
}

.el-icon-film,
.el-icon-user {
  font-weight: bold;
  color: chocolate;
}

.search-container {
  width: 500px;
  padding: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}
.head-enter-active,
.head-leave-active {
  transition: opacity 0.5s;
}
.head-enter, .head-leave-to /* .head-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
