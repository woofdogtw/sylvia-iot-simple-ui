<template>
  <q-page>
    <q-card>
      <q-card-section>{{ $t('settings.language') }}</q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list>
          <q-item>
            <q-radio
              v-model="language"
              dense
              val="en-us"
              :label="$t('language.en-us')"
              @update:model-value="setLanguage"
            />
          </q-item>

          <q-item>
            <q-radio
              v-model="language"
              dense
              val="zh-tw"
              :label="$t('language.zh-tw')"
              @update:model-value="setLanguage"
            />
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'SettingsPage',

  created() {
    this.language = this.store.getLanguage();
  },

  data() {
    return {
      language: '',
    };
  },

  methods: {
    setLanguage(language) {
      this.store.setLanguage(language);
      this.language = language;
      this.$i18n.locale = language;
    },
  },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
