<template>
  <div class="q-pa-md">
    <div>
      <q-btn @click="adminURL" class="glossy" color="teal" v-if="!openMailInput" label="Email for admin" />
      <q-btn @click="userURL" class="glossy" color="teal" v-if="!openMailInput" label="Email for user" />
    </div>
    <q-form class="q-gutter-md" v-if="openMailInput" @submit.prevent="sendEmail">
      <q-input label="Your email" filled type="email" v-model="to" required lazy-rules/>
      <q-btn type="submit">Send Email</q-btn>
    </q-form>
  </div>
</template>

<script lang="ts">
  import emailjs from 'emailjs-com';
  import { useRoute } from 'vue-router';
  import { ref, defineComponent } from 'vue';

  export default defineComponent({
    setup() {
      const route = useRoute();
      const to = ref('');
      const subject = ref('URL');
      const message = ref('');
      const openMailInput = ref(false);

      const adminURL = () => {
        const hasCreatorId = route.params.creatorId !== undefined && route.params.creatorId !== '';

        if (hasCreatorId) {
          message.value = window.location.href;
        } else {
          message.value = window.location.href + localStorage.getItem('creatorId');
        }
        openMailInput.value = true;
      };

      const userURL = () => {
        const routeParts = route.path.split('/');

        // Ako postoji creatorId, ukloni ga iz posljednjeg dijela putanje
        if (route.params.creatorId !== undefined) {
          routeParts.pop();
        }
        // Sastavi putanju bez posljednjeg dijela koji sadrži creatorId
        const newPathWithoutCreatorId = routeParts.join('/');

        // Dohvati cijeli URL bez creatorId
        message.value = window.location.origin + newPathWithoutCreatorId;
        openMailInput.value = true;
      };

      const sendEmail = () => {
        const templateParams = {
          to: to.value,
          subject: subject.value,
          message: message.value,
        };

        emailjs.send(
          'service_4onromu',
          'template_pe1ui4u',
          templateParams,
          'VV9vJMN1YIRQDseRH'
        )
          .then((response) => {
            console.log('Email sent:', response);
            alert('Email sent successfully!');
          })
          .catch((error) => {
            console.error('Error sending email:', error);
            alert('Error sending email. Please try again.');
          });
      };

      return {
        to,
        subject,
        message,
        openMailInput,
        adminURL,
        userURL,
        sendEmail,
      };
    },
  });
</script>
