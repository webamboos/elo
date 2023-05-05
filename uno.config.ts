import { defineConfig } from 'unocss'
import { presetForms } from '@julr/unocss-preset-forms'
import { presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetForms()
  ]
})
