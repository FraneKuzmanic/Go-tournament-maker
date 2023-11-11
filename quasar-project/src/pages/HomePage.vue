<template>
  <header class="header" elevated>
    <div class="img-cont"><img class="logo" src="/Logo.png" alt="slika" /></div>
    <p style="margin: 0">Go Tournament Maker</p>
  </header>
  <main class="main-section">
    <p class="item-one">
      Make Go<br />Tournaments<br /><span class="orange-text">quickly </span>
      <span>and</span><br /><span class="orange-text">easily</span>.
    </p>
    <div class="item-two"><CreateButton /></div>
    <p class="item-three">
      Generate matchups<br />using the
      <span class="orange-text">Swiss<br />system</span> or make your<br />by
      hand!
    </p>
  </main>
  <footer class="footer">
    <div class="copyright">
      <p>&copy; All rights reserved</p>
      <p class="year">2023</p>
    </div>
    <div class="footer-img-cont">
      <img class="footer-img" src="/Fer-img-two.png" alt="slika" />
    </div>
  </footer>
</template>

<script setup lang="ts">
import CreateButton from '../components/CreateButton.vue'; // Importamo gumb za stvarat turnir
//Ova komponenta nema neku aplikacijsku logiku nego klasicni html, css
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@700&family=Raleway:wght@500&display=swap');

.header {
  height: 15vh;
  display: flex;
  font-size: 2rem;
  color: white;
  align-items: center;
  background-color: #303030;
  padding: 0rem 2rem;
  font-family: 'Raleway', sans-serif;
}

.img-cont {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 2rem;
}

.logo {
  width: 10vw;
  height: 10vw;
  min-width: 60px;
  max-width: 90px;
  min-height: 60px;
  max-height: 90px;
}

.main-section {
  background-image: url('/background.png');
  background-size: cover;
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 1.8rem;
  font-family: 'Merriweather Sans', sans-serif;
}

.item-one {
  font-size: 2rem;
  align-self: flex-start;
  margin-left: 4rem;
}

.orange-text {
  color: rgba(246, 122, 21, 0.92);
}

.item-two {
  align-self: flex-end;
  margin-right: 3rem;
}

.item-three {
  align-self: flex-end;
  margin-right: 3rem;
  text-align: end;
}

.footer {
  background-color: #303030;
  color: white;
  height: 10vh;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.copyright {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.copyright * {
  margin: 0;
  font-size: 0.7rem;
}

.footer-img-cont {
  display: flex;
  align-items: center;
}

.footer-img {
  width: 60px;
  height: 40px;
}

@media (max-width: 650px) {
  .main-section {
    font-size: 1.5rem;
  }

  .header {
    font-size: 1.5rem;
  }

  .item-one {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .main-section {
    font-size: 1.2rem;
  }

  .header {
    font-size: 1.2rem;
  }
}

@media (min-height: 760px) {
  .main-section {
    font-size: 1.5rem;
  }

  .item-one {
    font-size: 2.3rem;
  }
}
</style>
