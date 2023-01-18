import { MichelineCodeNode, MichelineDataNode, MichelineTypeNode } from '../micheline/MichelineNode'

interface MetadataLicense {
  name: string
  details?: string
}

interface MetadataSource {
  tools?: string
  location?: string
}

interface MetadataErrorBase {
  languages?: string[]
}

interface MetadataErrorStatic extends MetadataErrorBase {
  error: MichelineDataNode
  expansion: MichelineDataNode
}

interface MetadataErrorDynamic extends MetadataErrorBase {
  view: string
}

type MetadataError = MetadataErrorStatic | MetadataErrorDynamic

interface MetadataAnnotation {
  name: string
  description: string
}

interface MetadataMichelsonStorageView {
  parameter?: MichelineTypeNode
  returnType: MichelineTypeNode
  code: MichelineCodeNode
  annotations?: MetadataAnnotation[]
  version?: string
}

interface MetadataRestApiQuery {
  specificationUri: string
  baseUri?: string
  path: string
  method?: string
}

type MetadataViewImplementations = { michelsonStorageView: MetadataMichelsonStorageView } | { restApiQuery: MetadataRestApiQuery }

interface MetadataView {
  name: string
  description?: string
  implementations: MetadataViewImplementations[]
  pure?: boolean
}

export interface TezosContractMetadata {
  name?: string
  description?: string
  version?: string
  license?: MetadataLicense
  authors?: string[]
  homepage?: string
  source?: MetadataSource
  interfaces?: string[]
  errors?: MetadataError[]
  views?: MetadataView[]
}
