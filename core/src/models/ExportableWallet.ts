
import {
  IsDefined,
  IsArray,
  IsOptional,
  Validate,
  ValidateNested,
  IsString,
  IsObject,
} from 'class-validator'

/**
 * Represents a Wallet JSON LD Definition
 */
export class ExportableWallet {
  constructor() {}

  @IsDefined()
  @IsString()
  '@context': string[] = ['https://w3id.org/wallet/v1']

  @IsDefined()
  @IsString()
  id: string

  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  image: string

  @IsDefined()
  @IsString()
  description: string

  @IsDefined()
  tags: string[]

  @IsDefined()
  correlation: string[]

  @IsDefined()
  type: string

  @IsDefined()
  controller: string

  @IsDefined()
  @IsObject()
  publicKeyJwk: object

  @IsOptional()
  @IsObject()
  privateKeyJwk: object

  
  //  TODO: Example https://w3c-ccg.github.io/universal-wallet-interop-spec/#Key
  
  /**
   * Returns a JSON LD representation of the class instance
   * @returns A json text conforming to json ld representation
   */
  toJsonLD() {
    return JSON.stringify(ExportableWallet as unknown as {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:53d846c8-9525-11ea-bb37-0242ac130002',
      name: 'My Test Key 1',
      image: 'https://via.placeholder.com/150',
      description: 'For testing only, totally compromised.',
      tags: ['professional', 'organization', 'compromised'],
      correlation: ['4058a72a-9523-11ea-bb37-0242ac130002'],
      controller: 'did:example:123',
      type: 'Ed25519VerificationKey2018',
      publicKeyJwk: {
        crv: 'Ed25519',
        x: 'VCpo2LMLhn6iWku8MKvSLg2ZAoC-nlOyPVQaO3FxVeQ',
        kty: 'OKP',
        kid: '_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A',
      },
      privateKeyJwk: {
        crv: 'Ed25519',
        x: 'VCpo2LMLhn6iWku8MKvSLg2ZAoC-nlOyPVQaO3FxVeQ',
        d: 'tP7VWE16yMQWUO2G250yvoevfbfxY25GjHglTP3ZOyU',
        kty: 'OKP',
        kid: '_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A',
      },
    })
  }
}
