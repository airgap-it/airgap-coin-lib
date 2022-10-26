import { LazyAsync } from '@airgap/coinlib-core/data/Lazy'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { chunkedArray } from '@airgap/coinlib-core/utils/array'
import { changeEndianness, hexToBytes, toHexString } from '@airgap/coinlib-core/utils/hex'
import * as sapling from '@airgap/sapling-wasm'

import { TezosSaplingCiphertext } from '../../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingStateDiff } from '../../types/sapling/TezosSaplingStateDiff'
import { MerkleTree, TezosSaplingStateTree } from '../../types/sapling/TezosSaplingStateTree'

export class TezosSaplingState {
  private readonly uncommitedMerkleHash: string = '0100000000000000000000000000000000000000000000000000000000000000'
  private readonly uncommitedMerkleHashes: LazyAsync<Buffer[]> = new LazyAsync(() => this.createUncommitedMerkleHashes())

  private stateTree: TezosSaplingStateTree | undefined

  constructor(public readonly treeHeight: number) {}

  public async getStateTreeFromStateDiff(
    saplingStateDiff: TezosSaplingStateDiff,
    skipConstruction: boolean = false
  ): Promise<TezosSaplingStateTree> {
    if (this.stateTree !== undefined && this.stateTree.root === saplingStateDiff.root) {
      return this.stateTree
    }

    const commitments: string[] = saplingStateDiff.commitments_and_ciphertexts.map(
      ([commitment, _]: [string, TezosSaplingCiphertext]) => commitment
    )

    let merkleTree: MerkleTree
    if (!skipConstruction) {
      merkleTree = await this.constructMerkleTree(commitments, 0)
      await this.verifyMerkleTree(merkleTree, saplingStateDiff.root)
    }

    this.stateTree = {
      height: this.treeHeight,
      size: commitments.length,
      root: saplingStateDiff.root,
      tree: merkleTree
    }

    return this.stateTree
  }

  public async getWitness(stateTree: TezosSaplingStateTree, position: BigNumber): Promise<string> {
    const heightBuffer: Buffer = hexToBytes(changeEndianness(toHexString(stateTree.height)))
    const positionBuffer: Buffer = hexToBytes(changeEndianness(toHexString(position, 64)))

    const neighboringHashes: Buffer[] = await this.getNeighboringHashes([], stateTree.height, position, stateTree.tree)

    const witness: Buffer = neighboringHashes
      .map((hash: Buffer) => Buffer.concat([hexToBytes(changeEndianness(toHexString(hash.length))), hash]))
      .reverse()
      .reduce((acc: Buffer, next: Buffer) => Buffer.concat([acc, next]))

    return Buffer.concat([heightBuffer, witness, positionBuffer]).toString('hex')
  }

  private async constructMerkleTree(children: MerkleTree[], height: number): Promise<MerkleTree> {
    if (height === this.treeHeight && children.length === 1) {
      return children[0]
    }

    if (height === this.treeHeight || children.length > Math.pow(2, this.treeHeight - 1 - height)) {
      return Promise.reject('Invalid Merkle tree')
    }

    const chunkedChildren: MerkleTree[][] = chunkedArray(children, 2)
    const newChildren: MerkleTree[] = await Promise.all(
      chunkedChildren.map(async (chunk: MerkleTree[]) => {
        const [lhs, rhs]: [Buffer, Buffer] = await Promise.all([this.getMerkleHash(chunk[0], height), this.getMerkleHash(chunk[1], height)])

        const parentHash = await sapling.merkleHash(height, lhs, rhs)

        return [parentHash.toString('hex'), chunk[0], chunk[1]] as [string, MerkleTree, MerkleTree]
      })
    )

    return this.constructMerkleTree(newChildren, height + 1)
  }

  private async verifyMerkleTree(tree: MerkleTree, expectedRoot: string): Promise<void> {
    const root: Buffer = await this.getMerkleHash(tree, this.treeHeight - 1)

    if (root.toString('hex') !== expectedRoot) {
      return Promise.reject('Merkle tree root is invalid')
    }
  }

  private async getMerkleHash(tree: MerkleTree, height: number): Promise<Buffer> {
    if (tree === undefined) {
      return (await this.uncommitedMerkleHashes.get())[height]
    } else if (typeof tree === 'string') {
      return Buffer.from(tree, 'hex')
    } else {
      return Buffer.from(tree[0], 'hex')
    }
  }

  private async createUncommitedMerkleHashes(): Promise<Buffer[]> {
    const res: Buffer[] = new Array(this.treeHeight)
    res[0] = Buffer.from(this.uncommitedMerkleHash, 'hex')
    for (var i = 0; i < this.treeHeight; i++) {
      const hash: Buffer = res[i]
      res[i + 1] = await sapling.merkleHash(i, hash, hash)
    }

    return res
  }

  private async getNeighboringHashes(acc: Buffer[], height: number, position: BigNumber, tree: MerkleTree): Promise<Buffer[]> {
    if (typeof tree === 'undefined') {
      return Promise.reject('Invalid tree')
    } else if (typeof tree === 'string') {
      return acc
    } else {
      const full: BigNumber = new BigNumber(2).pow(height - 1)
      const [nextPosition, nextTree, otherTree]: [BigNumber, MerkleTree, MerkleTree] = position.lt(full)
        ? [position, tree[1], tree[2]]
        : [position.minus(full), tree[2], tree[1]]

      return this.getNeighboringHashes([await this.getMerkleHash(otherTree, height - 1), ...acc], height - 1, nextPosition, nextTree)
    }
  }
}
