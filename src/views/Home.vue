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
      <div class="cardContainer">
        <Card style="width:350px">
          <p slot="title">
            <Icon type="ios-film-outline"></Icon>Classic film
          </p>
          <ul>
            <li v-for="(item,index) in movieList" :key="index">
              <a :href="item.url" target="_blank">{{ item.name }}</a>
              <span>
                <!-- <Icon type="ios-star" v-for="n in 4" :key="n"></Icon> -->

                <Icon type="ios-star" v-if="item.rate >= 2"></Icon>
                <Icon type="ios-star-outline" v-else></Icon>
                <Icon type="ios-star" v-if="item.rate >= 4"></Icon>
                <Icon type="ios-star-outline" v-else></Icon>
                <Icon type="ios-star" v-if="item.rate >= 6"></Icon>
                <Icon type="ios-star-outline" v-else></Icon>
                <Icon type="ios-star" v-if="item.rate >=8"></Icon>
                <Icon type="ios-star-outline" v-else></Icon>
                <Icon type="ios-star" v-if="item.rate >= 9.5"></Icon>
                <Icon type="ios-star-half" v-else-if="item.rate >= 9"></Icon>
                <Icon type="ios-star-outline" v-else></Icon>
                {{ item.rate.toFixed(1) }}
              </span>
            </li>
          </ul>
        </Card>
      </div>
      <div class="networkContainer">
        <network
          :nodeList="nodes"
          :linkList="links"
          :nodeProps="nodeProps"
          :linkProps="linkProps"
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
      // canRender: true,
      // mode: "light" // dark or light
      // queryWords: ""
      searchKey: "",
      headTop: "30%",
      showContent: false,
      movieList: [
        {
          name: "The Shawshank Redemption",
          url: "https://movie.douban.com/subject/1292052/",
          rate: 6.0
        },
        {
          name: "Leon:The Professional",
          url: "https://movie.douban.com/subject/1295644/",
          rate: 4.0
        },
        {
          name: "Farewell to My Concubine",
          url: "https://movie.douban.com/subject/1291546/",
          rate: 9.5
        },
        {
          name: "Forrest Gump",
          url: "https://movie.douban.com/subject/1292720/",
          rate: 8.0
        },
        {
          name: "Life Is Beautiful",
          url: "https://movie.douban.com/subject/1292063/",
          rate: 9.5
        },
        {
          name: "Spirited Away",
          url: "https://movie.douban.com/subject/1291561/",
          rate: 9.2
        },
        {
          name: "Schindler's List",
          url: "https://movie.douban.com/subject/1295124/",
          rate: 8.5
        },
        {
          name: "The Legend of 1900",
          url: "https://movie.douban.com/subject/1292001/",
          rate: 9.2
        },
        {
          name: "WALL·E",
          url: "https://movie.douban.com/subject/2131459/",
          rate: 9.3
        },
        {
          name: "Inception",
          url: "https://movie.douban.com/subject/3541415/",
          rate: 9.2
        }
      ]
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
    // this.searchKey = this.$route.params.keyWord
    // this.search()
  },
  methods: {
    search() {
      this.headTop = "10%";
      this.showContent = true;
      axios
        .get(`/api/${this.searchKey}`)
        .then(res => {
          console.log(res.data);
          if (res.data.status === true) {
            this.nodes = res.data.entity.nodes;
            this.links = res.data.entity.links;
          } else {
            console.log("找不到");
          }
        })
        .catch(err => {
          console.error(err);
        });
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
.cardContainer {
  /* box-sizing: border-box; */
  flex: 1;
  padding-left: 20px;
  /* background-color: blue; */
}

.networkContainer {
  flex: 2;
}
</style>
