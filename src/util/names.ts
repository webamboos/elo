import { uniqueNamesGenerator, Config, names, colors } from 'unique-names-generator'

const config: Config = {
  dictionaries: [colors, names],
  separator: ' ',
  length: 2,
}

export const generateName = () => uniqueNamesGenerator(config)
