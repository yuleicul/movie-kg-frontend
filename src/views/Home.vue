<template>
  <div class="home">
    <div class="filter"></div>

    <div class="index" v-if="!showMain">
      <div>
        <h1 class="title">电影图谱</h1>
        <p class="summary">
          找寻电影
          <i class="el-icon-film"/> 与人物
          <i class="el-icon-user"/> 的关系
        </p>
      </div>
      <div class="search-container">
        <el-input
          :autofocus="true"
          placeholder="请输入关键词，例如周润发"
          prefix-icon="el-icon-search"
          v-model="searchKey"
          @keyup.enter.native="search"
          :style="{width: '500px'}"
        ></el-input>
      </div>
      <!-- <button @click="search">搜索</button> -->
    </div>

    <div class="main" v-if="showMain">
      <div class="head">
        <div class="logo">
          <h1>电影图谱</h1>
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

        <div class="labels">
          <el-button type="primary" plain size="small" @click="searchByTag('周润发')">周润发</el-button>
          <el-button type="primary" plain size="small" @click="searchByTag('加勒比海盗')">加勒比海盗</el-button>
          <el-button type="primary" plain size="small" @click="searchByTag('成龙')">成龙</el-button>
          <el-button type="primary" plain size="small" @click="getHighRateMovies">豆瓣高分电影</el-button>
          <el-button type="primary" plain size="small" @click="getPeopleFilmMost">拍电影数量最多的演员是谁？</el-button>
        </div>

        <el-button icon="el-icon-s-operation" circle @click="showSettingCard=!showSettingCard"></el-button>
      </div>

      <el-card class="setting-box-card" v-if="showSettingCard">
        <div slot="header" class="clearfix">
          <span>设置</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="showSettingCard=!showSettingCard"
          >关闭</el-button>
        </div>节点大小
        <el-slider v-model="nodeSize" show-input :max="50"></el-slider>连线宽度
        <el-slider v-model="linkWidth" show-input :max="20"></el-slider>连线长度
        <el-slider v-model="linkDistance" show-input :max="300" :step="50" show-stops></el-slider>作用力
        <el-slider v-model="bodyStrength" show-input :min="-1000" :max="0" :step="50" show-stops></el-slider>
        <br>
        <div>
          <el-switch v-model="svgTheme" active-text="黑暗模式" inactive-text="明亮模式"></el-switch>
        </div>
      </el-card>

      <div class="content">
        <div class="card-container">
          <el-card class="result-box-card">
            <div slot="header" class="clearfix">
              <span>搜索结果</span>
            </div>
            <!-- <el-tree :data="treeData" :props="treeProps" @node-click="handleNodeClick"></el-tree> -->

            <h3>电影</h3>
            <el-checkbox-group v-model="highlightNodes">
              <template v-if="movieData.length">
                <div v-for="item in movieData" :key="item.id" class="item">
                  <el-checkbox :label="item.id">
                    <span class="item-name">{{item[nodeTextKey]}}</span>
                  </el-checkbox>
                  <span v-if="item.rating" class="rate-star">
                    <i class="el-icon-star-on" v-if="item.rating >= 2"></i>
                    <i class="el-icon-star-off" v-else></i>
                    <i class="el-icon-star-on" v-if="item.rating >= 4"></i>
                    <i class="el-icon-star-off" v-else></i>
                    <i class="el-icon-star-on" v-if="item.rating >= 6"></i>
                    <i class="el-icon-star-off" v-else></i>
                    <i class="el-icon-star-on" v-if="item.rating >= 8"></i>
                    <i class="el-icon-star-off" v-else></i>
                    <i class="el-icon-star-on" v-if="item.rating >= 9.5"></i>
                    <i class="el-icon-star-off" v-else></i>
                    {{ item.rating }}
                  </span>
                </div>
              </template>
              <p v-else :style="{color: 'gray', 'font-size':'14px'}">无数据</p>
            </el-checkbox-group>
            <el-divider></el-divider>

            <h3>人物</h3>
            <el-checkbox-group v-model="highlightNodes">
              <template v-if="personData.length">
                <div v-for="item in personData" :key="item.id" class="text item">
                  <el-checkbox :label="item.id" class="item-name">{{item[nodeTextKey]}}</el-checkbox>
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
            :nodeTypeKey="nodeTypeKey"
            :nodeTextFontSize="nodeTextFontSize"
            :linkWidth="linkWidth"
            :showLinkText="showLinkText"
            :linkTextKey="linkTextKey"
            :linkTextFrontSize="linkTextFrontSize"
            :linkDistance="linkDistance"
            :svgSize="svgSize"
            :svgTheme="svgTheme?'dark':'light'"
            :bodyStrength="bodyStrength"
            :highlightNodes="highlightNodes"
            @clickNode="clickNode"
          ></network>
        </div>
      </div>
      <!-- <div v-if="showNothingFound" class="nothing-found"> -->
      <!-- <div v-else class="nothing-found">
        <i class="el-icon-circle-close"/>
        没有找到任何内容
      </div>-->
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
      nodes: [],
      links: [],
      // node
      nodeSize: 14,
      nodeTextKey: "name",
      nodeTypeKey: "type",
      // nodeTextFontSize: 14,
      // link
      linkWidth: 2,
      showLinkText: false,
      linkTextKey: "value",
      linkTextFrontSize: 10,
      linkDistance: 150,
      // svg
      svgSize: {
        width: 950,
        height: 700
      },
      svgTheme: true, // dark
      bodyStrength: -50,
      nodeIds: [], // 用于判断重复节点
      searchKey: "",
      showMain: false,
      highlightNodes: [],
      showSettingCard: false
    };
  },
  computed: {
    nodeTextFontSize() {
      if (this.nodeSize >= 10) {
        return this.nodeSize;
      } else return 10;
    },
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
    // axios
    //   .get("/example.json")
    //   .then(response => {
    //     this.nodes = response.data.nodes;
    //     this.links = response.data.links;
    //     // this.canRender = true;
    //   })
    //   .catch(err => console.log(err));
    // this.searchKey = this.$route.params.keyWord
    // this.search()
  },
  methods: {
    getPeopleFilmMost() {
      this.searchKey = "";
      axios
        .get("/api/people/filmmost")
        .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = res.data.entity.nodes;
            // nodes 去重
            this.clearDup();
            this.links = res.data.entity.links;
            // this.showContent = true;
          } else {
            console.log("没有找到拍电影最多的演员");
            // this.showContent = true;
            this.nodes = [];
            this.links = [];
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    getHighRateMovies() {
      this.searchKey = "";
      axios
        .get(`/api/movies/highrate`)
        .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = res.data.entity.nodes;
            // nodes 去重
            this.clearDup();
            this.links = res.data.entity.links;
            // this.showContent = true;
          } else {
            console.log("没有高分电影");
            // this.showContent = true;
            this.nodes = [];
            this.links = [];
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    searchByTag(key) {
      this.searchKey = key;
      this.search();
    },
    clearDup() {
      let nodes = this.nodes.slice();
      let nodeIds = [];

      this.nodes = nodes.filter(node => {
        if (nodeIds.indexOf(node.id) === -1) {
          // console.log(node.id);
          nodeIds.push(node.id);
          return true;
        } else {
          return false;
        }
      });

      // return nodes;
    },
    // clickTreeNode(id) {
    //   this.highlightNodeId = id
    // },
    search() {
      // this.headMoveX = "-200px";
      // this.headMoveY = "-230px";
      this.showMain = true;
      // this.showNothingFound = false;
      // this.showTitle = false;
      axios
        .get(`/api/${this.searchKey}`)
        .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = res.data.entity.nodes;
            // nodes 去重
            this.clearDup();
            this.links = res.data.entity.links;
            // this.showContent = true;
          } else {
            console.log("找不到");
            // this.showContent = true;
            this.nodes = [];
            this.links = [];
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    clickNode(e, nodeObj) {
      // console.log(e)
      if (e.detail === 2) {
        let name = nodeObj.name;
        console.log(nodeObj.name)
        axios
          .get(`/api/${name}`)
          .then(res => {
            console.log(res.data);
            if (res.data.status === true) {
              this.nodes = this.nodes.concat(res.data.entity.nodes);
              this.clearDup();
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
  /* background-color: gray; */
  background-image: url(/bg.jpg);
  -moz-background-size: 100% 100%;
  background-size: 100% 100%;
  /* background-repeat: repeat; */
  /* overflow: auto; */
}

.filter {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.37);
}

.index {
  width: 400px;
  position: absolute;
  top: 20%;
  left: 32%;
  color: rgb(255, 255, 255);
  /* margin: 0 auto; */
}

.main {
  position: absolute;
  width: 100%;
  overflow: auto;
}

.head {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.content {
  /* position: absolute; */
  /* left: 50%; */
  /* width: 100%; */
  /* height: 100%; */
  top: 80px;
  display: flex;
}
.card-container {
  /* box-sizing: border-box; */
  flex: 1;

  margin-left: 35px;
  /* background-color: blue; */
}

.result-box-card {
  /* color: white; */
  /* border: 10px solid rgb(160, 160, 160); */

  overflow: auto;
  position: relative;
  width: 380px;
  max-height: 700px;
}

.rate-star {
  margin-top: 5px;
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
  /* height: 40px; */
  width: 500px;
  padding: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}
/* .head-enter-active,
.head-leave-active {
  transition: opacity 0.5s;
}
.head-enter, .head-leave-to  {
  opacity: 0;
} */
/* .nothing-found {
  position: absolute;
  top: 150px;
  left: 46%;
  color: white;
  font-size: 14px;
} */

.setting-box-card {
  position: absolute;
  z-index: 10;
  overflow: auto;
  top: 15px;
  right: 15px;

  /* position: relative; */
  width: 380px;
  max-height: 700px;
}

.logo {
  /* letter-spacing: 3px; */
  color: white;
  text-shadow: 0 0 5px black;
}
.item-name {
  /* margin-top: 10px; */
  position: relative;
  top: 6px;
  display: block;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
