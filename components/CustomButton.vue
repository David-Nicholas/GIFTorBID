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
    border: 2px solid #2596be;
    background-color: #2596be;
    color: white;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;  
    margin-bottom: 8px;
    margin-top: 8px;
  }
  
  button:hover {
    background-color: #005566;
    border-color: #005566;
  }
  </style>
  