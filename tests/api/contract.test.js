import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, test } from 'vitest'

import championsMock from '@/api/mocks/champions'
import matchMock from '@/api/mocks/match'
import matchesMock from '@/api/mocks/matches'
import summaryMock from '@/api/mocks/summary'

const schemaId = 'https://recall.local/openapi.json'
const contractPath = resolve('docs/openapi.json')
const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
const ajv = new Ajv2020({ strict: false, allErrors: true })

ajv.addSchema(contract, schemaId)

function getResponseValidator(endpoint) {
  const pointer = endpoint.replaceAll('~', '~0').replaceAll('/', '~1')
  const schemaReference =
    `${schemaId}#/paths/${pointer}` + '/get/responses/200/content/application~1json/schema'
  const validator = ajv.getSchema(schemaReference)

  if (!validator) {
    throw new Error(`Response schema validator not found for GET ${endpoint}`)
  }

  return validator
}

function formatValidationErrors(errors) {
  if (!errors?.length) {
    return 'Ajv did not provide validation error details.'
  }

  return errors
    .map(({ instancePath, message, params }) => {
      const path = instancePath || '/'

      return `${path}: ${message} (${JSON.stringify(params)})`
    })
    .join('\n')
}

describe('API mock contracts', () => {
  test('summary mock matches the GET /summary contract', () => {
    // Arrange
    const endpoint = '/summary'
    const validator = getResponseValidator(endpoint)

    // Act
    const isValid = validator(summaryMock)
    const validationErrors = formatValidationErrors(validator.errors)

    // Assert
    expect(
      isValid,
      `Mock does not match the GET ${endpoint} response contract:\n${validationErrors}`,
    ).toBe(true)
  })

  test('champions mock matches the GET /champions contract', () => {
    // Arrange
    const endpoint = '/champions'
    const validator = getResponseValidator(endpoint)

    // Act
    const isValid = validator(championsMock)
    const validationErrors = formatValidationErrors(validator.errors)

    // Assert
    expect(
      isValid,
      `Mock does not match the GET ${endpoint} response contract:\n${validationErrors}`,
    ).toBe(true)
  })

  test('matches mock matches the GET /matches contract', () => {
    // Arrange
    const endpoint = '/matches'
    const validator = getResponseValidator(endpoint)

    // Act
    const isValid = validator(matchesMock)
    const validationErrors = formatValidationErrors(validator.errors)

    // Assert
    expect(
      isValid,
      `Mock does not match the GET ${endpoint} response contract:\n${validationErrors}`,
    ).toBe(true)
  })

  test('match mock matches the GET /matches/{gameMatch} contract', () => {
    // Arrange
    const endpoint = '/matches/{gameMatch}'
    const validator = getResponseValidator(endpoint)

    // Act
    const isValid = validator(matchMock)
    const validationErrors = formatValidationErrors(validator.errors)

    // Assert
    expect(
      isValid,
      `Mock does not match the GET ${endpoint} response contract:\n${validationErrors}`,
    ).toBe(true)
  })
})
