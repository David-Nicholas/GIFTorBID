<template>
    <button @click="handleClick">{{ buttonText }}</button>
  </template>
  
  <script>
  export default {
    props: {
      buttonText: {
        type: String,
        required: true
      }
    },
    methods: {
      handleClick() {
        this.$emit('activate');
      }
    }
  }
  </script>
  
  <style scoped>
  button {
    background-color: #2596be;
    color: white;
    padding: 8px 8px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;  
  }
  
  button:hover {
    background-color: #005566;
    border-color: #005566;
  }
  </style>
  