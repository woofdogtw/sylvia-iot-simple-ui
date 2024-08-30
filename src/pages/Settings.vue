<template>
  <q-page>
    <!-- Language -->
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

    <!-- Theme -->
    <q-card>
      <q-card-section>{{ $t('settings.theme') }}</q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list>
          <q-item>
            <q-radio
              v-model="theme"
              dense
              val="auto"
              :label="$t('theme.auto')"
              @update:model-value="setTheme"
            />
          </q-item>

          <q-item>
            <q-radio
              v-model="theme"
              dense
              val="dark"
              :label="$t('theme.dark')"
              @update:model-value="setTheme"
            />
          </q-item>

          <q-item>
            <q-radio
              v-model="theme"
              dense
              val="light"
              :label="$t('theme.light')"
              @update:model-value="setTheme"
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
    this.theme = this.store.getTheme();
  },

  data() {
    return {
      language: '',
      theme: '',
    };
  },

  methods: {
    setLanguage(language) {
      this.store.setLanguage(language);
      this.language = language;
      this.$i18n.locale = language;
    },
    setTheme(theme) {
      this.store.setTheme(theme);
      this.theme = theme;
      switch (theme) {
        case 'dark':
          this.$q.dark.set(true);
          break;
        case 'light':
          this.$q.dark.set(false);
          break;
        default:
          this.$q.dark.set('auto');
          break;
      }
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
