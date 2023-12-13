<template>
    <div class="outcome-container">
        <div class="outcome-button" id="outcome-left">
            +1
        </div>
        <div class="outcome-button" id="outcome-middle">
            +0.5/+0.5
        </div>
        <div class="outcome-button" id="outcome-right">
            +1
        </div>
    </div>

</template>

<script>
    export default {
        return: {

        }
    }
</script>

<style>
    .outcome-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        min-height: 50px;
        width: 80%;
        background-color: rgb(44, 51, 66);
        margin: auto;
        
    }

    .outcome-button {
        width: 30%;
        background-color: blue;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .outcome-button:hover {
        background-color: brown;
    }
</style>