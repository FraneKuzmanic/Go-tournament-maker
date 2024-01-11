<template>
  <q-btn
    class="q-ml-md"
    color="white"
    text-color="black"
    @click="toggleMail"
    label="POŠALJI MAIL"
  />
  <q-dialog v-model="isInput">
  <div v-if="isInput" class="q-pa-md" style="background-color: white">
    <div class="" style="display: flex; justify-content: space-between; align-items: center;">
      <div class="">
        <q-btn
          @click="adminURL"
          
          id="buttons"
          v-if="!openMailInput"
          label="Email for admin"
          style="margin-right: 10px;"
        />
      </div>
      <div class="">
        <q-btn
          @click="userURL"
          
          id="buttons"
          v-if="!openMailInput"
          label="Email for user"
          style="margin-left: 10px;"
        />
      </div>
    </div>
    <q-form
      class="q-gutter-md"
      v-if="openMailInput"
      @submit.prevent="sendEmail"
      style="text-align: center"
    >
      <q-input
        label="Your email"
        filled
        type="email"
        v-model="to"
        required
        lazy-rules
        style="background-color: white; width: 80%; margin: 20px auto 0"
      />
      <q-btn type="submit"   style="background-color: white">Send Email</q-btn>
      <q-btn @click="closeForm"   style="background-color: white">Close</q-btn>
    </q-form>
  </div>
   </q-dialog>
</template>

<style>
/* #buttons {
  background-color: rgba(246, 122, 21, 0.92);
  font-size: 1rem;
  color: white;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  width: 35vw;
  border-radius: 14px;
  border: none;
  padding: 0.7rem 1.2rem;
  max-width: 250px;
  cursor: pointer;
} */
</style>

<script lang="ts">
import emailjs from 'emailjs-com';
import { useRoute } from 'vue-router';
import { ref, Ref, defineComponent, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const route = useRoute();
    const to = ref('');
    const subject = ref('URL');
    const message = ref('');
    const openMailInput = ref(false);
    const isInput: Ref<boolean> = ref(false);

    const closeForm = () => {
      openMailInput.value = false;
    };

    const adminURL = () => {
      const hasCreatorId =
        route.params.creatorId !== undefined && route.params.creatorId !== '';

      if (hasCreatorId) {
        message.value = window.location.href;
      } else {
        message.value =
          window.location.href + localStorage.getItem('creatorId');
      }
      openMailInput.value = true;
    };

    const userURL = () => {
      message.value = window.location.href;

      if (route.params.creatorId !== undefined) {
        const lastSlashIndex = message.value.lastIndexOf('/');
        message.value = message.value.substring(0, lastSlashIndex);
      }
      openMailInput.value = true;
    };

    const toggleMail = () => {
      isInput.value = !isInput.value;
    };

    const sendEmail = () => {
      const templateParams = {
        to: to.value,
        subject: subject.value,
        message: message.value,
      };

      emailjs
        .send(
          'service_4onromu',
          'template_pe1ui4u',
          templateParams,
          'VV9vJMN1YIRQDseRH'
        )
        .then((response: any) => {
          console.log('Email sent:', response);
          alert('Email sent successfully!');
        })
        .catch((error: Error) => {
          console.error('Error sending email:', error);
          alert('Error sending email. Please try again.');
        });

      to.value = '';
      isInput.value = false;
    };

    return {
      to,
      subject,
      message,
      openMailInput,
      adminURL,
      userURL,
      sendEmail,
      closeForm,
      isInput,
      toggleMail,
    };
  },
});
</script>
