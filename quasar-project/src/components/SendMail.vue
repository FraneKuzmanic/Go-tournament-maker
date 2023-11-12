<template>
  <div class="q-pa-md" style="background-color: #303030;">
    <div class="row justify-center"> 
      <div class="q-mr-md" >
        <q-btn @click="adminURL" class="glossy" id="buttons" v-if="!openMailInput" label="Email for admin" />
      </div>
      <div class="q-ml-md">
        <q-btn @click="userURL" class="glossy" id="buttons" v-if="!openMailInput" label="Email for user" />
      </div>
    </div>
    <q-form class="q-gutter-md " v-if="openMailInput" @submit.prevent="sendEmail" style="text-align: center;">
      <q-input label="Your email" filled type="email" v-model="to" required lazy-rules style="background-color: white;  width: 50%; margin: 20px auto 0;"/>
      <q-btn type="submit"  style="background-color: white;">Send Email</q-btn>
    </q-form>
  </div>
</template>

<style> 
#buttons {
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
}
#id{
  
}
</style>

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
          .then((response: Response) => {
            console.log('Email sent:', response);
            alert('Email sent successfully!');
          })
          .catch((error: Error) => {
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
