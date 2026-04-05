import { describe, it, expect, beforeAll } from 'vitest'
import * as snarkjs from 'snarkjs'
import * as path from 'path'
import * as fs from 'fs'

const CIRCUITS_DIR = path.join(__dirname, '..', '..', 'circuits')

function encodeGroth16Proof(proof: any): { pi_a: Uint8Array; pi_b: Uint8Array; pi_c: Uint8Array } {
  const pi_a = new Uint8Array(96)
  const pi_b = new Uint8Array(192)
  const pi_c = new Uint8Array(96)
  
  const a0 = BigInt(proof.pi_a[0])
  const a1 = BigInt(proof.pi_a[1])
  pi_a.set(toHexBytes(a0, 32), 0)
  pi_a.set(toHexBytes(a1, 32), 32)
  
  const b00 = BigInt(proof.pi_b[0][0])
  const b01 = BigInt(proof.pi_b[0][1])
  const b10 = BigInt(proof.pi_b[1][0])
  const b11 = BigInt(proof.pi_b[1][1])
  pi_b.set(toHexBytes(b00, 32), 0)
  pi_b.set(toHexBytes(b01, 32), 32)
  pi_b.set(toHexBytes(b10, 64))
  pi_b.set(toHexBytes(b11, 32), 128)
  
  const c0 = BigInt(proof.pi_c[0])
  const c1 = BigInt(proof.pi_c[1])
  pi_c.set(toHexBytes(c0, 32), 0)
  pi_c.set(toHexBytes(c1, 32), 32)
  
  return { pi_a, pi_b, pi_c }
}

function toHexBytes(num: bigint, len: number): Uint8Array {
  const hex = num.toString(16).padStart(len * 2, '0')
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[len - 1 - i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function computeDocumentHash(bytes: Uint8Array): number {
  const sum = bytes.reduce((a, b) => a + b, 0)
  return sum * 1000000
}

describe('ZK-Digi Integration Tests', () => {
  
  describe('Circuit Files', () => {
    it('should have all required circuit files', () => {
      const required = [
        'doc_verifier.r1cs',
        'doc_verifier.wasm',
        'doc_verifier_final.zkey',
        'verification_key.json',
        'doc_verifier.sym'
      ]
      
      required.forEach(file => {
        const filePath = path.join(CIRCUITS_DIR, file)
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true)
      })
    })
    
    it('should have valid WASM file size', () => {
      const wasmPath = path.join(CIRCUITS_DIR, 'doc_verifier.wasm')
      const stats = fs.statSync(wasmPath)
      expect(stats.size).toBeGreaterThan(10000)
    })
    
    it('should have valid zkey file', () => {
      const zkeyPath = path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey')
      const stats = fs.statSync(zkeyPath)
      expect(stats.size).toBeGreaterThan(1000)
    })
  })
  
  describe('Proof Generation', () => {
    let wasmBuffer: Buffer
    let zkeyBuffer: Buffer
    let vKey: any
    
    beforeAll(() => {
      wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
    })
    
    it('should generate proof with correct structure', async () => {
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      expect(proof.pi_a).toBeDefined()
      expect(proof.pi_b).toBeDefined()
      expect(proof.pi_c).toBeDefined()
      expect(proof.pi_a).toHaveLength(3)
      expect(proof.pi_b).toHaveLength(3)
      expect(proof.pi_c).toHaveLength(3)
    })
    
    it('should verify against correct vKey', async () => {
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      expect(isValid).toBe(true)
    })
    
    it('should produce deterministic public signals', async () => {
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      expect(publicSignals[0]).toBe('266000000')
      expect(publicSignals[1]).toBe('65')
      expect(publicSignals[2]).toBe('66')
      expect(publicSignals[3]).toBe('67')
      expect(publicSignals[4]).toBe('68')
    })
  })
  
  describe('Hash Computation', () => {
    it('should compute correct hash for ABCD', () => {
      const bytes = new Uint8Array([65, 66, 67, 68])
      const hash = computeDocumentHash(bytes)
      expect(hash).toBe(266000000)
    })
    
    it('should compute correct hash for empty array', () => {
      const bytes = new Uint8Array([])
      const hash = computeDocumentHash(bytes)
      expect(hash).toBe(0)
    })
    
    it('should compute correct hash for single byte', () => {
      const bytes = new Uint8Array([100])
      const hash = computeDocumentHash(bytes)
      expect(hash).toBe(100000000)
    })
  })
  
  describe('Proof Encoding', () => {
    it('should encode proof to correct byte lengths', async () => {
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      const encoded = encodeGroth16Proof(proof)
      
      expect(encoded.pi_a.length).toBe(96)
      expect(encoded.pi_b.length).toBe(192)
      expect(encoded.pi_c.length).toBe(96)
    })
    
    it('should encode proof with valid bigint values', async () => {
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      const encoded = encodeGroth16Proof(proof)
      
      const pi_a_sum = Array.from(encoded.pi_a).reduce((a, b) => a + b, 0)
      const pi_b_sum = Array.from(encoded.pi_b).reduce((a, b) => a + b, 0)
      const pi_c_sum = Array.from(encoded.pi_c).reduce((a, b) => a + b, 0)
      
      expect(pi_a_sum).toBeGreaterThan(0)
      expect(pi_b_sum).toBeGreaterThan(0)
      expect(pi_c_sum).toBeGreaterThan(0)
    })
  })
  
  describe('Verification Key', () => {
    it('should have correct protocol', () => {
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      expect(vKey.protocol).toBe('groth16')
    })
    
    it('should have bn128 curve', () => {
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      expect(vKey.curve).toBe('bn128')
    })
    
    it('should have valid vk_alpha_1', () => {
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      expect(vKey.vk_alpha_1).toBeDefined()
      expect(vKey.vk_alpha_1).toHaveLength(3)
    })
    
    it('should have valid IC (public input commitments)', () => {
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      expect(vKey.IC).toBeDefined()
      expect(vKey.IC.length).toBe(6)
    })
  })
})