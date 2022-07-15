<template>
  <div>
    <transition name="fade" appear>
      <div class="mymodal-overlay" 
           v-if="active" 
           @click="close"></div>
    </transition>
    <transition name="pop" appear>
      <div class="mymodal" 
           role="dialog" 
           v-if="active"
           >
        <div style="position: relative;">
          <div class="close-btn" @click="close"><font-awesome-icon color="#13d5fe" icon="times"/></div>
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['active'],
  components: {
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
html {
  height: 100%;
  background: #FFF;
  color: #000;
  font-size: 62.5%;
}

body {
  min-height: 100%;
  margin: 0;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
}

.button {
  border: none;
  color: #FFF;
  background: #42b983;
  appearance: none;
  font: inherit;
  font-size: 1.8rem;
  padding: .5em 1em;
  border-radius: .3em;
  cursor: pointer;
}

.close-btn {
  position: absolute;
  
  width: 44px;
  height: 44px;

  right: -1.5rem;
  top: -1.5rem;
  border-radius: 50%;

  background: #ffffff;
  border: 4px solid #13d5fe;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
}
.mymodal {
  position: absolute;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  text-align: center;
  width: fit-content;
  height: fit-content;
  /* max-width: 22em; */
  /* padding: 2rem; */
  border-radius: 1rem;
  /* box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2); */
  /* background: #FFF; */
  z-index: 99999999999999999999;
  transform: none;

  background: #FFFFFF;
  border: 6px solid #13d5fe;
  border-radius: 20px;
}
.mymodal h1 {
  margin: 0 0 1rem;
}

.mymodal-overlay {
  content: '';
  position: absolute;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999999999999999999;
  background: #2c3e50;
  opacity: 0.6;
  cursor: pointer;
}

/* ---------------------------------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(-50%);
}


@media(max-width: 600px) {
  .mymodal {
    width: 90%;
    min-width: 90%;
  }

}
</style>